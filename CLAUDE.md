# RevOps Consulting Assistant — Project Context

## What This Is
n8n-powered automation system for a solo RevOps consultant (B2B SaaS, $10-100M ARR). Saves 15-20 hrs/week by automating client delivery, content creation, and growth operations. Human-in-the-loop for all client-facing output (Gmail drafts, not auto-send).

## Architecture
- **n8n** = workflow orchestrator (self-hosted at `https://n8n.revopsinflection.com`)
- **Gemini / Claude** = intelligence layer (Gemini free tier for most; Claude Opus for 2 high-value workflows)
- **Google Sheets** = config database (Client Roster) and logging
- **Google Drive** = client file storage; **Google Docs** = collaborative artifacts
- **ClickUp** = task management; **Toggl** = time tracking; **HubSpot** = CRM; **Apollo** = enrichment

## Key URLs & IDs
| Resource | Value |
|----------|-------|
| n8n instance | `https://n8n.revopsinflection.com` |
| n8n MCP endpoint | `https://n8n.revopsinflection.com/mcp-server/http` |
| Client Roster Sheet | `1IYEGJ4v1UIocHUYuvxBAtq3IDD0cdsZwJo80b0_kPQQ` |
| Google Sheets credential (n8n) | `2k6FJ6yeOQ78iIre` |
| n8n API key | stored in `.mcp.json` env `N8N_API_KEY` |

## Workflow Registry
| Workflow | n8n ID | Model | Status | Phase |
|----------|--------|-------|--------|-------|
| ai-api-wrapper | `ywhteyrTqBjEpgjo` | Gemini 2.5 Pro | Active | Shared |
| client-lookup | `KonUDndTDNefwnEB` | — | Active, Tested | Shared |
| error-handler | `4hiumJ5C9tlJwRBI` | — | Active | Shared |
| call-intelligence | `LtDiO3rtO4OAMWmp` | Gemini 2.5 Pro | Active | Phase 1 |
| meeting-prep | `Uldzen1iaokPSlbI` | Gemini 2.0 Flash | Active, Tested | Phase 1 |
| forecast-review | `5YcSvoLx51NpZrEs` | Claude Opus | Active | Phase 2 |
| weekly-client-updates | `jPsuoKNJrjuUrHfC` | Gemini 2.0 Flash | Active | Phase 2 |
| time-tracking | `yO13Rjw6AEWfOLNz` | — | Active | Phase 2 |
| linkedin-content-generator | `QUYp8gGidTjv5goq` | Gemini 2.0 Flash | Active | Phase 3 |
| linkedin-publisher | `8TpSSTARLMMYs7Qb` | — | Active (stub) | Phase 3 |
| substack-newsletter | `JVA4Ln9G8nddAPmq` | Gemini 2.5 Pro | Active | Phase 3 |
| inbound-lead-capture | `6HIyB15f4djLacj8` | Gemini 2.0 Flash | Active | Phase 3 |
| client-onboarding | `jKofWbl2Kr1GRkYo` | Gemini 2.0 Flash | Active | Phase 4 |
| proposal-generator | `gQsI1k4enWhiz4FA` | Claude Opus | Active | Phase 4 |
| client-health-scoring | `9bHD89u72BCq1YZH` | Gemini 2.0 Flash | Active | Phase 4 |
| calendar-sync | `Xe4FrbXLSfHoGuWb` | — | Active | Shared |

## File Navigation
```
├── prompts/           → PROMPT_*.md files (10 AI prompt templates, one per workflow)
├── n8n-workflows/     → 16 workflow JSONs (shared/ → phase1/ → phase2/ → phase3/ → phase4/)
├── templates/         → 5 Google Sheets CSV templates
├── scripts/           → Test & utility scripts
├── docs/              → Setup guide, voice/tone guide, architecture docs, filename methodology
│   └── workflows/     → Per-workflow companion docs (operational reference)
└── CLAUDE.md          → This file
```

## Coding Conventions (MUST FOLLOW)
- **ClickUp API**: Always use n8n Code nodes with `this.helpers.httpRequest` — httpRequest nodes double-encode `space_ids[]` brackets
- **ClickUp sorting**: NEVER use `order_by=priority` (causes API 500 error) — use `order_by=updated` or omit
- **Google Sheets**: Always use `"mode": "name"` for sheetName (mode=list doesn't work)
- **n8n REST API**: Use PUT (not PATCH) for workflow updates; requires name+nodes+connections+settings
- **n8n MCP**: Can only search/execute/get-details — cannot create workflows or manage credentials
- **n8n execution order**: v1 parallel branches to same node = race condition — merge into one Code node
- **Sub-workflow testing**: Need webhook wrappers (can't execute sub-workflows via MCP directly)
- **Gmail**: Draft nodes may need manual operation switch to "createDraft" in n8n UI
- **API keys**: ClickUp API key hardcoded in Code nodes (credential header format had issues)
- **n8n Code node sandbox**: No `URLSearchParams`, no `httpRequestWithAuthentication` — use HTTP Request nodes for authenticated API calls, Code nodes for logic only
- **Google Calendar extendedProperties**: Native Calendar nodes don't support them — use HTTP Request nodes with predefined OAuth2 credentials for writes that need custom properties
- **Google Calendar API rate limits**: Batch HTTP Request node calls (batchSize: 3, batchInterval: 1000ms) to avoid 429 errors
- **HTTP Request DELETE body**: Must send `'{}'` not empty string `''` to avoid JSON parse errors

## Configuration Status
**Done:** Client Roster Sheet ID, Client Lookup Workflow ID, Claude Wrapper Workflow ID, n8n URL, Google Sheets credential, Google Drive (OneDrive fully replaced)
**Still needs:** GEMINI_API_KEY, COST_LOG_SHEET_ID, ERRORS_SHEET_ID, CONTENT_CALENDAR_SHEET_ID, LINKEDIN_ANALYTICS_SHEET_ID, YOUR_EMAIL, LINKEDIN_PERSON_ID, RSS_FEED_URL, CLICKUP_LIST_ID, CONTENT_IDEAS_LIST_ID, NEWSLETTER_IDEAS_LIST_ID, SHARED_DRIVE_ID, CLIENTS_PARENT_FOLDER_ID
Search for `CONFIGURE_ME` in workflow JSONs to find all placeholders.

## Known Issues
- linkedin-publisher "Get Next Approved Post" node is a stub — needs queue implementation
- client-health-scoring "Gather Health Metrics" returns placeholder strings, not real data
- ai-api-wrapper uses `gemini-2.5-pro-preview-05-06` — verify model ID is still current


## Testing
| Test | Workflow ID | Endpoint | Status |
|------|-------------|----------|--------|
| test-client-lookup | `C4IQNjbcIShaHWMN` | `/webhook/test-client-lookup` | PASS |
| test-meeting-prep | `27QAmWPwjwHQAma7` | — | PASS |

## Client Data (Blackthorn)
- Status: Active, Contact: Chris Kearney, Meeting: Monday 1:30pm ET
- Hours: 80 @ $187.50, ClickUp Team ID: 9011968555, Space: 90114014960
- Google Drive Folder: `1VzQdyyoSqugwD3Uzs7eR7bH581kMswou`, Toggl: `9126346`

## Documentation Conventions
- Filenames follow retrieval-optimized methodology (see `docs/filename-generation-keyword-extraction-retrieval-optimization.md`)
- Prefixes: `PROMPT_` for prompt templates, `TECHNICAL_` for setup/architecture, `PERSONA_` for voice/tone, `SCHEMA_` for structured indexes
- Per-workflow companion docs live in `docs/workflows/`
