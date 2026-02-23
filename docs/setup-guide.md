# RevOps Consulting Assistant — Setup Guide

## Prerequisites

- Self-hosted n8n instance (v1.20+)
- Google Workspace account (Gmail, Calendar, Sheets, Docs, Drive)
- Anthropic API key
- ClickUp account with API access
- Toggl Track account with API token
- HubSpot account (free tier works)
- OneDrive / Microsoft 365 account
- Apollo.io or Clearbit account (for lead enrichment)
- LinkedIn Developer account (for publishing)
- Squarespace website with form

---

## Step 1: API Credentials

### Anthropic (Claude API)
1. Go to https://console.anthropic.com/
2. Create an API key
3. In n8n: create an **HTTP Header Auth** credential
   - Header Name: `x-api-key`
   - Header Value: `your-api-key`

### Google Workspace
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web Application)
3. Enable APIs: Gmail, Calendar, Sheets, Docs, Drive
4. In n8n: create credentials for each Google service using OAuth2
5. Authorize each credential (n8n will redirect to Google login)

### ClickUp
1. Go to ClickUp Settings → Apps → API Token
2. Copy your personal API token
3. In n8n: create an **HTTP Header Auth** credential
   - Header Name: `Authorization`
   - Header Value: `your-clickup-token`

### Toggl Track
1. Go to Toggl Profile → API Token
2. In n8n: create an **HTTP Basic Auth** credential
   - Username: your Toggl email
   - Password: your API token

### Microsoft Graph (OneDrive)
1. Go to Azure Portal → App Registrations → New Registration
2. Add API permissions: Files.ReadWrite, User.Read
3. Create client secret
4. In n8n: create an **OAuth2 API** credential with Microsoft Graph settings

### HubSpot
1. Go to HubSpot Settings → Integrations → Private Apps
2. Create a private app with scopes: contacts, deals
3. In n8n: use the bearer token in an HTTP Header Auth credential
   - Header Name: `Authorization`
   - Header Value: `Bearer your-token`

### Apollo.io
1. Go to Apollo Settings → API Keys
2. In n8n: create an **HTTP Header Auth** credential
   - Header Name: `x-api-key`
   - Header Value: `your-apollo-key`

### LinkedIn
1. Apply for LinkedIn Marketing Developer Platform access
2. Create an app at https://www.linkedin.com/developers/
3. Request `w_member_social` scope for posting
4. **Alternative:** Use Buffer or Hootsuite API (easier OAuth flow)

---

## Step 2: Google Sheets Setup

### Client Roster Sheet
1. Create a new Google Sheet named "Client Roster"
2. Import `templates/client-roster.csv` as the first sheet
3. Delete the sample rows, keep headers
4. Note the Sheet ID from the URL (the long string between /d/ and /edit)

### API Cost Log Sheet
1. Create a new Google Sheet named "API Cost Log"
2. Import `templates/api-cost-log.csv` headers
3. Note the Sheet ID

### Automation Errors Sheet
1. Create a new Google Sheet named "Automation Errors"
2. Import `templates/automation-errors-sheet.csv` headers
3. Note the Sheet ID

### Content Calendar
1. Create a new Google Sheet named "Content Calendar"
2. Import `templates/content-calendar.csv`
3. Note the Sheet ID

### LinkedIn Analytics
1. Create a new Google Sheet named "LinkedIn Analytics"
2. Import `templates/linkedin-analytics.csv` headers
3. Note the Sheet ID

---

## Step 3: n8n Workflow Import Order

Import workflows in this order (shared utilities first):

### Shared (import first)
1. `shared/claude-api-wrapper.json` — Note its workflow ID
2. `shared/client-lookup.json` — Note its workflow ID
3. `shared/error-handler.json` — Note its workflow ID

### Phase 1
4. `phase1-foundation/call-intelligence.json`
5. `phase1-foundation/meeting-prep.json`

### Phase 2
6. `phase2-weekly/forecast-review.json`
7. `phase2-weekly/weekly-client-updates.json`
8. `phase2-weekly/time-tracking.json`

### Phase 3
9. `phase3-growth/linkedin-content-generator.json`
10. `phase3-growth/linkedin-publisher.json`
11. `phase3-growth/substack-newsletter.json`
12. `phase3-growth/inbound-lead-capture.json`

### Phase 4
13. `phase4-scale/client-onboarding.json`
14. `phase4-scale/proposal-generator.json`
15. `phase4-scale/client-health-scoring.json`

---

## Step 4: Configuration Checklist

After importing each workflow, search for `CONFIGURE_ME` in the JSON and replace with actual values:

| Placeholder | Where to Find |
|------------|---------------|
| `CONFIGURE_ME_CLIENT_ROSTER_SHEET_ID` | Google Sheet URL |
| `CONFIGURE_ME_COST_LOG_SHEET_ID` | Google Sheet URL |
| `CONFIGURE_ME_ERRORS_SHEET_ID` | Google Sheet URL |
| `CONFIGURE_ME_CONTENT_CALENDAR_SHEET_ID` | Google Sheet URL |
| `CONFIGURE_ME_LINKEDIN_ANALYTICS_SHEET_ID` | Google Sheet URL |
| `CONFIGURE_ME_CLIENT_LOOKUP_WORKFLOW_ID` | n8n workflow ID after import |
| `CONFIGURE_ME_CLAUDE_WRAPPER_WORKFLOW_ID` | n8n workflow ID after import |
| `CONFIGURE_ME_YOUR_EMAIL` | Your Gmail address |
| `CONFIGURE_ME_TEAM_ID` | ClickUp team/workspace ID |
| `CONFIGURE_ME_WORKSPACE_ID` | Toggl workspace ID |
| `CONFIGURE_ME_LINKEDIN_PERSON_ID` | Your LinkedIn member URN |
| `CONFIGURE_ME_N8N_URL` | Your n8n instance URL |
| `CONFIGURE_ME_RSS_FEED_URL` | RSS feed URL(s) for industry news |
| `CONFIGURE_ME_CONTENT_IDEAS_LIST_ID` | ClickUp list ID for content ideas |
| `CONFIGURE_ME_NEWSLETTER_IDEAS_LIST_ID` | ClickUp list ID for newsletter topics |

---

## Step 5: Testing Protocol

### Phase 1 Testing
1. **Call Intelligence:** Forward a real Fathom email to yourself, verify:
   - Email parsed correctly (check "Parse Fathom Email" node output)
   - Client matched via domain
   - Claude analysis includes action items not in Fathom's auto-detect
   - ClickUp tasks created in correct lists
   - Meeting notes doc created in Google Drive

2. **Meeting Prep:** Create a test calendar event 2 hours from now with a client attendee:
   - Verify the workflow triggers
   - Check agenda quality and time allocations
   - Verify calendar event description updated
   - Verify Google Doc created

### Phase 2 Testing
3. **Forecast Review:** Run manually for one client with populated forecast sheet
4. **Weekly Updates:** Run manually for one client, verify Gmail draft
5. **Time Tracking:** Check that today's meetings appear as Toggl entries

### Phase 3-4: Test each workflow individually before enabling cron triggers.

---

## Maintenance

- **Weekly:** Review API cost log, check error log for recurring issues
- **Monthly:** Review Claude prompt quality, adjust based on output feedback
- **Quarterly:** Audit all workflows, update API versions if needed, review ROI
