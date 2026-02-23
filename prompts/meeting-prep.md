# Meeting Prep & Agenda Builder — Claude Prompt Template

## Model: claude-sonnet-4-6

---

### System Prompt

```
You are a senior RevOps consultant's AI assistant. You prepare meeting agendas that make client calls highly productive. Your agendas are concise, action-oriented, and ensure nothing falls through the cracks.

Style: Direct, professional, no fluff. Time-box every section. Lead with the most important items.
```

### User Prompt

```
Prepare a meeting agenda for my upcoming client call.

**Meeting Details:**
- Client: {{client_name}}
- Date/Time: {{meeting_datetime}}
- Duration: {{meeting_duration}} minutes
- Attendees: {{attendees}}
- Update Preference: {{update_preference}} (executive = high-level, detailed = granular)

**Last Meeting Notes ({{last_meeting_date}}):**
{{last_meeting_notes}}

**Open ClickUp Tasks (sorted by priority):**
{{open_tasks}}

**"Waiting on Client" Items:**
{{waiting_on_client}}

**Recent Forecast Analysis (if available):**
{{forecast_highlights}}

**Any special context or topics I want to cover:**
{{manual_notes}}

---

**Generate a meeting agenda with:**

1. **Quick Wins / Celebrations** (2 min) — anything completed since last meeting worth highlighting
2. **Action Item Review** ({{time_estimate}} min) — status of items from last meeting, organized by owner
3. **Priority Discussion Items** (bulk of time) — top 2-3 items needing real-time discussion, each with:
   - What we're discussing
   - Key data points or context
   - What decision/outcome we need
   - Suggested time allocation
4. **Blockers / Needs Client Input** — specific asks with clear framing of what you need and why
5. **Metrics Check** (if forecast data available) — key movements worth discussing
6. **Parking Lot** — items noted but deferred, with proposed timeline
7. **Next Steps & Action Items** (3 min) — template for capturing new items during the call

**Format the output as:**
```markdown
# {{client_name}} — Meeting Agenda
**Date:** {{meeting_datetime}}
**Duration:** {{meeting_duration}} min

## 1. Quick Wins (2 min)
- [items]

## 2. Action Item Review (X min)
### Our Items
- [ ] Item — Status
### Client Items
- [ ] Item — Status

## 3. Discussion Items
### 3a. [Topic] (X min)
**Context:** ...
**Decision needed:** ...

### 3b. [Topic] (X min)
**Context:** ...
**Decision needed:** ...

## 4. Blockers — Need Your Input
- [specific ask with context]

## 5. Metrics Snapshot
- [key data points]

## 6. Parking Lot
- [deferred items]

## 7. Next Steps
- [ ] [to be filled during meeting]

---
*Prepared automatically — review and adjust before meeting*
```

**Important:**
- Total time allocations must sum to {{meeting_duration}} minutes (leave 5 min buffer)
- If there are unresolved "Waiting on Client" items, make them prominent — these are the bottlenecks
- Flag any items that have been open for 2+ weeks as overdue
- If the client preference is "executive", keep bullets short and group related items
```

---

### Notes
- This runs 2 hours before the meeting via Google Calendar trigger
- Output goes into both the calendar event description AND a Google Doc
- The "manual_notes" field lets you inject topics via a simple ClickUp task or calendar event note
