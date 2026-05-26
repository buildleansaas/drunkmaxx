import { getScrapeJob } from '../../lib/scrapeJobs.mjs';
import { getMongoUriStatus } from '../../lib/mongo.mjs';

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('cache-control', 'no-store');
  response.end(JSON.stringify(body));
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('allow', 'GET');
    return sendJson(response, 405, { error: 'Method not allowed' });
  }

  if (!getMongoUriStatus()) {
    return sendJson(response, 503, { error: 'MONGO_URI is not configured for scrape jobs' });
  }

  try {
    const jobId = request.query?.jobId || request.url?.split('/').pop()?.split('?')[0];
    const job = await getScrapeJob(jobId);
    if (!job) return sendJson(response, 404, { error: 'Scrape job not found' });
    return sendJson(response, 200, { job });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load scrape job';
    const statusCode = message.includes('jobId must') ? 400 : 500;
    return sendJson(response, statusCode, { error: message });
  }
}
