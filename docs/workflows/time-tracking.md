# time-tracking — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `yO13Rjw6AEWfOLNz` |
| **Status** | Active |
| **Phase** | Phase 2 — Weekly Rhythms |
| **Model** | None |
| **Prompt File** | None |
| **JSON File** | `n8n-workflows/phase2-weekly/time-tracking.json` |
| **Dependencies** | Google Calendar, Toggl API, client-lookup |
| **Triggers** | Cron (daily) |

## Purpose
Syncs calendar meetings to Toggl time entries automatically. Identifies client meetings, creates corresponding Toggl entries with proper project/tag mapping.

## Configuration
- `CONFIGURE_ME_WORKSPACE_ID` — **needs configuration** (Toggl workspace: `9126346`)
- Toggl API credential: needs to be linked

## Integration Points
- **Calls:** client-lookup
- **Reads from:** Google Calendar
- **Writes to:** Toggl Track

## Known Issues
- None identified

## Testing
- Not independently tested

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | Initial import |
