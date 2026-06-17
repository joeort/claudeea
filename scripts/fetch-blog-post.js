#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');
const TurndownService = require('turndown');

const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');

async function fetchPost(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; blog-importer/1.0)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

function extractMeta(root, url, html) {
  const getMeta = (prop) => {
    const el = root.querySelector(`meta[property="${prop}"]`) ||
               root.querySelector(`meta[name="${prop}"]`);
    return el ? el.getAttribute('content') : null;
  };

  const title = getMeta('og:title') || root.querySelector('title')?.text || 'Untitled';

  // Substack embeds datePublished in JSON-LD, not in og: meta tags
  const ldMatch = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
  const rawDate = ldMatch ? ldMatch[1] : getMeta('article:published_time');
  const date = rawDate ? rawDate.slice(0, 10) : new Date().toISOString().slice(0, 10);

  const slug = url.replace(/\/$/, '').split('/p/')[1] || path.basename(url);
  return { title: title.replace(/ \| .*$/, '').trim(), date, slug };
}

function htmlToMarkdown(html) {
  const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });

  // Remove Substack subscription widgets, buttons, share bars
  td.remove(['script', 'style', 'button', 'nav', 'footer',
             '.subscription-widget', '.subscribe-widget', '.paywall',
             '.post-ufi', '.reader-toolbar', '.comments-section']);

  return td.turndown(html).trim();
}

async function savePost(url) {
  const html = await fetchPost(url);
  const root = parse(html);
  const { title, date, slug } = extractMeta(root, url, html);

  fs.mkdirSync(BLOG_DIR, { recursive: true });

  const filename = `${date}-${slug}.md`;
  const filepath = path.join(BLOG_DIR, filename);

  if (fs.existsSync(filepath)) {
    console.log(`  skip  ${filename} (already exists)`);
    return null;
  }

  // Prefer the article body; fall back to full body
  const articleEl = root.querySelector('.available-content') ||
                    root.querySelector('article') ||
                    root.querySelector('.post-content') ||
                    root.querySelector('body');

  const bodyMd = htmlToMarkdown(articleEl.toString());

  const content = `---\ntitle: "${title.replace(/"/g, '\\"')}"\ndate: ${date}\nurl: ${url}\n---\n\n${bodyMd}\n`;
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`  saved ${filename}`);
  return { title, date, slug, url, filename };
}

// When called directly
if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node scripts/fetch-blog-post.js <substack-url>');
    process.exit(1);
  }
  savePost(url).then(result => {
    if (result) console.log('Done.');
  }).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { savePost };
