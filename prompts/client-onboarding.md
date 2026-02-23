# Client Onboarding Automation — Claude Prompt Template

## Model: claude-sonnet-4-6

---

### System Prompt

```
You are a RevOps consultant's operations assistant. You help generate onboarding materials for new B2B SaaS clients. Your outputs should be professional, thorough, and set clear expectations for the engagement.
```

### User Prompt

```
Generate onboarding materials for a new client.

**Client Details:**
- Company: {{company_name}}
- Primary Contact: {{primary_contact}} ({{contact_title}})
- ARR: ${{arr}}
- Sales Team Size: {{sales_team_size}}
- CRM: {{crm}}
- Engagement Type: {{scope_tier}} (diagnostic / implementation / ongoing-advisory)
- Duration: {{duration}}
- Start Date: {{start_date}}
- Key Challenges: {{challenges}}
- Agreed Scope: {{agreed_scope}}

---

**Generate the following:**

### 1. Welcome Email
Professional, warm email that:
- Expresses excitement about the partnership
- Sets expectations for the first 2 weeks
- Lists what you need from them (access, data, time)
- Includes the onboarding checklist as an attachment reference
- Proposes the kickoff meeting time

### 2. Onboarding Checklist
What you need from the client:
- [ ] CRM admin access ({{crm}})
- [ ] Historical pipeline data export (last 12 months)
- [ ] Current sales process documentation (if exists)
- [ ] Org chart / team structure for revenue team
- [ ] Existing forecast model / targets
- [ ] Access to sales enablement tools (list common ones)
- [ ] 30 min intro calls with key stakeholders: [list by role]
- [ ] Current tech stack inventory
- [ ] Any previous RevOps audits or assessments

### 3. First 30 Days — ClickUp Task List
Generate a structured list of tasks for the first 30 days:

**Week 1: Discovery**
- Kickoff meeting
- CRM access & initial audit
- Stakeholder interviews (list specific roles)
- Data collection

**Week 2: Assessment**
- Pipeline analysis
- Process mapping
- Tool audit
- Identify quick wins

**Week 3: Recommendations**
- Findings presentation
- Prioritized roadmap draft
- Quick wins implementation begins

**Week 4: Execution Begins**
- Roadmap finalization
- First implementation sprint
- Weekly cadence established

For each task, include:
- Task name
- Description
- Assignee (consultant / client / both)
- Estimated duration
- Dependencies

### 4. Kickoff Meeting Agenda
- Introductions & working style preferences (15 min)
- Engagement overview & goals alignment (15 min)
- Current state walkthrough from client (20 min)
- Access & logistics review (10 min)
- First 30 days preview (10 min)
- Q&A (10 min)
- Next steps & action items (10 min)

---

**Guidelines:**
- Tailor everything to the engagement type (diagnostic is more assessment-heavy, implementation is more action-heavy)
- Reference their specific challenges throughout
- Be specific about what you need and when — vague asks lead to delays
- The onboarding experience sets the tone for the entire engagement — make it sharp
```

---

### Notes
- Triggered manually when a deal is marked as Won
- Creates: ClickUp Space, Google Drive folder, Forecast Sheet, Roster entry
- Welcome email goes to Gmail drafts
- First 30 days of tasks auto-created in ClickUp
