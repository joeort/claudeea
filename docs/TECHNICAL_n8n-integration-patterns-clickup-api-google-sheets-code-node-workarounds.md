# n8n Integration Patterns & Workarounds

## Document Metadata
| Field | Value |
|-------|-------|
| **Purpose** | Consolidated lessons learned from building 15 n8n workflows with ClickUp, Google Sheets, and external APIs |
| **Keywords** | n8n, integration, clickup, google sheets, code node, workaround, api, webhook, execution order, race condition |
| **Last Reviewed** | 2026-02-25 |

---

## ClickUp API Patterns

### Use Code Nodes, Not httpRequest Nodes
n8n's httpRequest node double-encodes query parameters with brackets (e.g., `space_ids[]`). This causes ClickUp API calls to fail silently or return wrong results.

**Do this:**
```javascript
// In a Code node
const response = await this.helpers.httpRequest({
  method: 'GET',
  url: 'https://api.clickup.com/api/v2/team/TEAM_ID/task',
  qs: {
    'space_ids[]': 'SPACE_ID',
    order_by: 'updated',
    statuses: ['open', 'in progress']
  },
  headers: {
    'Authorization': 'YOUR_CLICKUP_API_KEY'
  }
});
return [{ json: response }];
```

**Don't do this:** Use an httpRequest node with query parameters — brackets get double-encoded.

### Never Use `order_by=priority`
The ClickUp API returns a 500 error when `order_by=priority` is used. This is a ClickUp bug.

**Use instead:** `order_by=updated` or omit the parameter entirely.

### API Key in Code Nodes
ClickUp credential in n8n had header format issues. The workaround is to hardcode the API key directly in Code nodes.

### Team ID vs Space ID
These are different things:
- **Team ID** (9011968555): The workspace/organization identifier
- **Space ID** (90114014960): A container within the team for a specific client

Both are stored in the Client Roster sheet. Don't confuse them.

---

## Google Sheets Patterns

### sheetName Mode Must Be "name"
When referencing sheets by name in n8n workflow JSON, always use:
```json
{
  "sheetName": {
    "mode": "name",
    "value": "Sheet1"
  }
}
```

`"mode": "list"` does not work — it causes silent failures where the node runs but returns no data.

### Sheet ID Location
The Google Sheet ID is the long string in the URL between `/d/` and `/edit`:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
```

### Credential Reference
Google Sheets credential in n8n: ID `2k6FJ6yeOQ78iIre` ("Google Sheets account")

---

## n8n REST API Patterns

### Workflow Updates Use PUT, Not PATCH
To update a workflow via the n8n REST API:
```
PUT /api/v1/workflows/{id}
```
The request body **must** include all four fields: `name`, `nodes`, `connections`, `settings`.

### API Authentication
- Header: `X-N8N-API-KEY`
- Key stored in `.mcp.json` env `N8N_API_KEY`

### MCP Limitations
The n8n MCP endpoint (`/mcp-server/http`) can only:
- Search workflows
- Execute workflows
- Get workflow details

It **cannot**: create workflows, manage credentials, or modify workflow configurations.

---

## n8n Execution Order

### v1 Parallel Branch Race Condition
In n8n v1 execution order, when multiple parallel branches merge into a single downstream node, the execution order is non-deterministic. This causes intermittent failures where the downstream node only receives data from one branch.

**Fix:** Merge parallel API calls into a single Code node that makes all calls sequentially:
```javascript
// Instead of parallel branches to ClickUp + Calendar + Sheets
// Do this in one Code node:
const tasks = await this.helpers.httpRequest({ /* ClickUp */ });
const events = await this.helpers.httpRequest({ /* Calendar */ });
const config = await this.helpers.httpRequest({ /* Sheets */ });
return [{ json: { tasks, events, config } }];
```

This pattern is used in meeting-prep and weekly-client-updates.

---

## Sub-Workflow Testing Pattern

Sub-workflows (client-lookup, ai-api-wrapper, error-handler) can't be triggered directly via MCP or the n8n API. The workaround is to create **test harness workflows** with webhook triggers:

1. Create a new workflow with a Webhook trigger node
2. Connect it to the sub-workflow call
3. Add a response node to return the sub-workflow output
4. Test via the webhook URL

Example test harnesses:
- `test-client-lookup` (ID: `C4IQNjbcIShaHWMN`) — webhook at `/webhook/test-client-lookup`
- `test-meeting-prep` (ID: `27QAmWPwjwHQAma7`)

---

## Gmail Patterns

### Draft Creation
Gmail nodes in n8n may default to "send" instead of "createDraft". After importing a workflow, verify the operation is set to **createDraft** in the n8n UI.

This is critical for the human-in-the-loop pattern — you never want workflows auto-sending emails to clients.

---

## Gemini API Patterns

### Model ID Versioning
The ai-api-wrapper uses `gemini-2.5-pro-preview-05-06`. Preview model IDs rotate periodically. If API calls start failing with model-not-found errors, check for updated model IDs at https://aistudio.google.com/.

### Free Tier Rate Limits
| Model | Requests/Min | Tokens/Day |
|-------|-------------|------------|
| Gemini 2.0 Flash | 15 | 1,000,000 |
| Gemini 2.5 Pro | 5 | Lower (check current limits) |

Workflows are designed to stay well within these limits for a solo consultant workload.
