#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');
const INDEX_PATH = path.join(BLOG_DIR, 'INDEX.md');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      meta[key.trim()] = rest.join(':').trim().replace(/^"(.*)"$/, '$1');
    }
  }
  return meta;
}

function getFirstParagraph(content) {
  const body = content.replace(/^---[\s\S]*?---\n/, '').trim();
  // Skip headings, grab first non-empty, non-heading line
  for (const line of body.split('\n')) {
    const l = line.trim();
    if (l && !l.startsWith('#') && !l.startsWith('!') && l.length > 30) {
      return l.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').slice(0, 160) + '…';
    }
  }
  return '';
}

function buildIndex() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error('content/blog/ not found');
    process.exit(1);
  }

  const files = fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md') && f !== 'INDEX.md')
    .sort()
    .reverse(); // newest first

  const posts = files.map(filename => {
    const content = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8');
    const meta = parseFrontmatter(content);
    const summary = getFirstParagraph(content);
    return { filename, ...meta, summary };
  });

  const lines = [
    '# Blog Content Library — Index',
    '',
    "Joe's RevOps writing corpus. Read these posts to understand his voice, analytical framework, and the ideas he develops across his consulting practice. He writes for B2B SaaS operators and PE-backed GTM leaders on revenue operations, AI, data strategy, and go-to-market design.",
    '',
    `_${posts.length} posts · last updated ${new Date().toISOString().slice(0, 10)}_`,
    '',
    '---',
    '',
  ];

  for (const p of posts) {
    lines.push(`## [${p.title}](${p.url})`);
    lines.push(`_${p.date}_ · [\`${p.filename}\`](./${p.filename})`);
    if (p.summary) lines.push('');
    if (p.summary) lines.push(p.summary);
    lines.push('');
  }

  fs.writeFileSync(INDEX_PATH, lines.join('\n'), 'utf8');
  console.log(`INDEX.md updated — ${posts.length} posts`);
}

buildIndex();
