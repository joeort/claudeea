# call-intelligence — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `LtDiO3rtO4OAMWmp` |
| **Status** | Active, Tested |
| **Phase** | Phase 1 — Foundation |
| **Model** | Gemini 2.5 Pro (free) |
| **Prompt File** | `prompts/PROMPT_call-intelligence-transcript-analysis-action-items-fathom-meeting-summary.md` |
| **JSON File** | `n8n-workflows/phase1-foundation/call-intelligence.json` |
| **Dependencies** | client-lookup, ai-api-wrapper, Gmail API (HTTP Request), ClickUp, Google Drive API, Google Docs API |
| **Triggers** | Gmail trigger (Fathom email received) |

## Purpose
Parses Fathom meeting transcript emails, identifies the client, runs AI analysis to extract action items (catches ~30% Fathom misses), risk flags, and key decisions. Creates ClickUp tasks and meeting notes doc.

## Data Flow
1. Gmail trigger detects Fathom summary email (polls for unread from `notifications@fathom.video`)
2. **Fetch Full Email** — HTTP Request node calls Gmail API `format=full` to get complete base64url-encoded body (n8n Gmail node strips HTML-only email bodies to ~200 char snippet)
3. **Parse Fathom Email** — Code node decodes base64url body, extracts meeting title, date, attendees, summary, action items from the decoded HTML/text
4. Extracts attendee domain → calls client-lookup sub-workflow
5. Merges email data + client data → sends to Gemini via ai-api-wrapper
6. AI returns structured JSON (action items, risk flags, decisions, summary)
7. **Prepare ClickUp Tasks + Notes** — builds task list, markdown meeting notes, and HTML meeting notes
8. Creates ClickUp tasks (sorted into Active/Waiting on Client/Backlog lists)
9. **Create Meeting Doc** → **Write Meeting Notes** — two-step Google Doc creation: Drive API creates empty doc in client folder, then Drive API upload writes HTML content
10. High-severity risk flags trigger immediate email alert

## Configuration
- ~~`CONFIGURE_ME_CLICKUP_LIST_ID`~~ — **resolved**: now dynamically looks up lists from space ID at runtime
- ~~`CONFIGURE_ME` Google Docs folderId~~ — **resolved**: now uses `google_drive_folder_id` from client-lookup dynamically
- Gmail trigger credential: Gmail account (`O7ykd3puCOyyR8BV`) — also used by Fetch Full Email HTTP Request node via `predefinedCredentialType: gmailOAuth2`
- Google Docs/Drive credential: Google Docs account (`bbU1KBLk0uDZ3wms`) — used by Create Meeting Doc and Write Meeting Notes HTTP Request nodes via `predefinedCredentialType: googleDocsOAuth2Api`
- Google Drive folder: pulled from Client Roster via client-lookup
- Risk alert email: `joe@revopsinflection.com`

## Integration Points
- **Calls:** client-lookup, ai-api-wrapper
- **Reads from:** Gmail API via HTTP Request node (full email with base64 body decode)
- **Writes to:** ClickUp (tasks via API Code node), Google Drive API (doc creation + HTML content upload), Gmail (risk alerts)
- **Feeds into:** client-health-scoring (engagement_health_delta field)

## Node Architecture
| Node | Type | Purpose |
|------|------|---------|
| Watch Fathom Emails | Gmail Trigger v1.2 | Polls for unread Fathom emails |
| Fetch Full Email | HTTP Request → Gmail API | Gets full message with `format=full` (base64url body) |
| Parse Fathom Email | Code | Decodes base64url, extracts meeting data from HTML/text |
| Prepare Client Lookup | Code | Preps lookup params from parsed email |
| Client Lookup | Execute Workflow | Calls client-lookup sub-workflow |
| Merge Email + Client Data | Code | Combines email + client data for AI |
| Claude: Analyze Meeting | Execute Workflow | Calls ai-api-wrapper (Gemini 2.5 Pro) |
| Prepare ClickUp Tasks + Notes | Code | Builds tasks array, markdown notes, and HTML notes |
| Split Tasks / Create ClickUp Tasks | Code | Dynamic list lookup + task creation |
| Create Meeting Doc | HTTP Request → Drive API | Creates empty Google Doc in client folder |
| Write Meeting Notes | HTTP Request → Drive API upload | Uploads HTML content to the doc |
| High Risk Detected? | IF v1 | Routes high-severity risks to email alert |
| Render Risk Email / Send Risk Alert | Code + Gmail | Sends risk alert email |

## Known Issues
- ClickUp API calls use Code nodes with hardcoded API key (per project convention — credential header format had issues)
- Gmail trigger filters `readStatus: unread` from `notifications@fathom.video` — if the email is read before the trigger polls, it will be missed (manual pin-data trigger needed as fallback)
- ClickUp task list matching: AI's `list_type` fuzzy-matches to actual ClickUp list names — may land in wrong list if naming doesn't match closely

## ClickUp Task Creation
The "Create ClickUp Tasks" node is a Code node (not a native ClickUp node) that:
1. Gets folderless lists from the client's space via `GET /api/v2/space/{spaceId}/list`
2. Fuzzy-matches the AI's `list_type` ("Active", "Waiting on Client", "Backlog") to actual list names
3. Falls back to the first list if no match found
4. Creates tasks via `POST /api/v2/list/{listId}/task` with name, description, priority, and due date

## Testing
- **2026-03-11**: End-to-end test PASSED (execution 16854) — AccountAim meeting email
  - Full email body fetched (8,543 chars vs previous 194 char snippet)
  - 6 action items extracted, 1 risk flag detected
  - ClickUp task created: `868hv8nab`
  - Google Doc created with full meeting notes: `1cx04TtONBZ2CKxERrBYMbKdy4eiLFPurGgp8HNC0rO8`

## Changelog
| Date | Change |
|------|--------|
| 2026-03-11 | **Major fix**: Replaced Gmail Get node with HTTP Request → Gmail API `format=full` for complete email body (n8n Gmail node strips HTML-only emails to snippet). Added base64url decoding in Parse Fathom Email. |
| 2026-03-11 | **Major fix**: Replaced native Google Docs node (silently drops content) with two HTTP Request nodes: Create Meeting Doc (Drive API) + Write Meeting Notes (Drive API upload with HTML). |
| 2026-03-11 | Updated Prepare ClickUp Tasks + Notes to generate both markdown (`meeting_notes_content`) and HTML (`meeting_notes_html`) |
| 2026-03-02 | Fixed Google Docs node: added missing `content` parameter and dynamic `folderId` from client-lookup (was `CONFIGURE_ME`) |
| 2026-02-27 | Replaced native ClickUp node with Code node for dynamic list lookup |
| 2026-02-24 | Initial import |
