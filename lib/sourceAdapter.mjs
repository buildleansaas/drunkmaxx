const DEFAULT_EVIDENCE_SOURCES = [
  {
    title: 'The Local Tap - Mechanicsville Happy Hour',
    url: 'https://example.com/mechanicsville-tap-happy-hour',
    snippet: 'Happy hour in Mechanicsville with $4 drafts and $6 house wine near ZIP 23116.',
    term: '23116 happy hour',
  },
  {
    title: 'Center Street Brewery - Draft Specials',
    url: 'https://example.com/center-street-brewery-specials',
    snippet: 'Local brewery listing mentions rotating draft specials, trivia nights, and walkable bar food.',
    term: 'Mechanicsville VA brewery',
  },
  {
    title: 'Route 301 Sports Bar - Drinks Menu',
    url: 'https://example.com/route-301-sports-bar-menu',
    snippet: 'Sports bar drinks menu includes domestic beer buckets and late-night bar snacks.',
    term: '23116 sports bar',
  },
  {
    title: 'Hanover Wine Bar - Weekly Pour List',
    url: 'https://example.com/hanover-wine-bar-pour-list',
    snippet: 'Wine bar page references weekly pours and a small-plates menu near Mechanicsville.',
    term: '23116 wine bar',
  },
];

const DEAL_KEYWORDS = [
  ['happy hour', 'Mentions happy hour'],
  ['draft', 'Mentions draft beer'],
  ['special', 'Mentions drink specials'],
  ['bucket', 'Mentions beer buckets'],
  ['wine', 'Mentions wine pours'],
  ['brewery', 'Mentions brewery drinks'],
];

export function cleanEvidenceText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

export function extractVenueName(title) {
  const clean = cleanEvidenceText(title);
  return clean.split(/\s[-–—|:]\s/)[0] || 'Venue candidate';
}

export function inferDealSummary(snippet) {
  const text = cleanEvidenceText(snippet);
  const lower = text.toLowerCase();
  const hits = DEAL_KEYWORDS.filter(([keyword]) => lower.includes(keyword)).map(([, label]) => label);
  if (!hits.length) {
    return 'Possible drink-value venue; deal needs manual verification from source text.';
  }
  return `${hits.slice(0, 2).join(' + ')}; verify exact price/date before showing as a live deal.`;
}

export function inferConfidence(snippet) {
  const lower = cleanEvidenceText(snippet).toLowerCase();
  if (/\$\d|happy hour|special/.test(lower)) return 'medium';
  if (/bar|brewery|wine|draft|beer|cocktail/.test(lower)) return 'low';
  return 'needs_review';
}

export function normalizeCandidateFromEvidence(evidence, { zip, rank = 1 } = {}) {
  const snippet = cleanEvidenceText(evidence?.snippet);
  return {
    type: 'venue_deal_candidate',
    source: 'adapter_v1',
    rank,
    zip: String(zip || '').trim(),
    venue: {
      name: extractVenueName(evidence?.title),
      locality: null,
    },
    deal: {
      summary: inferDealSummary(snippet),
      rawText: snippet,
      verifiedLiveDeal: false,
    },
    evidence: [
      {
        title: cleanEvidenceText(evidence?.title),
        url: String(evidence?.url || '').trim(),
        snippet,
        searchTerm: cleanEvidenceText(evidence?.term),
      },
    ],
    confidence: inferConfidence(snippet),
    liveScrape: false,
    generatedAt: new Date().toISOString(),
    warnings: [
      'Source adapter candidate only; no SMS/outreach sent.',
      'Do not claim this as a live deal until source text is manually verified or a live source connector confirms it.',
    ],
  };
}

export function buildSourceAdapterEvidence(job) {
  const searchTerms = Array.isArray(job?.searchTerms) ? job.searchTerms : [];
  const zip = String(job?.zip || '').trim();
  const allowedTerms = new Set(searchTerms.map((term) => String(term).toLowerCase()));

  const seeded = DEFAULT_EVIDENCE_SOURCES.filter((source) => {
    if (!allowedTerms.size) return true;
    const term = String(source.term || '').toLowerCase();
    return allowedTerms.has(term) || term.includes(zip) || searchTerms.some((jobTerm) => term.includes(String(jobTerm).toLowerCase().split(' ')[0] || zip));
  });

  const fallback = searchTerms.slice(0, 4).map((term, index) => ({
    title: `${zip || 'Local'} ${term.replace(/^\d{5}\s*/, '')} candidate`,
    url: `https://example.com/drunkmaxx/source-adapter/${encodeURIComponent(zip || 'local')}/${index + 1}`,
    snippet: `Conservative adapter placeholder for ${term}; venue/deal evidence must be confirmed before publication.`,
    term,
  }));

  return [...seeded, ...fallback].slice(0, 6);
}

export function buildSourceAdapterResults(job) {
  return buildSourceAdapterEvidence(job).map((evidence, index) =>
    normalizeCandidateFromEvidence(evidence, {
      zip: job?.zip,
      rank: index + 1,
    }),
  );
}
