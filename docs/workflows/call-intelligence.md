# call-intelligence — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `LtDiO3rtO4OAMWmp` |
| **Status** | Active |
| **Phase** | Phase 1 — Foundation |
| **Model** | Gemini 2.5 Pro (free) |
| **Prompt File** | `prompts/PROMPT_call-intelligence-transcript-analysis-action-items-fathom-meeting-summary.md` |
| **JSON File** | `n8n-workflows/phase1-foundation/call-intelligence.json` |
| **Dependencies** | client-lookup, ai-api-wrapper, Gmail, ClickUp, Google Docs, Google Drive |
| **Triggers** | Gmail (Fathom email received) |

## Purpose
Parses Fathom meeting transcript emails, identifies the client, runs AI analysis to extract action items (catches ~30% Fathom misses), risk flags, and key decisions. Creates ClickUp tasks and meeting notes doc.

## Data Flow
1. Gmail trigger detects Fathom summary email
2. Parses email for transcript/summary content
3. Extracts attendee domain → calls client-lookup
4. Sends transcript to Gemini via ai-api-wrapper
5. AI returns structured JSON (action items, risk flags, decisions, summary)
6. Creates ClickUp tasks (sorted into Active/Waiting on Client/Backlog lists)
7. Creates Google Doc with meeting notes in client's Drive folder
8. High-severity risk flags trigger immediate email alert

## Configuration
- `CONFIGURE_ME_CLICKUP_LIST_ID` — **needs configuration** (action item task list)
- Gmail credential: needs to be linked
- Google Drive folder: pulled from Client Roster

## Integration Points
- **Calls:** client-lookup, ai-api-wrapper
- **Reads from:** Gmail (Fathom emails)
- **Writes to:** ClickUp (tasks), Google Docs (meeting notes), Google Drive (file storage), Gmail (risk alerts)
- **Feeds into:** client-health-scoring (engagement_health_delta field)

## Known Issues
- ClickUp API calls must use Code nodes (not httpRequest nodes)

## Testing
- Not independently tested end-to-end

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | Initial import |
