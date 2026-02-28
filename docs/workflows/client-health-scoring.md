# client-health-scoring — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `9bHD89u72BCq1YZH` |
| **Status** | Active (metrics gathering is stub) |
| **Phase** | Phase 4 — Scale |
| **Model** | Gemini 2.0 Flash (free) |
| **Prompt File** | `prompts/PROMPT_client-health-scoring-engagement-risk-retention-churn-signals.md` |
| **JSON File** | `n8n-workflows/phase4-scale/client-health-scoring.json` |
| **Dependencies** | client-lookup, ai-api-wrapper, Google Sheets, Gmail |
| **Triggers** | Cron (Sunday evening) |

## Purpose
Evaluates client engagement health weekly using quantitative signals (meeting cadence, task completion, responsiveness, blockers). Generates a 0-100 health score with trend analysis and recommended actions. Alerts on significant score drops.

## Data Flow
1. Sunday evening cron trigger
2. Iterates active clients via client-lookup
3. Gathers health metrics (meetings, tasks, response times, blockers)
4. Sends metrics + trend data to Gemini via ai-api-wrapper
5. AI generates health score breakdown, risk flags, and recommendations
6. Logs scores to Client Roster for trend tracking
7. Score drop >15 points → immediate email alert
8. Score <55 for 2 weeks → escalation alert

## Configuration
- Client Roster Sheet ID: configured (scores logged here)

## Integration Points
- **Calls:** client-lookup, ai-api-wrapper
- **Reads from:** ClickUp (tasks), Google Calendar (meetings), Google Sheets (trend data)
- **Writes to:** Google Sheets (Client Roster — health scores), Gmail (alerts)
- **Fed by:** call-intelligence (engagement_health_delta)

## Known Issues
- **"Gather Health Metrics" node returns placeholder strings, not real data** — needs implementation to pull actual metrics from ClickUp, Calendar, etc.

## Testing
- Not independently tested (blocked by stub metrics node)

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | Initial import |
