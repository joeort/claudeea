#!/usr/bin/env node
'use strict';

const { savePost } = require('./fetch-blog-post');

// All 33 posts from https://revopsinflection.substack.com/sitemap.xml
const POSTS = [
  'https://revopsinflection.substack.com/p/the-tactical-trap-why-your-portfolio',
  'https://revopsinflection.substack.com/p/funnel-design-as-an-economic-system',
  'https://revopsinflection.substack.com/p/getting-ahead-of-next-quarter',
  'https://revopsinflection.substack.com/p/garbage-in-garbage-bot-why-ai-is',
  'https://revopsinflection.substack.com/p/ai-excellence-requires-data-discipline',
  'https://revopsinflection.substack.com/p/the-documentation-debt-how-ai-reclaims',
  'https://revopsinflection.substack.com/p/the-context-paradox-why-more-data',
  'https://revopsinflection.substack.com/p/the-april-inflection-point-why-your',
  'https://revopsinflection.substack.com/p/the-selectivity-paradox-why-a-thinner',
  'https://revopsinflection.substack.com/p/the-5-silent-killers-of-ineffective',
  'https://revopsinflection.substack.com/p/revops-in-the-age-of-ai',
  'https://revopsinflection.substack.com/p/the-death-of-the-sdr-and-the-rise',
  'https://revopsinflection.substack.com/p/the-math-behind-effective-commission',
  'https://revopsinflection.substack.com/p/you-just-raised-a-round-5-revops',
  'https://revopsinflection.substack.com/p/value-creation-levers-the-6-ways',
  'https://revopsinflection.substack.com/p/debunking-common-revops-myths',
  'https://revopsinflection.substack.com/p/aligning-your-gtm-teams-7-tips-to',
  'https://revopsinflection.substack.com/p/the-secret-to-accurate-forecasting',
  'https://revopsinflection.substack.com/p/top-5-metrics-every-revops-leader',
  'https://revopsinflection.substack.com/p/what-is-revenue-operations-understanding',
  'https://revopsinflection.substack.com/p/pipeline-model-a-companion-to-sales',
  'https://revopsinflection.substack.com/p/sales-capacity-modeling-a-key-to',
  'https://revopsinflection.substack.com/p/your-ability-to-hit-2026-targets',
  'https://revopsinflection.substack.com/p/recap-of-gongs-state-of-revenue-ai',
  'https://revopsinflection.substack.com/p/the-january-readiness-checklist-de',
  'https://revopsinflection.substack.com/p/five-strategic-approaches-to-b2b',
  'https://revopsinflection.substack.com/p/dont-forget-to-consider-the-leaky',
  'https://revopsinflection.substack.com/p/grounding-quota-setting-in-reality',
  'https://revopsinflection.substack.com/p/beyond-allocation-data-is-the-foundation',
  'https://revopsinflection.substack.com/p/territory-planning-discussion-with',
  'https://revopsinflection.substack.com/p/15-reasons-gtm-fails',
  'https://revopsinflection.substack.com/p/revops-isnt-admin-three-strategic',
  'https://revopsinflection.substack.com/p/gtm-is-hard',
];

const DELAY_MS = 600;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log(`Importing ${POSTS.length} posts...\n`);
  let saved = 0, skipped = 0, errors = 0;

  for (let i = 0; i < POSTS.length; i++) {
    const url = POSTS[i];
    process.stdout.write(`[${i + 1}/${POSTS.length}] ${url.split('/p/')[1]} — `);
    try {
      const result = await savePost(url);
      if (result) saved++; else skipped++;
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      errors++;
    }
    if (i < POSTS.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\nDone. saved=${saved} skipped=${skipped} errors=${errors}`);
}

run().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
