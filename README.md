# RevOps Consulting Assistant

n8n-powered automation system for a solo RevOps consultant. Saves 15-20 hours/week by automating client delivery, content creation, and growth operations.

## Project Structure

```
├── prompts/                      # Claude prompt templates
│   ├── call-intelligence.md      # Meeting transcript analysis
│   ├── meeting-prep.md           # Agenda generation
│   ├── weekly-client-update.md   # Friday status emails
│   ├── forecast-review.md        # Pipeline analysis (Opus)
│   ├── linkedin-content.md       # LinkedIn post generation
│   ├── substack-newsletter.md    # Newsletter drafts (Opus)
│   ├── proposal-generator.md     # SOW/proposal generation (Opus)
│   ├── client-health-scoring.md  # Engagement health scoring
│   ├── lead-scoring.md           # Inbound lead qualification
│   └── client-onboarding.md      # New client setup materials
│
├── n8n-workflows/                # Importable n8n workflow JSONs
│   ├── shared/                   # Utility sub-workflows (import first)
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
├── templates/                    # Google Sheets CSV templates
│   ├── client-roster.csv
│   ├── automation-errors-sheet.csv
│   ├── api-cost-log.csv
│   ├── content-calendar.csv
│   └── linkedin-analytics.csv
│
├── scripts/                      # Test & utility scripts
│   ├── test-fathom-email.js
│   ├── test-forecast-data.js
│   └── webhook-trigger.sh
│
└── docs/
    ├── setup-guide.md            # Full setup & configuration guide
    └── voice-tone-guide.md       # LinkedIn/Substack writing guide
```

## Quick Start

1. Read `docs/setup-guide.md` for full setup instructions
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
