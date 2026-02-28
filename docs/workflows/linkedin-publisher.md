# linkedin-publisher — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `8TpSSTARLMMYs7Qb` |
| **Status** | Active (stub — needs queue implementation) |
| **Phase** | Phase 3 — Content & Growth |
| **Model** | None |
| **Prompt File** | None |
| **JSON File** | `n8n-workflows/phase3-growth/linkedin-publisher.json` |
| **Dependencies** | LinkedIn API credential, LinkedIn Analytics sheet |
| **Triggers** | Cron (Mon/Wed/Fri 8:30 AM) |

## Purpose
Publishes approved LinkedIn posts on schedule. Fetches next approved post from the queue, publishes via LinkedIn API, and logs engagement metrics after 48 hours.

## Configuration
- `CONFIGURE_ME_LINKEDIN_PERSON_ID` — **needs configuration**
- `CONFIGURE_ME_LINKEDIN_ANALYTICS_SHEET_ID` — **needs configuration**
- LinkedIn API credential: needs to be set up

## Integration Points
- **Reads from:** Post approval queue (stub)
- **Writes to:** LinkedIn API, LinkedIn Analytics sheet

## Known Issues
- **"Get Next Approved Post" node is a stub** — needs queue implementation (e.g., Google Sheet with approval status column)
- LinkedIn API access requires Marketing Developer Platform approval

## Testing
- Not testable until stub is implemented

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | Initial import |
