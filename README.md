# RevOps Consulting Assistant

n8n-powered automation system for a solo RevOps consultant. Saves 15-20 hours/week by automating client delivery, content creation, and growth operations.

## Project Structure

```
├── CLAUDE.md                        # Project context (auto-loaded by Claude Code)
│
├── prompts/                         # AI prompt templates (PROMPT_* naming)
│   ├── PROMPT_meeting-prep-agenda-clickup-tasks-calendar-client-call-preparation.md
│   ├── PROMPT_call-intelligence-transcript-analysis-action-items-fathom-meeting-summary.md
│   ├── PROMPT_weekly-client-update-status-email-gmail-draft-friday-report.md
│   ├── PROMPT_forecast-review-pipeline-analysis-deal-inspection-revenue-opus.md
│   ├── PROMPT_linkedin-content-generator-post-creation-revops-thought-leadership.md
│   ├── PROMPT_substack-newsletter-long-form-revops-analysis-email-marketing.md
│   ├── PROMPT_proposal-generator-sow-pricing-scope-client-engagement-opus.md
│   ├── PROMPT_client-health-scoring-engagement-risk-retention-churn-signals.md
│   ├── PROMPT_lead-scoring-inbound-qualification-icp-fit-enrichment.md
│   └── PROMPT_client-onboarding-new-engagement-google-drive-clickup-workspace.md
│
├── n8n-workflows/                   # Importable n8n workflow JSONs
│   ├── shared/                      # Utility sub-workflows (import first)
│   │   ├── claude-api-wrapper.json
│   │   ├── client-lookup.json
│   │   └── error-handler.json
│   ├── phase1-foundation/
│   │   ├── call-intelligence.json
│   │   └── meeting-prep.json
│   ├── phase2-weekly/
│   │   ├── weekly-client-updates.json
│   │   ├── forecast-review.json
│   │   └── time-tracking.json
│   ├── phase3-growth/
│   │   ├── linkedin-content-generator.json
│   │   ├── linkedin-publisher.json
│   │   ├── substack-newsletter.json
│   │   └── inbound-lead-capture.json
│   └── phase4-scale/
│       ├── client-onboarding.json
│       ├── proposal-generator.json
│       └── client-health-scoring.json
│
├── templates/                       # Google Sheets CSV templates
│   ├── client-roster.csv
│   ├── automation-errors-sheet.csv
│   ├── api-cost-log.csv
│   ├── content-calendar.csv
│   └── linkedin-analytics.csv
│
├── scripts/                         # Test & utility scripts
│   ├── test-fathom-email.js
│   ├── test-forecast-data.js
│   └── webhook-trigger.sh
│
└── docs/
    ├── TECHNICAL_n8n-setup-configuration-google-sheets-credentials-api-keys-import-testing.md
    ├── PERSONA_linkedin-substack-brand-voice-tone-writing-style-revops-content-guidelines.md
    ├── TECHNICAL_architecture-decisions-n8n-gemini-claude-google-sheets-clickup-patterns.md
    ├── TECHNICAL_n8n-integration-patterns-clickup-api-google-sheets-code-node-workarounds.md
    ├── SCHEMA_project-index-workflow-registry-file-inventory-configuration-status.md
    ├── filename-generation-keyword-extraction-retrieval-optimization.md
    └── workflows/                   # Per-workflow companion docs (15 files)
        ├── ai-api-wrapper.md
        ├── client-lookup.md
        ├── meeting-prep.md
        └── ... (12 more)
```

## Documentation Map

| Need | Start Here |
|------|-----------|
| First-time setup | `docs/TECHNICAL_n8n-setup-configuration-*.md` |
| Project overview | `CLAUDE.md` |
| Architecture decisions | `docs/TECHNICAL_architecture-decisions-*.md` |
| Integration gotchas | `docs/TECHNICAL_n8n-integration-patterns-*.md` |
| Specific workflow details | `docs/workflows/{workflow-name}.md` |
| Content voice/tone | `docs/PERSONA_linkedin-substack-*.md` |
| Full project inventory | `docs/SCHEMA_project-index-*.md` |
| File naming methodology | `docs/filename-generation-*.md` |

## Quick Start

1. Read `docs/TECHNICAL_n8n-setup-configuration-*.md` for full setup instructions
2. Create Google Sheets from templates in `templates/`
3. Import shared workflows first, then phase workflows into n8n
4. Search for `CONFIGURE_ME` in each workflow and replace with your values
5. Test each workflow using scripts in `scripts/`

## Implementation Phases

| Phase | Workflows | Weekly Savings |
|-------|-----------|---------------|
| 1. Foundation (Week 1-2) | Call Intelligence, Meeting Prep | 3-5 hrs |
| 2. Weekly Rhythms (Week 3-4) | Client Updates, Forecast Review, Time Tracking | 6-8 hrs |
| 3. Content & Growth (Week 5-6) | LinkedIn, Substack, Inbound Leads | 3-5 hrs + growth |
| 4. Scale (Week 7-8) | Onboarding, Proposals, Health Scoring | Per-event savings |

## Cost Strategy

Most workflows run on **Gemini free tier** ($0). Claude Opus is reserved for only 2 high-value deliverables.

| Tier | Model | Cost | Workflows |
|------|-------|------|-----------|
| Free | Gemini 2.0 Flash | $0 | Meeting prep, weekly updates, LinkedIn, lead scoring, health scoring, onboarding |
| Free | Gemini 2.5 Pro | $0 | Call intelligence, Substack newsletter |
| Paid | Claude Opus | ~$5-15/mo | Forecast review, proposals |

## Architecture

- **n8n** — Workflow orchestration
- **Gemini API** — Primary intelligence layer (FREE tier for most workflows)
- **Claude API** — Premium intelligence (Opus only, for forecast reviews + proposals)
- **Google Sheets** — Config database (Client Roster) and logging
- **ClickUp** — Task management
- **Gmail** — Email drafts (human-in-the-loop)
- **Google Docs** — Collaborative deliverables
- **Google Drive** — Client file storage
- **Toggl** — Time tracking
- **HubSpot** — Personal CRM
- **Apollo** — Lead enrichment
