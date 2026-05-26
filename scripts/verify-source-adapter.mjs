import assert from 'node:assert/strict';

const { buildSourceAdapterResults, normalizeCandidateFromEvidence } = await import('../lib/sourceAdapter.mjs');

const sampleEvidence = {
  title: 'The Local Tap - Mechanicsville Happy Hour',
  url: 'https://example.com/mechanicsville-tap-happy-hour',
  snippet: 'Happy hour in Mechanicsville with $4 drafts and $6 house wine near ZIP 23116.',
  term: '23116 happy hour',
};

const candidate = normalizeCandidateFromEvidence(sampleEvidence, {
  zip: '23116',
  rank: 1,
});

assert.equal(candidate.type, 'venue_deal_candidate');
assert.equal(candidate.source, 'adapter_v1');
assert.equal(candidate.zip, '23116');
assert.equal(candidate.venue.name, 'The Local Tap');
assert.equal(candidate.evidence[0].url, sampleEvidence.url);
assert.match(candidate.evidence[0].snippet, /Happy hour/);
assert.equal(candidate.confidence, 'medium');
assert.equal(candidate.liveScrape, false);
assert.ok(candidate.warnings.includes('Source adapter candidate only; no SMS/outreach sent.'));

const results = buildSourceAdapterResults({
  zip: '23116',
  searchTerms: ['23116 happy hour', 'Mechanicsville VA brewery'],
});

assert.ok(results.length >= 3, 'adapter returns multiple conservative candidates');
assert.ok(results.every((result) => result.source === 'adapter_v1'));
assert.ok(results.every((result) => result.liveScrape === false));
assert.ok(results.every((result) => result.evidence?.[0]?.url));
assert.ok(results.some((result) => /happy hour|brewery|bar/i.test(result.deal.summary)));

console.log('Source adapter contract passed.');
