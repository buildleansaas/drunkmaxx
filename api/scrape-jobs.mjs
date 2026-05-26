import { Buffer } from 'node:buffer';
import { createScrapeJob } from '../lib/scrapeJobs.mjs';
import { getMongoUriStatus } from '../lib/mongo.mjs';

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('cache-control', 'no-store');
  response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('allow', 'POST');
    return sendJson(response, 405, { error: 'Method not allowed' });
  }

  if (!getMongoUriStatus()) {
    return sendJson(response, 503, { error: 'MONGO_URI is not configured for scrape jobs' });
  }

  try {
    const input = await readJsonBody(request);
    const job = await createScrapeJob(input);
    return sendJson(response, 202, { jobId: job.jobId, job });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create scrape job';
    const statusCode = message.includes('must be') || message.includes('JSON') ? 400 : 500;
    return sendJson(response, statusCode, { error: message });
  }
}
