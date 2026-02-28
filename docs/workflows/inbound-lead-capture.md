# inbound-lead-capture — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `6HIyB15f4djLacj8` |
| **Status** | Active |
| **Phase** | Phase 3 — Content & Growth |
| **Model** | Gemini 2.0 Flash (free) |
| **Prompt File** | `prompts/PROMPT_lead-scoring-inbound-qualification-icp-fit-enrichment.md` |
| **JSON File** | `n8n-workflows/phase3-growth/inbound-lead-capture.json` |
| **Dependencies** | ai-api-wrapper, Apollo/Clearbit, HubSpot, Gmail |
| **Triggers** | Webhook (Squarespace form submission) |

## Purpose
Captures inbound leads from website form, enriches via Apollo/Clearbit, scores and qualifies using AI, creates HubSpot contact/deal, and generates personalized response email draft.

## Data Flow
1. Squarespace form webhook triggers
2. Enriches lead data via Apollo/Clearbit API
3. Sends enriched data to Gemini for scoring and qualification
4. AI returns fit score, tier (Hot/Warm/Cool/Not a Fit), and personalized response
5. Creates HubSpot contact and deal
6. Hot leads: immediate email alert
7. All leads: Gmail draft with personalized response

## Configuration
- Apollo/Clearbit API credential: needs to be linked
- HubSpot credential: needs to be linked
- `CONFIGURE_ME_YOUR_EMAIL` — **needs configuration**

## Integration Points
- **Calls:** ai-api-wrapper
- **Reads from:** Webhook (form data), Apollo/Clearbit (enrichment)
- **Writes to:** HubSpot (contact/deal), Gmail (drafts, alerts)

## Known Issues
- None identified

## Testing
- Not independently tested

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | Initial import |
