# Project Index — RevOps Consulting Assistant

## Document Metadata
| Field | Value |
|-------|-------|
| **Purpose** | Machine-readable project manifest: workflow registry, configuration status, file inventory |
| **Keywords** | project index, workflow registry, file inventory, configuration status, manifest |
| **Last Reviewed** | 2026-02-25 |

---

## Workflow Registry

| Workflow | n8n ID | Phase | Model | Status | Tested | Companion Doc |
|----------|--------|-------|-------|--------|--------|---------------|
| ai-api-wrapper | `ywhteyrTqBjEpgjo` | Shared | Gemini 2.5 Pro | Active | Implicit | `docs/workflows/ai-api-wrapper.md` |
| client-lookup | `KonUDndTDNefwnEB` | Shared | — | Active | PASS | `docs/workflows/client-lookup.md` |
| error-handler | `4hiumJ5C9tlJwRBI` | Shared | — | Active | No | `docs/workflows/error-handler.md` |
| call-intelligence | `LtDiO3rtO4OAMWmp` | Phase 1 | Gemini 2.5 Pro | Active | No | `docs/workflows/call-intelligence.md` |
| meeting-prep | `Uldzen1iaokPSlbI` | Phase 1 | Gemini 2.0 Flash | Active | PASS | `docs/workflows/meeting-prep.md` |
| forecast-review | `5YcSvoLx51NpZrEs` | Phase 2 | Claude Opus | Active | No | `docs/workflows/forecast-review.md` |
| weekly-client-updates | `jPsuoKNJrjuUrHfC` | Phase 2 | Gemini 2.0 Flash | Active | No | `docs/workflows/weekly-client-updates.md` |
| time-tracking | `yO13Rjw6AEWfOLNz` | Phase 2 | — | Active | No | `docs/workflows/time-tracking.md` |
| linkedin-content-generator | `QUYp8gGidTjv5goq` | Phase 3 | Gemini 2.0 Flash | Active | No | `docs/workflows/linkedin-content-generator.md` |
| linkedin-publisher | `8TpSSTARLMMYs7Qb` | Phase 3 | — | Stub | No | `docs/workflows/linkedin-publisher.md` |
| substack-newsletter | `JVA4Ln9G8nddAPmq` | Phase 3 | Gemini 2.5 Pro | Active | No | `docs/workflows/substack-newsletter.md` |
| inbound-lead-capture | `6HIyB15f4djLacj8` | Phase 3 | Gemini 2.0 Flash | Active | No | `docs/workflows/inbound-lead-capture.md` |
| client-onboarding | `jKofWbl2Kr1GRkYo` | Phase 4 | Gemini 2.0 Flash | Active | No | `docs/workflows/client-onboarding.md` |
| proposal-generator | `gQsI1k4enWhiz4FA` | Phase 4 | Claude Opus | Active | No | `docs/workflows/proposal-generator.md` |
| client-health-scoring | `9bHD89u72BCq1YZH` | Phase 4 | Gemini 2.0 Flash | Stub (metrics) | No | `docs/workflows/client-health-scoring.md` |

---

## Configuration Status

### Completed
| Placeholder | Value |
|-------------|-------|
| `CLIENT_ROSTER_SHEET_ID` | `1IYEGJ4v1UIocHUYuvxBAtq3IDD0cdsZwJo80b0_kPQQ` |
| `CLIENT_LOOKUP_WORKFLOW_ID` | `KonUDndTDNefwnEB` |
| `CLAUDE_WRAPPER_WORKFLOW_ID` | `ywhteyrTqBjEpgjo` |
| `N8N_URL` | `https://n8n.revopsinflection.com` |
| Google Sheets credential | `2k6FJ6yeOQ78iIre` |
| Google Drive | Fully configured (replaced OneDrive) |

### Pending
| Placeholder | Where Needed | Notes |
|-------------|-------------|-------|
| `GEMINI_API_KEY` | ai-api-wrapper | https://aistudio.google.com/apikey |
| `COST_LOG_SHEET_ID` | ai-api-wrapper | Create sheet from `templates/api-cost-log.csv` |
| `ERRORS_SHEET_ID` | error-handler | Create sheet from `templates/automation-errors-sheet.csv` |
| `CONTENT_CALENDAR_SHEET_ID` | linkedin-content-generator | Create sheet from `templates/content-calendar.csv` |
| `LINKEDIN_ANALYTICS_SHEET_ID` | linkedin-publisher | Create sheet from `templates/linkedin-analytics.csv` |
| `YOUR_EMAIL` | error-handler, inbound-lead-capture | Gmail address |
| `TEAM_ID` | client-onboarding | ClickUp: `9011968555` |
| `WORKSPACE_ID` | time-tracking | Toggl: `9126346` |
| `LINKEDIN_PERSON_ID` | linkedin-publisher | LinkedIn member URN |
| `RSS_FEED_URL` | linkedin-content-generator | Industry news feeds |
| `CLICKUP_LIST_ID` | call-intelligence | ClickUp list for action items |
| `CONTENT_IDEAS_LIST_ID` | linkedin-content-generator | ClickUp list |
| `NEWSLETTER_IDEAS_LIST_ID` | substack-newsletter | ClickUp list |
| `SHARED_DRIVE_ID` | client-onboarding | Omit if using My Drive |
| `CLIENTS_PARENT_FOLDER_ID` | client-onboarding | Google Drive folder |

---

## File Inventory

### Prompts (10 files)
| File | Workflow |
|------|----------|
| `prompts/PROMPT_meeting-prep-agenda-clickup-tasks-calendar-client-call-preparation.md` | meeting-prep |
| `prompts/PROMPT_call-intelligence-transcript-analysis-action-items-fathom-meeting-summary.md` | call-intelligence |
| `prompts/PROMPT_weekly-client-update-status-email-gmail-draft-friday-report.md` | weekly-client-updates |
| `prompts/PROMPT_forecast-review-pipeline-analysis-deal-inspection-revenue-opus.md` | forecast-review |
| `prompts/PROMPT_linkedin-content-generator-post-creation-revops-thought-leadership.md` | linkedin-content-generator |
| `prompts/PROMPT_substack-newsletter-long-form-revops-analysis-email-marketing.md` | substack-newsletter |
| `prompts/PROMPT_proposal-generator-sow-pricing-scope-client-engagement-opus.md` | proposal-generator |
| `prompts/PROMPT_client-health-scoring-engagement-risk-retention-churn-signals.md` | client-health-scoring |
| `prompts/PROMPT_lead-scoring-inbound-qualification-icp-fit-enrichment.md` | inbound-lead-capture |
| `prompts/PROMPT_client-onboarding-new-engagement-google-drive-clickup-workspace.md` | client-onboarding |

### n8n Workflow JSONs (15 files)
| Directory | Files |
|-----------|-------|
| `n8n-workflows/shared/` | claude-api-wrapper.json, client-lookup.json, error-handler.json |
| `n8n-workflows/phase1-foundation/` | call-intelligence.json, meeting-prep.json |
| `n8n-workflows/phase2-weekly/` | weekly-client-updates.json, forecast-review.json, time-tracking.json |
| `n8n-workflows/phase3-growth/` | linkedin-content-generator.json, linkedin-publisher.json, substack-newsletter.json, inbound-lead-capture.json |
| `n8n-workflows/phase4-scale/` | client-onboarding.json, proposal-generator.json, client-health-scoring.json |

### Templates (5 CSV files)
| File | Purpose |
|------|---------|
| `templates/client-roster.csv` | Client Roster sheet headers |
| `templates/api-cost-log.csv` | API Cost Log sheet headers |
| `templates/automation-errors-sheet.csv` | Automation Errors sheet headers |
| `templates/content-calendar.csv` | Content Calendar sheet headers |
| `templates/linkedin-analytics.csv` | LinkedIn Analytics sheet headers |

### Scripts (3 files)
| File | Purpose |
|------|---------|
| `scripts/test-fathom-email.js` | Test call-intelligence with sample Fathom email |
| `scripts/test-forecast-data.js` | Test forecast-review with sample pipeline data |
| `scripts/webhook-trigger.sh` | Generic webhook trigger utility |

### Documentation
| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project context (auto-loaded by Claude Code) |
| `README.md` | Project overview and quick start |
| `docs/TECHNICAL_n8n-setup-configuration-google-sheets-credentials-api-keys-import-testing.md` | Full setup guide |
| `docs/PERSONA_linkedin-substack-brand-voice-tone-writing-style-revops-content-guidelines.md` | Voice/tone guide for content generation |
| `docs/TECHNICAL_architecture-decisions-n8n-gemini-claude-google-sheets-clickup-patterns.md` | Architecture decision records |
| `docs/TECHNICAL_n8n-integration-patterns-clickup-api-google-sheets-code-node-workarounds.md` | Integration patterns and workarounds |
| `docs/SCHEMA_project-index-workflow-registry-file-inventory-configuration-status.md` | This file |
| `docs/filename-generation-keyword-extraction-retrieval-optimization.md` | Filename methodology |
| `docs/workflows/*.md` | 15 per-workflow companion docs |

### Test Harnesses (in n8n, not in repo)
| Workflow | n8n ID | Tests |
|----------|--------|-------|
| test-client-lookup | `C4IQNjbcIShaHWMN` | client-lookup sub-workflow |
| test-meeting-prep | `27QAmWPwjwHQAma7` | meeting-prep end-to-end |
