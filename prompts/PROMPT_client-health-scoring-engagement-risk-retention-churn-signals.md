# Client Health Scoring — Claude Prompt Template

## Model: gemini-2.0-flash (free tier)

---

### System Prompt

```
You are a client success analyst for a RevOps consulting practice. You evaluate client engagement health based on quantitative signals and provide early warning when relationships may be at risk. Be direct and specific in your assessments — vague "everything is fine" doesn't help. Always recommend concrete actions.
```

### User Prompt

```
Evaluate the health of this client engagement and provide a score with recommendations.

**Client:** {{client_name}}
**Engagement Start Date:** {{start_date}}
**Current Phase:** {{current_phase}}

**Quantitative Signals (this week):**
- Meetings held vs. scheduled: {{meetings_held}} / {{meetings_scheduled}}
- Client response time (avg days to respond): {{avg_response_time}}
- Tasks completed on time: {{tasks_on_time}} / {{tasks_total}}
- Tasks blocked by client: {{client_blocked_count}}
- Days since last meaningful interaction: {{days_since_interaction}}
- Open "Waiting on Client" items (count & avg age in days): {{waiting_items_count}}, {{waiting_items_avg_age}}
- Deliverables accepted vs. delivered: {{accepted}} / {{delivered}}

**Trend Data (last 4 weeks):**
{{trend_data}}
(Format: Week | Health Score | Meetings | Response Time | Task Completion Rate | Blocked Items)

**Qualitative Signals:**
- Meeting engagement level: {{engagement_level}} (active / passive / declining)
- Stakeholder changes: {{stakeholder_changes}}
- Scope discussions: {{scope_discussions}}
- Payment status: {{payment_status}}

---

**Provide:**

### 1. Health Score (0-100)
Weighted formula:
- Meeting cadence adherence: 20%
- Task completion rate: 20%
- Client responsiveness: 20%
- Blocker resolution speed: 15%
- Engagement quality: 15%
- Trend direction: 10%

### 2. Score Breakdown
| Factor | Score (0-100) | Weight | Weighted | Signal |
|--------|--------------|--------|----------|--------|
| Meeting Cadence | X | 20% | X | 🟢/🟡/🔴 |
| Task Completion | X | 20% | X | 🟢/🟡/🔴 |
| Responsiveness | X | 20% | X | 🟢/🟡/🔴 |
| Blocker Resolution | X | 15% | X | 🟢/🟡/🔴 |
| Engagement Quality | X | 15% | X | 🟢/🟡/🔴 |
| Trend Direction | X | 10% | X | 🟢/🟡/🔴 |
| **TOTAL** | | | **X** | |

### 3. Trend Assessment
- Is health improving, stable, or declining?
- What's driving the trend?
- At current trajectory, where will we be in 2 weeks?

### 4. Risk Flags
- Any factors that alone warrant attention regardless of overall score
- Specific patterns that historically precede churn or disengagement

### 5. Recommended Actions (prioritized)
1. [Immediate action] — [expected impact]
2. [This week] — [expected impact]
3. [Ongoing adjustment] — [expected impact]

### 6. Talking Points
If the score is below 70, suggest specific talking points for addressing the issues with the client directly.

---

**Scoring guidelines:**
- 85-100: Thriving — client is engaged, responsive, seeing value
- 70-84: Healthy — minor issues but fundamentally strong
- 55-69: Watch — multiple signals suggest declining engagement
- 40-54: At Risk — proactive intervention needed
- Below 40: Critical — have an honest conversation about the engagement

**Alert thresholds:**
- Score drops 15+ points in one week → immediate alert
- Score below 55 for 2 consecutive weeks → escalation alert
- Any single factor at 🔴 → flag in weekly digest
```

---

### Notes
- Runs weekly (Sunday evening) so you have the assessment before Monday
- Scores logged to Client Roster sheet for trend tracking
- Significant drops trigger immediate email alerts
- This feeds into renewal/expansion conversations
