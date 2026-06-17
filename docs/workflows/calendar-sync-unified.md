# calendar-sync-unified — Workflow Companion Doc

## Metadata
| Field | Value |
|-------|-------|
| **n8n ID** | `Xe4FrbXLSfHoGuWb` |
| **Status** | Active — Confirmed working 2026-05-13 |
| **Phase** | Shared — Utility |
| **Model** | None (no AI) |
| **Prompt File** | N/A |
| **JSON File** | `n8n-workflows/shared/calendar-sync-unified.json` |
| **Replaced** | `calendar-sync` + `calendar-sync-iceberg` (both archived) |
| **Dependencies** | Google Calendar OAuth2 (3 credentials — RevOps, Blackthorn, Iceberg) |
| **Triggers** | Schedule: every 15 minutes |

## Purpose
Tri-directional calendar sync between RevOps (joe@revopsinflection.com), Blackthorn (joe.ort-contractor@blackthorn.io), and Iceberg (jort@icebergops.com) Google calendars. Prevents double-booking across all three accounts.

**6 sync directions:**
1. RevOps real → Blackthorn: `[Blocked] Busy` (private, no details)
2. RevOps real → Iceberg: `[Blocked] Busy` (private, no details)
3. Blackthorn real → RevOps: `[Blackthorn] EventName` (full title)
4. Blackthorn real → Iceberg: `[Blocked] Busy` (private, no details)
5. Iceberg real → RevOps: `[Iceberg] EventName` (full title)
6. Iceberg real → Blackthorn: `[Blocked] Busy` (private, no details)

## Anti-Loop Design

### ExtendedProperties Tagging
Every synced event is tagged with:
- `extendedProperties.private.syncSource` — either `n8n-calendar-sync` (BT-related) or `n8n-calendar-sync-iceberg` (ICE-related)
- `extendedProperties.private.syncSourceId` — the source event's Google Calendar ID

The diff logic classifies each event as "real" or "synced" using these tags. Real events are synced; synced events are never re-synced. No circular loops possible.

### Attendee Skip
If the target calendar's email address already appears in the source event's attendees list, the event is a shared meeting (appears on both calendars natively) and is skipped entirely.

### Orphan Cleanup
After processing all sync directions, any remaining entries in the 4 dedup maps (btSynced, iceSynced, revopsBtSynced, revopsIceSynced) represent events whose source was deleted — they get deleted from the target calendar.

## Node Architecture (15 nodes)
| Node | Type | Purpose |
|------|------|---------|
| Every 15 Minutes | scheduleTrigger | Fires every 15 min |
| Fetch RevOps Events | HTTP Request (RevOps cred) | GET calendar events, now → +30 days |
| Agg RevOps | Code | Normalize to `{ events, count }` |
| Fetch Blackthorn Events | HTTP Request (BT cred) | GET calendar events, now → +30 days |
| Agg Blackthorn | Code | Normalize to `{ events, count }` |
| Fetch Iceberg Events | HTTP Request (ICE cred) | GET calendar events, now → +30 days |
| Agg Iceberg | Code | Normalize to `{ events, count }` |
| Compute All Diffs | Code (`runOnceForAllItems`) | Core logic: classify, build 4 maps, compute 6 directions, dedup, output action items |
| Has Actions? | IF v1 | `credential === 'none'` → skip to Log Summary |
| Route by Credential | IF v1 | `credential === 'revops'` → Write to RevOps |
| Route Blackthorn | IF v1 | `credential === 'blackthorn'` → Write to BT; else → Write to ICE |
| Write to RevOps Calendar | HTTP Request (RevOps cred) | Execute POST/PATCH/DELETE, batchSize:3, interval:1s |
| Write to Blackthorn Calendar | HTTP Request (BT cred) | Execute POST/PATCH/DELETE, batchSize:3, interval:1s |
| Write to Iceberg Calendar | HTTP Request (ICE cred) | Execute POST/PATCH/DELETE, batchSize:3, interval:1s |
| Log Summary | Code | Count total actions and errors, output summary |

**Sequential fetch chain** (not parallel): Schedule → Fetch RevOps → Agg RevOps → Fetch BT → Agg BT → Fetch ICE → Agg ICE → Compute All Diffs. Required to avoid n8n v1 parallel execution race conditions.

## Credentials
| Account | n8n Credential ID | Used By |
|---------|-------------------|---------|
| RevOps (joe@revopsinflection.com) | `dZ2lCgJhToJOSI7t` | Fetch RevOps, Write to RevOps |
| Blackthorn (joe.ort-contractor@blackthorn.io) | `xhKqi8iJDl6w5bh6` | Fetch Blackthorn, Write to Blackthorn |
| Iceberg (jort@icebergops.com) | `mNQ6oDJf55C2j6vl` | Fetch Iceberg, Write to Iceberg |

## Configuration
All configuration is embedded in the workflow JSON. No external config needed.

- [x] RevOps, Blackthorn, Iceberg credentials configured
- [x] Sequential fetch chain (avoids parallel race conditions)
- [x] Time window: `$now` to `$now.plus({ days: 30 })` (no past events)
- [x] POST dedup by `[calId, start.dateTime, end.dateTime]` (prevents ghost duplicate blocks)
- [x] Batching: 3 req/batch, 1s interval on all write nodes
- [x] `sendUpdates=none` on all Calendar API writes (no email notifications)
- [x] `neverError: true` on all write nodes (errors captured as data, not node failures)
- [x] IF node v1 (v2 broken in current n8n — caseSensitive bug)
- [x] Calendar IDs use literal `%40` encoding (not `encodeURIComponent`)

## Nuclear Cleanup
To wipe all synced events and start fresh:
1. Activate workflow `cB2ltgxTU7oMtk7I`
2. POST to `https://n8n.revopsinflection.com/webhook/calendar-sync-cleanup-run`
3. Re-deploy calendar-sync-unified if needed
4. Deactivate + reactivate to re-register scheduler

## Deployment Notes
After any API-based redeploy (PUT + activate), the scheduler trigger is NOT re-registered automatically. Always follow with:
```bash
curl -X POST "$N8N_URL/api/v1/workflows/Xe4FrbXLSfHoGuWb/deactivate" -H "X-N8N-API-KEY: $KEY"
curl -X POST "$N8N_URL/api/v1/workflows/Xe4FrbXLSfHoGuWb/activate" -H "X-N8N-API-KEY: $KEY"
```

## Testing / Verification
1. Check executions list — runs should appear every 15 min
2. Confirm Log Summary shows `errors: 0`
3. After initial seed: check Blackthorn calendar for `[Blocked] Busy` blocks matching RevOps events
4. Check Iceberg calendar for `[Blocked] Busy` blocks
5. Check RevOps calendar for `[Blackthorn] ...` and `[Iceberg] ...` events
6. Run again — second run should show `totalActions: 0` (idempotent)

## Changelog
| Date | Change |
|------|--------|
| 2026-05-13 | Created — replaced calendar-sync + calendar-sync-iceberg |
| 2026-05-13 | Fixed duplication bug: narrowed time window from -30/+90 days to now/+30 days; added POST dedup by [calId, start, end] |
| 2026-05-13 | Fixed scheduler: after API redeploy, deactivate+reactivate required to re-register trigger |
| 2026-05-13 | Confirmed working: execution 53040 — 27 RevOps + 36 BT + 52 ICE writes, 0 errors |
