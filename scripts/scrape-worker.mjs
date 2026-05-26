#!/usr/bin/env node

import { getMongoUriStatus } from '../lib/mongo.mjs';
import { claimQueuedScrapeJob, completeScrapeJob, failScrapeJob } from '../lib/scrapeJobs.mjs';
import { buildSourceAdapterResults } from '../lib/sourceAdapter.mjs';

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

function buildAdapterWorkerResults(job) {
  const candidates = buildSourceAdapterResults(job);
  return [
    {
      type: 'source_adapter_summary',
      title: 'Source adapter generated conservative venue/deal candidates',
      source: 'adapter_v1',
      summary: 'Adapter output is evidence-linked and marked non-live. No SMS, outreach, or live deal claims were sent.',
      zip: job.zip,
      candidateCount: candidates.length,
      liveScrape: false,
      generatedAt: new Date().toISOString(),
      warnings: ['Review evidence before publishing or sending any recommendation.'],
    },
    ...candidates,
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
    const completed = await completeScrapeJob(job.jobId, buildAdapterWorkerResults(job), {
      workerId: options.workerId,
      mode: 'adapter_v1',
      liveScrape: false,
    });
    console.log(`Completed scrape job ${completed.jobId} with source adapter candidate output.`);
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
