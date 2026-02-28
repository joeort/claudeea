# error-handler — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `4hiumJ5C9tlJwRBI` |
| **Status** | Active |
| **Phase** | Shared (import first) |
| **Model** | None |
| **Prompt File** | None |
| **JSON File** | `n8n-workflows/shared/error-handler.json` |
| **Dependencies** | Google Sheets credential, Gmail credential |
| **Triggers** | Called as sub-workflow on error catch |

## Purpose
Centralized error handling sub-workflow. Logs errors to Automation Errors sheet and sends alert emails for critical failures.

## Configuration
- `CONFIGURE_ME_ERRORS_SHEET_ID` — **needs configuration**
- `CONFIGURE_ME_YOUR_EMAIL` — **needs configuration**

## Integration Points
- **Called by:** All workflows (error catch branches)
- **Writes to:** Automation Errors sheet, Gmail (alert emails)

## Known Issues
- None identified

## Testing
- Not independently tested

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | Initial import |
