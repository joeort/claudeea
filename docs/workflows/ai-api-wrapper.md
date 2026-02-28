# ai-api-wrapper — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `ywhteyrTqBjEpgjo` |
| **Status** | Active |
| **Phase** | Shared (import first) |
| **Model** | Gemini 2.5 Pro (default), Claude Opus (fallback) |
| **Prompt File** | None (pass-through) |
| **JSON File** | `n8n-workflows/shared/claude-api-wrapper.json` |
| **Dependencies** | Gemini API key, Anthropic API key (optional) |
| **Triggers** | Called as sub-workflow by other workflows |

## Purpose
Unified AI API wrapper that routes requests to Gemini or Claude based on the calling workflow's model preference. Handles API formatting, token counting, error handling, and cost logging.

## Data Flow
1. Receives system prompt, user prompt, and model preference as input
2. Routes to Gemini API (default) or Claude API based on model parameter
3. Returns AI response to calling workflow
4. Logs token usage and cost to API Cost Log sheet

## Configuration
- `CONFIGURE_ME_GEMINI_API_KEY` — **needs configuration**
- `CONFIGURE_ME_COST_LOG_SHEET_ID` — **needs configuration**
- Uses model ID `gemini-2.5-pro-preview-05-06` — verify still current

## Integration Points
- **Called by:** Most workflows that need AI processing
- **Reads from:** None
- **Writes to:** API Cost Log sheet (token usage tracking)

## Known Issues
- Gemini model ID `gemini-2.5-pro-preview-05-06` may need updating as preview versions rotate

## Testing
- Not independently tested — tested implicitly via meeting-prep test harness

## Changelog
| Date | Change |
|------|--------|
| 2026-02-24 | Switched to Gemini free tier as primary provider |
| 2026-02-24 | Initial import |
