# weekly-client-updates — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `jPsuoKNJrjuUrHfC` |
| **Status** | Active |
| **Phase** | Phase 2 — Weekly Rhythms |
| **Model** | Gemini 2.0 Flash (free) |
| **Prompt File** | `prompts/PROMPT_weekly-client-update-status-email-gmail-draft-friday-report.md` |
| **JSON File** | `n8n-workflows/phase2-weekly/weekly-client-updates.json` |
| **Dependencies** | client-lookup, ai-api-wrapper, ClickUp, Gmail, forecast-review (runs first) |
| **Triggers** | Cron (Friday 11 AM, after forecast-review) |

## Purpose
Generates weekly status update emails for all active clients. Pulls completed/in-progress/blocked tasks from ClickUp, incorporates forecast insights from the earlier forecast-review run, and creates Gmail drafts for human review before sending.

## Data Flow
1. Cron trigger fires Friday 11 AM
2. Iterates all active clients
3. Pulls task data from ClickUp (completed, in-progress, blocked)
4. Pulls meeting summaries from the week
5. Incorporates forecast insights (from forecast-review output)
6. Sends context to Gemini via ai-api-wrapper
7. Creates Gmail draft per client
8. Sends summary notification when all drafts are ready

## Configuration
- ClickUp credentials: configured in Code nodes
- Gmail credential: needs to be linked

## Integration Points
- **Calls:** client-lookup, ai-api-wrapper
- **Reads from:** ClickUp (tasks), Google Sheets (forecast data)
- **Writes to:** Gmail (drafts)
- **Depends on:** forecast-review (must run first for forecast insights)

## Known Issues
- Gmail draft nodes may need manual operation switch to "createDraft" in n8n UI
- ClickUp API calls use Code nodes (merged parallel branches for v1 race condition)

## Testing
- Not independently tested end-to-end

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | Merged parallel ClickUp nodes into single Code node |
| 2026-02-24 | Initial import |
