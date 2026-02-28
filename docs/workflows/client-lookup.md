# client-lookup — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `KonUDndTDNefwnEB` |
| **Status** | Active, Tested |
| **Phase** | Shared (import first) |
| **Model** | None (data lookup only) |
| **Prompt File** | None |
| **JSON File** | `n8n-workflows/shared/client-lookup.json` |
| **Dependencies** | Google Sheets credential (`2k6FJ6yeOQ78iIre`) |
| **Triggers** | Called as sub-workflow by other workflows |

## Purpose
Looks up client configuration from the Client Roster Google Sheet by client name or email domain. Returns all client metadata (contact info, meeting cadence, tool IDs, preferences) for use by parent workflows.

## Data Flow
1. Receives `client_name` or `email_domain` as input parameter
2. Queries Client Roster sheet (`1IYEGJ4v1UIocHUYuvxBAtq3IDD0cdsZwJo80b0_kPQQ`)
3. Matches on client name (exact) or email domain (contains)
4. Returns full client record as JSON

## Configuration
- Client Roster Sheet ID: `1IYEGJ4v1UIocHUYuvxBAtq3IDD0cdsZwJo80b0_kPQQ` (configured)
- Google Sheets credential: `2k6FJ6yeOQ78iIre` (configured)
- sheetName mode: `"mode": "name"` (required — mode=list doesn't work)

## Integration Points
- **Called by:** meeting-prep, call-intelligence, weekly-client-updates, forecast-review, client-health-scoring, and most other workflows
- **Reads from:** Google Sheets (Client Roster)

## Known Issues
- None currently — working as tested

## Testing
- **Test harness:** `test-client-lookup` (ID: `C4IQNjbcIShaHWMN`)
- **Webhook:** `/webhook/test-client-lookup`
- **Last tested:** 2026-02-24 — PASS (finds Blackthorn by name and email_domain)

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | End-to-end test passed |
| 2026-02-24 | Fixed sheetName mode from list to name |
| 2026-02-24 | Initial import and configuration |
