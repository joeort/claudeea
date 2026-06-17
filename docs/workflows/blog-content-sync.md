# blog-content-sync

Polls the Substack RSS feed daily, detects new posts, and triggers a GitHub Actions workflow that fetches the full post and commits it as markdown to `content/blog/`. Fully automatic — no human step after initial setup.

## Architecture

```
n8n schedule (9 AM daily)
  → GET revopsinflection.substack.com/feed
  → GET github.com/joeort/claudeea/contents/content/blog  (compare existing slugs)
  → New posts found? → POST github.com/repos/joeort/claudeea/dispatches
      → GitHub Actions: blog-sync.yml
          → node scripts/fetch-blog-post.js <url>
          → node scripts/update-blog-index.js
          → git commit + push
```

## One-Time Setup

### 1. Create a GitHub Personal Access Token
- Go to github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Name: `n8n-blog-sync`
- Expiration: No expiration (or 1 year — reminder to rotate)
- Scopes: `repo` (read contents + trigger repository_dispatch)
- Copy the token

### 2. Add to n8n as a credential
- n8n → Settings → Credentials → New
- Type: **HTTP Header Auth**
- Name: `github-pat`
- Header name: `Authorization`
- Header value: `Bearer ghp_your_token_here`

### 3. Import and activate the workflow
- Import `n8n-workflows/shared/blog-content-sync.json`
- Wire the two HTTP Request nodes ("List Repo Blog Files" and "Trigger GitHub Actions") to use the `github-pat` credential
- Activate the workflow

## Manual Testing

**Test n8n only** (verify RSS parse + diff logic, no GitHub dispatch):
- Open the workflow in n8n
- Disable the "Trigger GitHub Actions" node
- Click "Test workflow" — should find 0 new posts since all 33 are already imported
- Re-enable the node

**Test end-to-end via GitHub Actions**:
- Go to github.com/joeort/claudeea → Actions → "Add Blog Post" → Run workflow
- Paste any Substack URL in the input
- Confirm a new `.md` file is committed to `content/blog/`

## Adding a Post Manually

If you publish and don't want to wait until 9 AM:

```bash
node scripts/fetch-blog-post.js https://revopsinflection.substack.com/p/your-slug
node scripts/update-blog-index.js
```

Or trigger GitHub Actions manually (above).

## What Gets Saved

Each post is saved as `content/blog/YYYY-MM-DD-{slug}.md` with frontmatter:

```markdown
---
title: "Post Title"
date: YYYY-MM-DD
url: https://revopsinflection.substack.com/p/...
---

Full post body as markdown...
```

`content/blog/INDEX.md` is regenerated on each new post — it lists all posts with title, date, URL, and a one-line excerpt.

## Troubleshooting

| Symptom | Check |
|---------|-------|
| n8n can't list repo files | GitHub PAT expired or missing `repo` scope |
| GitHub Actions not triggered | PAT needs `repo` scope (not `public_repo`) |
| Actions triggered but no commit | Post already exists (idempotent — expected) |
| Post fetched but body looks garbled | Substack may have changed HTML structure; check `.available-content` selector in `fetch-blog-post.js` |
| RSS only shows 10 posts | Expected — RSS is limited; n8n only needs it to detect *new* posts published after the bulk import |
