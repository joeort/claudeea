# calendar-sync — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `Xe4FrbXLSfHoGuWb` |
| **Status** | Active — Blackthorn configured |
| **Phase** | Shared — Utility |
| **Model** | None (no AI) |
| **Prompt File** | N/A |
| **JSON File** | `n8n-workflows/shared/calendar-sync.json` |
| **Dependencies** | Google Calendar (2 OAuth credentials — RevOps + Blackthorn) |
| **Triggers** | Schedule: every 15 minutes |

## Purpose
Bi-directional calendar sync between RevOps calendar (joe@revopsinflection.com) and a client Google Workspace calendar (joe.ort-contractor@blackthorn.io). Prevents double-booking across accounts.

- **RevOps → Client**: Creates `[Blocked] Busy` events (no details shared)
- **Client → RevOps**: Copies full event name + description with `[Blackthorn]` prefix

## Anti-Loop Design
Two-layer protection against circular syncing:

### Layer 1: ExtendedProperties Tagging
Every event created by this workflow is tagged with `extendedProperties.private.syncSource = "n8n-calendar-sync"` and `syncSourceId = <original-event-id>`. The diff logic:
1. Reads source calendar → **excludes** tagged events (our copies)
2. Reads target calendar → **only** tagged events (our copies)
3. Diffs real source events against our managed copies → create/update/delete

Tagged events are never re-synced. No circular loop possible.

### Layer 2: Shared Meeting Detection
Events where both accounts are attendees (shared meetings) are skipped entirely. If `joe@revopsinflection.com` is an attendee on a Blackthorn calendar event, it won't be synced — the meeting already appears on both calendars natively.

## Node Architecture
| Node | Type | Credential | Purpose |
|------|------|------------|---------|
| Schedule Trigger | scheduleTrigger | — | Every 15 min |
| Fetch RevOps Events | Google Calendar | RevOps OAuth2 | Read RevOps calendar events |
| Fetch Client Events | Google Calendar | Blackthorn OAuth2 | Read Blackthorn calendar events |
| Aggregate RevOps | Code | — | Collect all RevOps events into array |
| Aggregate Client | Code | — | Collect all client events into array |
| Wait for Both | Merge | — | Wait for both fetches to complete |
| Compute Diff & Build Actions | Code | — | Core sync logic: filter, diff, build action items |
| Route by Direction | IF | — | Split actions by target calendar |
| Write to Client Calendar | HTTP Request | Blackthorn OAuth2 | Create/update/delete busy blocks |
| Write to RevOps Calendar | HTTP Request | RevOps OAuth2 | Create/update/delete full copies |
| Log Summary | Code | — | Output sync summary |

**Why this architecture:**
- **Google Calendar nodes** for reads: native OAuth2 authentication, no credential ID management
- **HTTP Request nodes** for writes: support `extendedProperties` (native Calendar nodes don't)
- **Code nodes** for logic only: n8n Code node sandbox doesn't have `URLSearchParams` or `httpRequestWithAuthentication`

## Data Flow
1. Schedule trigger fires every 15 minutes
2. **Parallel**: Fetch RevOps events (RevOps credential) + Fetch Client events (Blackthorn credential)
3. Aggregate nodes collect events into arrays
4. Merge node waits for both fetches
5. Compute Diff & Build Actions:
   - Separates real events from synced (tagged) events on each calendar
   - Skips shared meetings (both accounts are attendees)
   - Computes creates/updates/deletes for both directions
   - Outputs individual action items with method, URL, and body
6. Route by Direction: splits actions to client vs RevOps calendar
7. Write to Client Calendar: execute actions with batching (3 per batch, 1s interval)
8. Write to RevOps Calendar: execute actions with batching (3 per batch, 1s interval)
9. Log Summary

## Credentials
| Credential | n8n ID | Account | Used By |
|------------|--------|---------|---------|
| RevOps Google Calendar OAuth2 | `dZ2lCgJhToJOSI7t` | joe@revopsinflection.com | Fetch RevOps Events, Write to RevOps Calendar |
| Blackthorn Google Calendar OAuth2 | `xhKqi8iJDl6w5bh6` | joe.ort-contractor@blackthorn.io | Fetch Client Events, Write to Client Calendar |

## Configuration
### Completed:
- [x] Google Calendar OAuth2 credential for Blackthorn workspace account
- [x] Calendar selections configured in n8n UI (joe@revopsinflection.com, primary for Blackthorn)
- [x] `[Blackthorn]` prefix configured for Client → RevOps sync
- [x] Batching configured (3 requests per batch, 1s interval) to avoid rate limits
- [x] Reminders disabled on all synced events (`useDefault: false, overrides: []`)
- [x] Shared meeting deduplication (attendee check for both email addresses)

### Still needed:
- [ ] Disable any existing Zapier calendar sync zap
- [ ] Clean up duplicate events from initial test run (March 3 duplicates)

## Integration Points
- **Reads from:** Google Calendar API (both accounts via native nodes)
- **Writes to:** Google Calendar API (both accounts via HTTP Request nodes)
- **No sub-workflow calls** (standalone utility)

## Known Issues
- Google Calendar nodes in n8n don't support `extendedProperties`, so write operations use HTTP Request nodes with predefined OAuth2 credentials
- n8n Code node sandbox lacks `URLSearchParams` and `httpRequestWithAuthentication` — all HTTP calls must go through dedicated HTTP Request nodes
- Batching (3 req/batch, 1s interval) needed to avoid Google Calendar API rate limits — first run with 27 actions hit 9 rate limit errors before batching was added
- Events that existed before this workflow was activated won't be managed until the next sync cycle after activation
- Google Workspace Internal OAuth consent screen restricts login to organization members — credential must be created by someone with access to the target workspace

## Testing
- **Test harness:** None — test by manual execution in n8n
- **First successful run:** 2026-02-27 — 18 of 27 actions succeeded (before batching fix)
- **Verification steps:**
  1. Create a test event on RevOps calendar → run workflow → verify `[Blocked] Busy` appears on client calendar
  2. Create a test event on client calendar → run workflow → verify `[Blackthorn] Event Title` appears on RevOps calendar
  3. Run workflow again → verify no duplicates created
  4. Delete the test source event → run workflow → verify synced copy is removed
  5. Check `extendedProperties` on synced events to confirm tags are set
  6. Verify shared meetings (both accounts as attendees) are NOT duplicated

## Changelog
| Date | Change |
|------|--------|
| 2026-02-27 | Initial workflow created |
| 2026-02-27 | Restructured: Code nodes → Google Calendar nodes (reads) + HTTP Request nodes (writes) |
| 2026-02-27 | Fixed credential setup: Blackthorn OAuth2 `xhKqi8iJDl6w5bh6` |
| 2026-02-27 | Added batching (3/batch, 1s interval) to fix rate limit errors |
| 2026-02-27 | Added shared meeting deduplication (attendee email check) |
| 2026-02-27 | Disabled reminders on all synced events |
| 2026-02-27 | Fixed DELETE body: empty string → `{}` to avoid JSON parse error |
