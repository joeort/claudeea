# proposal-generator — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `gQsI1k4enWhiz4FA` |
| **Status** | Active |
| **Phase** | Phase 4 — Scale |
| **Model** | Claude Opus ($) |
| **Prompt File** | `prompts/PROMPT_proposal-generator-sow-pricing-scope-client-engagement-opus.md` |
| **JSON File** | `n8n-workflows/phase4-scale/proposal-generator.json` |
| **Dependencies** | ai-api-wrapper, Google Docs, Gmail |
| **Triggers** | Manual (webhook or ClickUp form) |

## Purpose
Generates tailored consulting proposals/SOWs using Claude Opus for maximum quality. Produces a Google Doc proposal and companion email draft. Uses Opus because proposals are high-value, client-facing deliverables.

## Data Flow
1. Triggered manually via webhook or form submission
2. Receives prospect info and discovery context
3. Sends to Claude Opus via ai-api-wrapper
4. AI generates full proposal (exec summary, scope, timeline, investment, proof points)
5. Creates Google Doc in Proposals folder
6. Creates companion email draft in Gmail

## Configuration
- Claude Opus API key: configured via ai-api-wrapper
- Google Docs credential: linked

## Integration Points
- **Calls:** ai-api-wrapper (Opus)
- **Reads from:** Webhook/form (prospect data)
- **Writes to:** Google Docs (proposal), Gmail (companion email draft)
- **Future:** Pull prospect info from HubSpot/Apollo automatically

## Known Issues
- None identified

## Testing
- Not independently tested

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | Initial import |
