# forecast-review — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `5YcSvoLx51NpZrEs` |
| **Status** | Active |
| **Phase** | Phase 2 — Weekly Rhythms |
| **Model** | Claude Opus ($) |
| **Prompt File** | `prompts/PROMPT_forecast-review-pipeline-analysis-deal-inspection-revenue-opus.md` |
| **JSON File** | `n8n-workflows/phase2-weekly/forecast-review.json` |
| **Dependencies** | client-lookup, ai-api-wrapper, Google Sheets, Gmail |
| **Triggers** | Cron (Friday morning, before weekly-client-updates) |

## Purpose
Highest-value analytical workflow. Analyzes pipeline and forecast data per client, generates executive review with health scorecard, deal-level alerts, and forecast call (best/most likely/worst case). Uses Claude Opus for premium analysis quality.

## Data Flow
1. Cron trigger fires Friday morning
2. Iterates active clients via client-lookup
3. Pulls pipeline data from client's forecast sheet
4. Sends to Claude Opus via ai-api-wrapper
5. Creates analysis tab in client's forecast spreadsheet
6. Generates formatted email draft

## Configuration
- Forecast sheet IDs: pulled from Client Roster per client
- Claude Opus API key: configured via ai-api-wrapper

## Integration Points
- **Calls:** client-lookup, ai-api-wrapper (Opus)
- **Reads from:** Google Sheets (client forecast data)
- **Writes to:** Google Sheets (analysis tab), Gmail (draft)
- **Feeds into:** weekly-client-updates (forecast insights)

## Known Issues
- Runs before weekly-client-updates — ordering is important

## Testing
- Not independently tested end-to-end

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | Initial import |
