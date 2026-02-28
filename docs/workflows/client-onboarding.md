# client-onboarding — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `jKofWbl2Kr1GRkYo` |
| **Status** | Active |
| **Phase** | Phase 4 — Scale |
| **Model** | Gemini 2.0 Flash (free) |
| **Prompt File** | `prompts/PROMPT_client-onboarding-new-engagement-google-drive-clickup-workspace.md` |
| **JSON File** | `n8n-workflows/phase4-scale/client-onboarding.json` |
| **Dependencies** | ai-api-wrapper, ClickUp, Google Drive, Google Sheets, Gmail |
| **Triggers** | Manual (deal marked as Won) or webhook |

## Purpose
Automates new client onboarding. Creates ClickUp Space, Google Drive folder structure, forecast sheet, Client Roster entry, and generates welcome email + onboarding materials using AI.

## Data Flow
1. Triggered manually when a deal is marked as Won
2. Creates infrastructure: ClickUp Space, Google Drive folder, Forecast Sheet
3. Adds client to Client Roster sheet
4. Sends client details to Gemini for onboarding materials generation
5. AI generates: welcome email, onboarding checklist, first-30-days tasks, kickoff agenda
6. Creates ClickUp tasks for first 30 days
7. Welcome email goes to Gmail drafts

## Configuration
- `CONFIGURE_ME_SHARED_DRIVE_ID` — **needs configuration** (omit if using My Drive)
- `CONFIGURE_ME_CLIENTS_PARENT_FOLDER_ID` — **needs configuration**
- `CONFIGURE_ME_TEAM_ID` — **needs configuration** (ClickUp: `9011968555`)

## Integration Points
- **Calls:** ai-api-wrapper
- **Writes to:** ClickUp (space, tasks), Google Drive (folders), Google Sheets (Client Roster), Gmail (welcome email draft)

## Known Issues
- None identified

## Testing
- Not independently tested

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | Initial import |
