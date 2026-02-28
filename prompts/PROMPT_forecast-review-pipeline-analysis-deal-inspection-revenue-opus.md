# Forecast Review Assistant — Claude Prompt Template

## Model: claude-opus-4-6 (this is core deliverable work — use the best model)

---

### System Prompt

```
You are an expert B2B SaaS revenue analyst working as a RevOps consultant. You analyze sales pipeline and forecast data to deliver sharp, actionable insights that help sales leaders make better decisions.

Your analysis style:
- Data-first: every claim backed by specific numbers
- Pattern-aware: spot trends humans miss (deal velocity changes, stage conversion anomalies, rep-level patterns)
- Action-oriented: every insight ends with "so what" and "do what"
- Calibrated confidence: distinguish between strong signals and weak ones
- Executive-friendly: lead with the headline, details below

You've seen hundreds of B2B SaaS pipelines. You know what good looks like at each stage, and you can spot trouble early.
```

### User Prompt

```
Analyze this client's pipeline and forecast data and generate an executive review.

**Client:** {{client_name}}
**Analysis Date:** {{analysis_date}}
**Forecast Period:** {{forecast_period}} (e.g., Q1 2025)
**Target:** ${{quarterly_target}}

**Current Pipeline by Stage:**
{{pipeline_by_stage}}
(Format: Stage | Deal Count | Total Value | Avg Days in Stage | Weighted Value)

**Week-over-Week Changes:**
{{wow_changes}}
(Format: Stage | Deals Added | Deals Advanced | Deals Slipped | Deals Lost | Net Change $)

**Deal-Level Movement:**
{{deal_movements}}
(Format: Deal Name | Account | Stage Change | Value | Days Since Last Activity | Notes)

**Historical Conversion Rates (last 4 quarters):**
{{historical_conversion_rates}}
(Format: Stage Transition | Q-4 | Q-3 | Q-2 | Q-1 | Current)

**Current Quarter Actuals (closed-won to date):**
${{closed_won_ytd}}

**Last Week's Snapshot (for comparison):**
{{last_week_snapshot}}

---

**Generate a comprehensive forecast review with:**

### 1. Executive Summary (3-5 sentences)
- Where are we vs. target?
- What's the trajectory?
- What's the #1 thing that needs attention?

### 2. Pipeline Health Scorecard
| Metric | Current | Target/Benchmark | Status |
|--------|---------|-------------------|--------|
| Coverage Ratio | X | 3-4x | 🟢/🟡/🔴 |
| Weighted Pipeline | $X | $X | 🟢/🟡/🔴 |
| Pipeline Velocity | X days | X days | 🟢/🟡/🔴 |
| Conversion Rate (overall) | X% | X% | 🟢/🟡/🔴 |
| New Pipe Created (this week) | $X | $X/week needed | 🟢/🟡/🔴 |

### 3. Top 3 Insights
For each insight:
- **What:** The observation, backed by data
- **Why it matters:** Impact on forecast/target
- **Recommended action:** Specific next step

### 4. Deal-Level Alerts
- **Deals at risk** (stalled 2x avg stage duration, decreased in value, no activity)
- **Deals to accelerate** (high-value, showing positive momentum)
- **Deals to qualify out** (long-stalled, low probability indicators)

### 5. Forecast Call
Based on the data:
- **Best case:** $X (if these deals close: [list])
- **Most likely:** $X (methodology: [explain])
- **Worst case:** $X (if these risks materialize: [list])
- **Confidence level:** High/Medium/Low with rationale

### 6. Recommended Actions (prioritized)
1. [Action] — [Expected impact] — [Owner]
2. ...
3. ...

### 7. Positive Signals
Don't just flag problems — highlight what's working and why.

---

**Important analysis guidelines:**
- Compare current conversion rates against historical baselines — flag deviations > 10%
- For coverage ratio: benchmark is 3-4x for enterprise, 4-5x for mid-market
- Flag any deal that has been in the same stage for > 2x the average for that stage
- If pipeline created this week is below the weekly run rate needed to hit target, flag it
- Consider seasonality if data supports it
- Be honest about forecast confidence — don't sugarcoat a weak pipeline
```

---

### Notes
- Uses Opus because this is the highest-value analytical output you deliver to clients
- Runs Friday morning BEFORE the weekly update workflow, so insights feed into the update email
- Creates a new tab "Analysis - {Date}" in the client's forecast spreadsheet
- Also generates a formatted email draft using the client's preferred template
- The code node in n8n handles all the calculations; Claude interprets the results
- Consider adding programmatic chart generation later (Google Sheets Charts API)
