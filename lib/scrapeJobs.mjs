import { ObjectId } from 'mongodb';
import { getMongoDb } from './mongo.mjs';

export const SCRAPE_JOBS_COLLECTION = 'drunkmaxx_scrape_jobs';

export const SCRAPE_JOB_STATUSES = Object.freeze({
  queued: 'queued',
  running: 'running',
  complete: 'complete',
  failed: 'failed',
  stale: 'stale',
});

const ZIP_PATTERN = /^\d{5}$/;
const PHONE_PATTERN = /^\+?[0-9().\-\s]{7,20}$/;

export function normalizeZip(zip) {
  const value = String(zip || '').trim();
  if (!ZIP_PATTERN.test(value)) {
    throw new Error('zip must be a 5 digit ZIP code');
  }
  return value;
}

export function normalizePhone(phone) {
  if (phone === undefined || phone === null || String(phone).trim() === '') {
    return null;
  }
  const value = String(phone).trim();
  if (!PHONE_PATTERN.test(value)) {
    throw new Error('phone must be a valid phone-shaped string');
  }
  return value;
}

export function buildSearchTerms(zip, locality) {
  const baseTerms = [
    `${zip} bar`,
    `${zip} bars`,
    `${zip} brewery`,
    `${zip} winery`,
    `${zip} cocktail bar`,
    `${zip} sports bar`,
    `${zip} pub`,
    `${zip} tavern`,
    `${zip} restaurant drinks`,
    `${zip} happy hour`,
    `${zip} alcohol`,
    `${zip} beer`,
    `${zip} wine`,
  ];

  const localityLabel = [locality?.city, locality?.state].filter(Boolean).join(' ').trim();
  const localityTerms = localityLabel
    ? [
        `${localityLabel} bars`,
        `${localityLabel} brewery`,
        `${localityLabel} winery`,
        `${localityLabel} happy hour`,
        `${localityLabel} cocktail bar`,
        `${localityLabel} restaurant drinks`,
      ]
    : [];

  return Array.from(new Set([...baseTerms, ...localityTerms]));
}

export function serializeJob(job) {
  if (!job) return null;
  return {
    jobId: String(job._id),
    zip: job.zip,
    phone: job.phone || null,
    source: job.source,
    status: job.status,
    searchTerms: job.searchTerms || [],
    results: job.results || [],
    error: job.error || null,
    attempts: job.attempts || 0,
    createdAt: job.createdAt?.toISOString?.() || job.createdAt,
    updatedAt: job.updatedAt?.toISOString?.() || job.updatedAt,
    startedAt: job.startedAt?.toISOString?.() || job.startedAt || null,
    completedAt: job.completedAt?.toISOString?.() || job.completedAt || null,
  };
}

export async function ensureScrapeJobIndexes() {
  const db = await getMongoDb();
  const collection = db.collection(SCRAPE_JOBS_COLLECTION);
  await Promise.all([
    collection.createIndex({ status: 1, createdAt: 1 }),
    collection.createIndex({ zip: 1, status: 1, createdAt: -1 }),
    collection.createIndex({ phone: 1, createdAt: -1 }, { sparse: true }),
  ]);
}

export async function createScrapeJob(input) {
  const zip = normalizeZip(input?.zip);
  const phone = normalizePhone(input?.phone);
  const now = new Date();
  const source = String(input?.source || 'drunkmaxx-web').slice(0, 80);
  const locality = input?.locality && typeof input.locality === 'object' ? input.locality : null;

  const job = {
    zip,
    phone,
    source,
    status: SCRAPE_JOB_STATUSES.queued,
    createdAt: now,
    updatedAt: now,
    searchTerms: buildSearchTerms(zip, locality),
    attempts: 0,
    results: [],
    error: null,
    locality,
  };

  const db = await getMongoDb();
  const collection = db.collection(SCRAPE_JOBS_COLLECTION);
  await ensureScrapeJobIndexes();
  const result = await collection.insertOne(job);
  return serializeJob({ ...job, _id: result.insertedId });
}

export async function getScrapeJob(jobId) {
  if (!ObjectId.isValid(jobId)) {
    throw new Error('jobId must be a valid Mongo ObjectId');
  }
  const db = await getMongoDb();
  const job = await db.collection(SCRAPE_JOBS_COLLECTION).findOne({ _id: new ObjectId(jobId) });
  return serializeJob(job);
}

export async function claimQueuedScrapeJob({ workerId = 'drunkmaxx-worker', staleAfterMinutes = 20 } = {}) {
  const db = await getMongoDb();
  const collection = db.collection(SCRAPE_JOBS_COLLECTION);
  await ensureScrapeJobIndexes();

  const now = new Date();
  const staleBefore = new Date(now.getTime() - staleAfterMinutes * 60 * 1000);
  const result = await collection.findOneAndUpdate(
    {
      $or: [
        { status: SCRAPE_JOB_STATUSES.queued },
        { status: SCRAPE_JOB_STATUSES.running, startedAt: { $lt: staleBefore } },
      ],
    },
    {
      $set: {
        status: SCRAPE_JOB_STATUSES.running,
        workerId,
        startedAt: now,
        updatedAt: now,
        error: null,
      },
      $inc: { attempts: 1 },
    },
    {
      sort: { createdAt: 1 },
      returnDocument: 'after',
    },
  );

  return serializeJob(result);
}

export async function completeScrapeJob(jobId, results = [], metadata = {}) {
  if (!ObjectId.isValid(jobId)) {
    throw new Error('jobId must be a valid Mongo ObjectId');
  }
  const now = new Date();
  const db = await getMongoDb();
  const result = await db.collection(SCRAPE_JOBS_COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(jobId), status: SCRAPE_JOB_STATUSES.running },
    {
      $set: {
        status: SCRAPE_JOB_STATUSES.complete,
        results,
        workerMetadata: metadata,
        updatedAt: now,
        completedAt: now,
        error: null,
      },
    },
    { returnDocument: 'after' },
  );
  return serializeJob(result);
}

export async function failScrapeJob(jobId, error) {
  if (!ObjectId.isValid(jobId)) {
    throw new Error('jobId must be a valid Mongo ObjectId');
  }
  const now = new Date();
  const db = await getMongoDb();
  const result = await db.collection(SCRAPE_JOBS_COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(jobId), status: SCRAPE_JOB_STATUSES.running },
    {
      $set: {
        status: SCRAPE_JOB_STATUSES.failed,
        updatedAt: now,
        completedAt: now,
        error: String(error?.message || error || 'worker failed').slice(0, 1000),
      },
    },
    { returnDocument: 'after' },
  );
  return serializeJob(result);
}
