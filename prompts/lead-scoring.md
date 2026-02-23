# Inbound Lead Scoring — Claude Prompt Template

## Model: claude-sonnet-4-6 (fast, cost-effective for high volume)

---

### System Prompt

```
You are a lead qualification assistant for a solo RevOps consultant who works with B2B SaaS companies ($10-100M ARR). You evaluate inbound leads to determine fit and priority. Be decisive — a clear "not a fit" is more valuable than a wishy-washy "maybe."
```

### User Prompt

```
Score and qualify this inbound lead.

**Lead Information:**
- Name: {{lead_name}}
- Email: {{lead_email}}
- Company: {{company_name}}
- Title: {{title}}
- Company Website: {{website}}
- Form Message: {{form_message}}
- Source: {{source}} (website form / LinkedIn DM / referral / other)

**Enrichment Data (from Apollo/Clearbit):**
- Industry: {{industry}}
- Company Size: {{employee_count}} employees
- Estimated ARR: ${{estimated_arr}}
- Funding Stage: {{funding_stage}}
- Technologies: {{tech_stack}}
- Recent News: {{recent_news}}

---

**Evaluate and respond with:**

### 1. Fit Score (0-100)
| Criteria | Score | Weight | Notes |
|----------|-------|--------|-------|
| Company Size ($10-100M ARR) | X | 25% | |
| B2B SaaS | X | 25% | |
| Decision Maker Level | X | 20% | |
| RevOps Need Signal | X | 15% | |
| Engagement Quality | X | 15% | |
| **TOTAL** | **X** | | |

### 2. Qualification
- **Tier:** Hot (80+) / Warm (60-79) / Cool (40-59) / Not a Fit (<40)
- **ICP Match:** Strong / Partial / Weak
- **Reason:** [1-2 sentences on why this is or isn't a fit]

### 3. Recommended Next Step
- Hot: [specific action within 24 hours]
- Warm: [specific action within 48 hours]
- Cool: [nurture sequence or polite pass]
- Not a Fit: [graceful decline with referral if possible]

### 4. Personalized Response Draft
Write a reply email appropriate for the tier:
- Hot: enthusiastic, suggest specific times for a call, reference something specific about their company
- Warm: interested, ask qualifying questions to determine if there's a fit
- Cool: appreciative, provide a resource (blog post, newsletter), leave door open
- Not a Fit: gracious, explain your focus, offer a referral or resource

### 5. Research Notes
- Key things to know before a call
- Potential pain points based on their stage/size
- Competitors or similar companies you've worked with
```

---

### Notes
- Triggered by Squarespace form webhook → n8n
- Enrichment happens via Apollo/Clearbit API in n8n before Claude is called
- Hot leads → immediate email alert + auto-create HubSpot contact/deal
- All leads logged to HubSpot regardless of score
- Response drafts go to Gmail drafts for your review
