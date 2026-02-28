# Architecture Decisions — RevOps Consulting Assistant

## Document Metadata
| Field | Value |
|-------|-------|
| **Purpose** | Records key architectural decisions and their rationale |
| **Keywords** | architecture, decisions, n8n, gemini, claude, google sheets, clickup, human-in-the-loop, cost optimization, model routing |
| **Last Reviewed** | 2026-02-25 |

---

## Decision 1: n8n as Orchestrator

**Choice:** Self-hosted n8n (v1.20+) over Zapier, Make, or custom code.

**Rationale:**
- Self-hosted = no per-execution costs (critical at scale with 15+ workflows)
- Visual workflow builder for rapid iteration
- Webhook support for real-time triggers
- Sub-workflow pattern enables shared utilities (client-lookup, ai-api-wrapper, error-handler)
- REST API enables programmatic workflow management
- Code nodes allow full JavaScript when visual nodes fall short

**Trade-offs:**
- Self-hosting requires infrastructure management
- v1 execution order has race conditions with parallel branches (mitigated by merging into single Code nodes)
- MCP endpoint is search/execute only — cannot create workflows or manage credentials

---

## Decision 2: Gemini Free Tier as Primary AI

**Choice:** Gemini 2.0 Flash and 2.5 Pro (both free) for 13 of 15 workflows. Claude Opus only for forecast-review and proposal-generator.

**Rationale:**
- Gemini free tier: 15 RPM (Flash), 5 RPM (Pro), 1M tokens/day
- Estimated monthly cost drops from ~$200+ (all Claude) to ~$5-15 (2 Opus workflows)
- Gemini quality is sufficient for structured outputs (meeting prep, status emails, LinkedIn posts)
- Opus reserved for highest-value deliverables where quality directly impacts client perception

**Model routing:**
| Tier | Model | Cost | Use Cases |
|------|-------|------|-----------|
| Free | Gemini 2.0 Flash | $0 | Meeting prep, weekly updates, LinkedIn, lead scoring, health scoring, onboarding |
| Free | Gemini 2.5 Pro | $0 | Call intelligence, Substack newsletter |
| Paid | Claude Opus | ~$5-15/mo | Forecast review, proposals |

---

## Decision 3: Google Sheets as Config Database

**Choice:** Google Sheets (Client Roster) over a traditional database.

**Rationale:**
- Zero infrastructure — already in the Google Workspace ecosystem
- Human-readable and editable — client config changes don't require code deploys
- 18-column Client Roster stores everything: contact info, meeting cadence, tool IDs, preferences
- Native n8n Google Sheets integration
- Sufficient scale for a solo consultant (10-20 clients max)

**Trade-offs:**
- No relational integrity (manual consistency)
- Rate limits on Sheets API (manageable at this scale)
- `sheetName` mode must be `"mode": "name"` (mode=list doesn't work in n8n)

---

## Decision 4: Human-in-the-Loop for All Client-Facing Output

**Choice:** Gmail drafts (not auto-send) for all client-facing emails.

**Rationale:**
- AI-generated content requires human review before reaching clients
- Draft pattern: AI does 90% of the work, human spends 2 min reviewing and personalizing
- Prevents embarrassing errors, tone mismatches, or incorrect data from reaching clients
- Maintains authentic consultant-client relationship
- Google Docs for collaborative artifacts (agendas, proposals) — same review pattern

---

## Decision 5: ClickUp for Task Management

**Choice:** ClickUp over Asana, Linear, or Notion.

**Rationale:**
- Already in use for client project management
- API supports task creation, status updates, and querying
- Space-per-client organization maps to the consulting model

**Implementation notes:**
- All ClickUp API calls MUST use Code nodes (httpRequest nodes double-encode `space_ids[]`)
- `order_by=priority` causes API 500 error — use `order_by=updated` or omit
- API key hardcoded in Code nodes (credential header format had issues)
- ClickUp Team ID (9011968555) ≠ Space ID (90114014960) — stored separately in Client Roster

---

## Decision 6: Sub-Workflow Pattern

**Choice:** Three shared sub-workflows (client-lookup, ai-api-wrapper, error-handler) called by all other workflows.

**Rationale:**
- DRY principle — client lookup logic, AI routing, and error handling defined once
- Configuration changes propagate automatically
- ai-api-wrapper abstracts model routing (Gemini vs Claude) from calling workflows
- error-handler provides centralized logging and alerting

**Trade-offs:**
- Sub-workflows can't be executed directly via MCP — need webhook wrappers for testing
- Adds latency (sub-workflow call overhead)

---

## Decision 7: Google Drive over OneDrive

**Choice:** Google Drive for all file storage (fully replaced OneDrive).

**Rationale:**
- Consistent ecosystem — Google Sheets, Docs, Drive, Gmail all use same OAuth
- Native n8n integration
- Client folder structure: one Drive folder per client, ID stored in Client Roster
- Google Docs for collaborative artifacts (agendas, proposals, meeting notes)
