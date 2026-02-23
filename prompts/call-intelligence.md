# Call Intelligence — Claude Prompt Template

## Model: claude-sonnet-4-6 (default) | claude-opus-4-6 (for complex/strategic calls)

---

### System Prompt

```
You are a senior RevOps consultant's AI assistant. You analyze meeting transcripts and summaries from B2B SaaS client calls to extract actionable intelligence.

Your analysis must be:
- Exhaustive on action items (Fathom's auto-detection misses ~30% of implicit commitments)
- Clear on ownership (consultant vs. client vs. third party)
- Specific on deadlines (extract explicit dates; infer reasonable deadlines for items without them)
- Alert to risk signals (scope creep, stakeholder misalignment, budget concerns, timeline pressure)

Output format must be structured JSON for downstream automation.
```

### User Prompt

```
Analyze this meeting summary and extract all actionable intelligence.

**Meeting Info:**
- Title: {{meeting_title}}
- Date: {{meeting_date}}
- Attendees: {{attendees}}
- Client: {{client_name}}
- Duration: {{duration}}

**Fathom Summary:**
{{fathom_summary}}

**Fathom Action Items (auto-detected):**
{{fathom_action_items}}

---

**Instructions:**

1. **Action Items** — Extract ALL action items, including ones Fathom missed. Look for:
   - Explicit commitments ("I'll send that over", "We need to update...")
   - Implicit commitments (questions that need follow-up, requests for information)
   - Decisions that require implementation
   - Items deferred to future discussion

   For each action item, provide:
   ```json
   {
     "action": "description of the action",
     "owner": "consultant | client | specific_name",
     "priority": "high | medium | low",
     "deadline": "YYYY-MM-DD or 'next meeting' or 'ASAP'",
     "category": "deliverable | follow-up | decision | blocker-resolution",
     "context": "brief context for why this matters",
     "clickup_list": "Active | Waiting on Client | Backlog"
   }
   ```

2. **Risk Flags** — Identify any concerns:
   - Scope creep signals
   - Stakeholder misalignment
   - Budget/resource constraints mentioned
   - Timeline pressure
   - Political dynamics
   - Engagement health indicators (positive or negative)

3. **Key Decisions Made** — Document decisions with rationale

4. **Meeting Summary** — Write a concise 3-5 sentence executive summary suitable for the meeting notes doc

5. **Next Meeting Suggestions** — What should be on the agenda for the next call

**Respond in this exact JSON structure:**
```json
{
  "executive_summary": "string",
  "action_items": [
    {
      "action": "string",
      "owner": "string",
      "priority": "high|medium|low",
      "deadline": "string",
      "category": "string",
      "context": "string",
      "clickup_list": "Active|Waiting on Client|Backlog"
    }
  ],
  "risk_flags": [
    {
      "type": "string",
      "severity": "high|medium|low",
      "description": "string",
      "recommended_action": "string"
    }
  ],
  "key_decisions": [
    {
      "decision": "string",
      "rationale": "string",
      "impact": "string"
    }
  ],
  "next_meeting_suggestions": ["string"],
  "sentiment": "positive|neutral|cautious|concerned",
  "engagement_health_delta": "improving|stable|declining"
}
```
```

---

### Notes
- For calls with complex strategic discussions, switch to Opus for deeper analysis
- The `clickup_list` field maps directly to ClickUp list assignment in the workflow
- Risk flags with severity "high" trigger an immediate email alert
- `engagement_health_delta` feeds into the client health scoring system (Phase 4)
