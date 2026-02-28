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
- ~~`CONFIGURE_ME_CLICKUP_LIST_ID`~~ — **resolved**: now dynamically looks up lists from space ID at runtime
- Gmail credential: linked (Gmail account)
- Google Docs credential: linked (Google Docs account)
- Google Drive folder: pulled from Client Roster via client-lookup

## Integration Points
- **Calls:** client-lookup, ai-api-wrapper
- **Reads from:** Gmail (Fathom emails)
- **Writes to:** ClickUp (tasks via API Code node), Google Docs (meeting notes), Google Drive (file storage), Gmail (risk alerts)
- **Feeds into:** client-health-scoring (engagement_health_delta field)

## Known Issues
- ClickUp API calls use Code nodes with hardcoded API key (per project convention — credential header format had issues)

## ClickUp Task Creation
The "Create ClickUp Tasks" node is a Code node (not a native ClickUp node) that:
1. Gets folderless lists from the client's space via `GET /api/v2/space/{spaceId}/list`
2. Fuzzy-matches the AI's `list_type` ("Active", "Waiting on Client", "Backlog") to actual list names
3. Falls back to the first list if no match found
4. Creates tasks via `POST /api/v2/list/{listId}/task` with name, description, priority, and due date

## Testing
- Not independently tested end-to-end

## Changelog
| Date | Change |
|------|--------|
| 2026-02-27 | Replaced native ClickUp node with Code node for dynamic list lookup |
| 2026-02-24 | Initial import |
