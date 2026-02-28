# meeting-prep — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `Uldzen1iaokPSlbI` |
| **Status** | Active, Tested |
| **Phase** | Phase 1 — Foundation |
| **Model** | Gemini 2.0 Flash (free) |
| **Prompt File** | `prompts/PROMPT_meeting-prep-agenda-clickup-tasks-calendar-client-call-preparation.md` |
| **JSON File** | `n8n-workflows/phase1-foundation/meeting-prep.json` |
| **Dependencies** | client-lookup, ai-api-wrapper, Google Calendar, ClickUp, Google Docs |
| **Triggers** | Google Calendar event (2 hours before meeting) |

## Purpose
Generates a structured meeting agenda 2 hours before each client call. Pulls open ClickUp tasks, last meeting notes, and forecast highlights. Output goes to calendar event description and a Google Doc.

## Data Flow
1. Google Calendar trigger fires 2 hours before meeting
2. Extracts attendee emails → calls client-lookup to identify client
3. Fetches open ClickUp tasks for the client's space (single Code node — merged parallel branches)
4. Fetches last meeting notes and forecast highlights
5. Sends all context to Gemini via ai-api-wrapper
6. Writes agenda to calendar event description AND creates Google Doc

## Configuration
- Client Roster Sheet ID: configured
- ClickUp API key: hardcoded in Code node (credential header format issues)
- ClickUp Space ID: pulled from Client Roster (note: Blackthorn's is 90114014960, NOT the Team ID)
- Google Docs credential: linked in n8n

## Integration Points
- **Calls:** client-lookup (sub-workflow), ai-api-wrapper (sub-workflow)
- **Reads from:** Google Calendar, ClickUp API, Google Sheets (Client Roster)
- **Writes to:** Google Calendar (event description), Google Docs (agenda document)

## Known Issues
- ClickUp tasks fetched via single merged Code node (v1 execution order race condition with parallel branches)
- `order_by=priority` causes ClickUp API 500 — uses `order_by=updated` instead
- ClickUp `space_ids[]` must use Code node (httpRequest node double-encodes brackets)

## Testing
- **Test harness:** `test-meeting-prep` (ID: `27QAmWPwjwHQAma7`)
- **Last tested:** 2026-02-24 — PASS (retrieved 43 ClickUp tasks, built prep summary)

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | End-to-end test passed via test harness |
| 2026-02-24 | Merged parallel ClickUp nodes into single Code node (race condition fix) |
| 2026-02-24 | Fixed ClickUp API: removed order_by=priority, switched to Code node |
| 2026-02-24 | Initial import and configuration |
