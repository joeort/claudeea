# substack-newsletter — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `JVA4Ln9G8nddAPmq` |
| **Status** | Active |
| **Phase** | Phase 3 — Content & Growth |
| **Model** | Gemini 2.5 Pro (free) |
| **Prompt File** | `prompts/PROMPT_substack-newsletter-long-form-revops-analysis-email-marketing.md` |
| **JSON File** | `n8n-workflows/phase3-growth/substack-newsletter.json` |
| **Dependencies** | ai-api-wrapper, Google Docs |
| **Triggers** | Cron (Wednesday) |

## Purpose
Generates weekly Substack newsletter draft (800-1500 words). Deeper and more analytical than LinkedIn content. Output goes to Google Doc for editing; publishing to Substack is currently manual.

## Data Flow
1. Wednesday cron trigger
2. Pulls topic from newsletter ideas list, industry news, anonymized insights
3. Sends to Gemini 2.5 Pro via ai-api-wrapper
4. Creates Google Doc with formatted draft

## Configuration
- `CONFIGURE_ME_NEWSLETTER_IDEAS_LIST_ID` — **needs configuration** (ClickUp list)

## Integration Points
- **Calls:** ai-api-wrapper
- **Reads from:** ClickUp (newsletter ideas), RSS feeds
- **Writes to:** Google Docs (draft)

## Known Issues
- Substack API is limited — publish step is manual
- Could auto-generate a LinkedIn teaser post from newsletter content (future enhancement)

## Testing
- Not independently tested

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | Initial import |
