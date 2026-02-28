# linkedin-content-generator — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `QUYp8gGidTjv5goq` |
| **Status** | Active |
| **Phase** | Phase 3 — Content & Growth |
| **Model** | Gemini 2.0 Flash (free) |
| **Prompt File** | `prompts/PROMPT_linkedin-content-generator-post-creation-revops-thought-leadership.md` |
| **JSON File** | `n8n-workflows/phase3-growth/linkedin-content-generator.json` |
| **Dependencies** | ai-api-wrapper, Google Docs, Content Calendar sheet |
| **Triggers** | Cron (Sunday 8 AM) |

## Purpose
Generates a batch of 5 LinkedIn post drafts weekly (2 tactical tips, 1 case study, 1 contrarian take, 1 data insight). References the voice/tone guide for brand consistency. Output goes to Google Doc for review.

## Data Flow
1. Sunday 8 AM cron trigger
2. Pulls content ideas from backlog, anonymized meeting insights, industry news
3. Sends to Gemini via ai-api-wrapper with voice/tone guide context
4. Creates Google Doc with 5 draft posts (3 for publishing Mon/Wed/Fri, 2 backups)
5. Updates Content Calendar sheet

## Configuration
- `CONFIGURE_ME_CONTENT_CALENDAR_SHEET_ID` — **needs configuration**
- `CONFIGURE_ME_CONTENT_IDEAS_LIST_ID` — **needs configuration** (ClickUp list)
- `CONFIGURE_ME_RSS_FEED_URL` — **needs configuration** (industry news)

## Integration Points
- **Calls:** ai-api-wrapper
- **Reads from:** Content Calendar sheet, ClickUp (ideas), RSS feeds
- **Writes to:** Google Docs (draft posts), Content Calendar sheet
- **Feeds into:** linkedin-publisher (approved posts)

## Known Issues
- None identified

## Testing
- Not independently tested

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | Initial import |
