#!/usr/bin/env node

import { getMongoUriStatus } from '../lib/mongo.mjs';
import { claimQueuedScrapeJob, completeScrapeJob, failScrapeJob } from '../lib/scrapeJobs.mjs';

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  const getValue = (name, fallback) => {
    const prefix = `${name}=`;
    const match = argv.slice(2).find((arg) => arg.startsWith(prefix));
    return match ? match.slice(prefix.length) : fallback;
  };

  return {
    once: args.has('--once'),
    dryRun: args.has('--dry-run'),
    workerId: getValue('--worker-id', `drunkmaxx-worker-${process.pid}`),
    staleAfterMinutes: Number(getValue('--stale-after-minutes', '20')),
  };
}

function buildMarkedWorkerResults(job) {
  const primaryTerms = (job.searchTerms || []).slice(0, 6);
  return [
    {
      type: 'worker_scaffold_marker',
      title: 'Worker scaffold claimed this job',
      source: 'drunkmaxx-worker-scaffold',
      summary: 'No live venue scraping has run yet. This marked result proves the queue claim/writeback loop works.',
      zip: job.zip,
      searchTerms: primaryTerms,
      generatedAt: new Date().toISOString(),
    },
  ];
}

async function runOnce(options) {
  const configured = getMongoUriStatus();
  if (!configured) {
    console.error('MONGO_URI is not configured; worker cannot claim jobs.');
    process.exitCode = 2;
    return;
  }

  const job = await claimQueuedScrapeJob({
    workerId: options.workerId,
    staleAfterMinutes: options.staleAfterMinutes,
  });

  if (!job) {
    console.log('No queued scrape jobs found.');
    return;
  }

  console.log(`Claimed scrape job ${job.jobId} for ZIP ${job.zip}.`);

  if (options.dryRun) {
    console.log('Dry run requested; leaving claimed job running for operator inspection.');
    return;
  }

  try {
    const completed = await completeScrapeJob(job.jobId, buildMarkedWorkerResults(job), {
      workerId: options.workerId,
      mode: 'scaffold',
      liveScrape: false,
    });
    console.log(`Completed scrape job ${completed.jobId} with scaffold marker output.`);
  } catch (error) {
    await failScrapeJob(job.jobId, error);
    throw error;
  }
}

const options = parseArgs(process.argv);

if (!options.once) {
  console.error('Only --once mode is supported in this scaffold slice.');
  process.exit(1);
}

runOnce(options).catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
