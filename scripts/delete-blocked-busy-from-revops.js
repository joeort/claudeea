const https = require('https');
const config = require('../.mcp.json');
const N8N_API_KEY = config.mcpServers['n8n-mcp'].env.N8N_API_KEY;

function apiRequest(method, urlPath, body) {
  return new Promise((resolve) => {
    const url = new URL(urlPath, 'https://n8n.revopsinflection.com');
    const opts = { method, headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Content-Type': 'application/json' } };
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(body);
    const req = https.request(url, opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    if (body) req.write(body);
    req.end();
  });
}

const CLEANUP_ID = 'cB2ltgxTU7oMtk7I';
const TIME_PARAMS = [
  { name: 'timeMin', value: '={{ $now.minus({ days: 90 }).toISO() }}' },
  { name: 'timeMax', value: '={{ $now.plus({ days: 60 }).toISO() }}' },
  { name: 'singleEvents', value: 'true' },
  { name: 'maxResults', value: '2500' },
  { name: 'showDeleted', value: 'false' }
];

// Sequential chain: webhook → fetch blocked on revops → agg →
//   fetch all iceberg prefix on revops → agg →
//   fetch all iceberg calendar → build delete list → has events? → route → delete → summary
const workflow = {
  name: 'calendar-sync-cleanup',
  nodes: [
    {
      parameters: { path: 'calendar-sync-cleanup', httpMethod: 'GET', responseMode: 'lastNode' },
      id: 'webhook-trigger', name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook', typeVersion: 2, position: [160, 400],
      webhookId: 'calendar-sync-cleanup'
    },
    {
      parameters: {
        method: 'GET',
        url: 'https://www.googleapis.com/calendar/v3/calendars/joe%40revopsinflection.com/events',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googleCalendarOAuth2Api',
        sendQuery: true,
        queryParameters: { parameters: [...TIME_PARAMS, { name: 'q', value: '[Blocked] Busy' }] },
        options: {}
      },
      id: 'fetch-revops-blocked', name: 'Fetch RevOps Blocked',
      type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [400, 400],
      credentials: { googleCalendarOAuth2Api: { id: 'dZ2lCgJhToJOSI7t', name: 'RevOps Calendar - joe@revopsinflection.com' } }
    },
    {
      parameters: {
        jsCode: 'const items = $input.first().json.items || [];\nreturn [{ json: { blockedOnRevops: items } }];',
        mode: 'runOnceForAllItems'
      },
      id: 'agg-blocked', name: 'Agg Blocked',
      type: 'n8n-nodes-base.code', typeVersion: 2, position: [620, 400]
    },
    {
      parameters: {
        method: 'GET',
        url: 'https://www.googleapis.com/calendar/v3/calendars/joe%40revopsinflection.com/events',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googleCalendarOAuth2Api',
        sendQuery: true,
        queryParameters: { parameters: [...TIME_PARAMS, { name: 'q', value: '[Iceberg]' }] },
        options: {}
      },
      id: 'fetch-revops-iceberg', name: 'Fetch RevOps Iceberg Prefix',
      type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [840, 400],
      credentials: { googleCalendarOAuth2Api: { id: 'dZ2lCgJhToJOSI7t', name: 'RevOps Calendar - joe@revopsinflection.com' } }
    },
    {
      parameters: {
        jsCode: 'const prev = $("Agg Blocked").first().json;\nconst items = $input.first().json.items || [];\nreturn [{ json: { ...prev, icebergPrefixOnRevops: items } }];',
        mode: 'runOnceForAllItems'
      },
      id: 'agg-iceberg-prefix', name: 'Agg Iceberg Prefix',
      type: 'n8n-nodes-base.code', typeVersion: 2, position: [1060, 400]
    },
    {
      parameters: {
        method: 'GET',
        url: 'https://www.googleapis.com/calendar/v3/calendars/jort%40icebergops.com/events',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googleCalendarOAuth2Api',
        sendQuery: true,
        queryParameters: { parameters: TIME_PARAMS },
        options: {}
      },
      id: 'fetch-iceberg-all', name: 'Fetch Iceberg All',
      type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [1280, 400],
      credentials: { googleCalendarOAuth2Api: { id: 'mNQ6oDJf55C2j6vl', name: 'Iceberg Calendar - jort@icebergops.com' } }
    },
    {
      parameters: {
        jsCode: [
          'const ALL_SYNC_TAGS = ["n8n-calendar-sync", "n8n-calendar-sync-iceberg"];',
          'function getSyncSource(e) { return e.extendedProperties?.private?.syncSource || null; }',
          'function isTagged(e) { const src = getSyncSource(e); return src && ALL_SYNC_TAGS.includes(src); }',
          '',
          'const prev = $("Agg Iceberg Prefix").first().json;',
          'const blockedOnRevops = prev.blockedOnRevops || [];',
          'const icebergPrefixOnRevops = prev.icebergPrefixOnRevops || [];',
          'const icebergAll = $input.first().json.items || [];',
          '',
          'const deleteActions = [];',
          '',
          '// 1. Delete ALL [Blocked] Busy events from RevOps - these should NOT exist on RevOps',
          'for (const e of blockedOnRevops) {',
          '  if ((e.summary || "").trim() === "[Blocked] Busy") {',
          '    deleteActions.push({ calendarId: "joe%40revopsinflection.com", credential: "revops", eventId: e.id, summary: e.summary, reason: "blocked-on-revops" });',
          '  }',
          '}',
          '',
          '// 2. Handle [Iceberg] prefixed events on RevOps',
          '// - untagged ones are ghost copies from the loop, delete them',
          '// - tagged ones: deduplicate (keep newest, delete older)',
          'const bySrcId = new Map();',
          'for (const e of icebergPrefixOnRevops) {',
          '  if (!(e.summary || "").startsWith("[Iceberg]")) continue;',
          '  const srcId = e.extendedProperties?.private?.syncSourceId || null;',
          '  if (!srcId) {',
          '    deleteActions.push({ calendarId: "joe%40revopsinflection.com", credential: "revops", eventId: e.id, summary: e.summary, reason: "untagged-iceberg-on-revops" });',
          '  } else {',
          '    if (!bySrcId.has(srcId)) bySrcId.set(srcId, []);',
          '    bySrcId.get(srcId).push(e);',
          '  }',
          '}',
          'for (const [srcId, events] of bySrcId) {',
          '  if (events.length > 1) {',
          '    events.sort((a, b) => new Date(b.updated) - new Date(a.updated));',
          '    for (const e of events.slice(1)) {',
          '      deleteActions.push({ calendarId: "joe%40revopsinflection.com", credential: "revops", eventId: e.id, summary: e.summary, reason: "dup-iceberg-on-revops" });',
          '    }',
          '  }',
          '}',
          '',
          '// 3. Deduplicate Iceberg calendar synced events',
          'const icebergBySrcId = new Map();',
          'for (const e of icebergAll) {',
          '  if (!isTagged(e)) continue;',
          '  const srcId = e.extendedProperties?.private?.syncSourceId || null;',
          '  if (!srcId) {',
          '    deleteActions.push({ calendarId: "jort%40icebergops.com", credential: "iceberg", eventId: e.id, summary: e.summary, reason: "untagged-on-iceberg" });',
          '  } else {',
          '    if (!icebergBySrcId.has(srcId)) icebergBySrcId.set(srcId, []);',
          '    icebergBySrcId.get(srcId).push(e);',
          '  }',
          '}',
          'for (const [srcId, events] of icebergBySrcId) {',
          '  if (events.length > 1) {',
          '    events.sort((a, b) => new Date(b.updated) - new Date(a.updated));',
          '    for (const e of events.slice(1)) {',
          '      deleteActions.push({ calendarId: "jort%40icebergops.com", credential: "iceberg", eventId: e.id, summary: e.summary, reason: "dup-on-iceberg" });',
          '    }',
          '  }',
          '}',
          '',
          'console.log("[Blocked] Busy on RevOps: " + deleteActions.filter(a => a.reason === "blocked-on-revops").length);',
          'console.log("Untagged [Iceberg] on RevOps: " + deleteActions.filter(a => a.reason === "untagged-iceberg-on-revops").length);',
          'console.log("Dup [Iceberg] on RevOps: " + deleteActions.filter(a => a.reason === "dup-iceberg-on-revops").length);',
          'console.log("Untagged on Iceberg: " + deleteActions.filter(a => a.reason === "untagged-on-iceberg").length);',
          'console.log("Dup on Iceberg: " + deleteActions.filter(a => a.reason === "dup-on-iceberg").length);',
          'console.log("Total to delete: " + deleteActions.length);',
          '',
          'if (deleteActions.length === 0) return [{ json: { calendarId: "none", credential: "none", eventId: "none", summary: "Already clean!", reason: "", url: "" } }];',
          'return deleteActions.map(a => ({ json: { ...a, url: "https://www.googleapis.com/calendar/v3/calendars/" + a.calendarId + "/events/" + a.eventId + "?sendUpdates=none" } }));'
        ].join('\n'),
        mode: 'runOnceForAllItems'
      },
      id: 'build-delete-list', name: 'Build Delete List',
      type: 'n8n-nodes-base.code', typeVersion: 2, position: [1500, 400]
    },
    {
      parameters: { conditions: { string: [{ value1: '={{ $json.calendarId }}', operation: 'notEqual', value2: 'none' }] } },
      id: 'has-events', name: 'Has Events?',
      type: 'n8n-nodes-base.if', typeVersion: 1, position: [1720, 400]
    },
    {
      parameters: { conditions: { string: [{ value1: '={{ $json.credential }}', operation: 'equal', value2: 'revops' }] } },
      id: 'route-credential', name: 'Is RevOps?',
      type: 'n8n-nodes-base.if', typeVersion: 1, position: [1940, 300]
    },
    {
      parameters: {
        method: 'DELETE', url: '={{ $json.url }}',
        authentication: 'predefinedCredentialType', nodeCredentialType: 'googleCalendarOAuth2Api',
        options: { response: { response: { neverError: true } }, batching: { batch: { batchSize: 3, batchInterval: 1000 } } }
      },
      id: 'delete-revops', name: 'Delete RevOps',
      type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [2160, 180],
      credentials: { googleCalendarOAuth2Api: { id: 'dZ2lCgJhToJOSI7t', name: 'RevOps Calendar - joe@revopsinflection.com' } }
    },
    {
      parameters: {
        method: 'DELETE', url: '={{ $json.url }}',
        authentication: 'predefinedCredentialType', nodeCredentialType: 'googleCalendarOAuth2Api',
        options: { response: { response: { neverError: true } }, batching: { batch: { batchSize: 3, batchInterval: 1000 } } }
      },
      id: 'delete-iceberg', name: 'Delete Iceberg',
      type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [2160, 420],
      credentials: { googleCalendarOAuth2Api: { id: 'mNQ6oDJf55C2j6vl', name: 'Iceberg Calendar - jort@icebergops.com' } }
    },
    {
      parameters: {
        jsCode: 'const items = $input.all();\nconst total = items.length;\nconst errors = items.filter(i => i.json.statusCode && i.json.statusCode >= 400).length;\nreturn [{ json: { status: "title-cleanup complete", totalDeleted: total - errors, errors, timestamp: new Date().toISOString() } }];',
        mode: 'runOnceForAllItems'
      },
      id: 'summary', name: 'Summary',
      type: 'n8n-nodes-base.code', typeVersion: 2, position: [2380, 300]
    }
  ],
  connections: {
    'Webhook Trigger': { main: [[{ node: 'Fetch RevOps Blocked', type: 'main', index: 0 }]] },
    'Fetch RevOps Blocked': { main: [[{ node: 'Agg Blocked', type: 'main', index: 0 }]] },
    'Agg Blocked': { main: [[{ node: 'Fetch RevOps Iceberg Prefix', type: 'main', index: 0 }]] },
    'Fetch RevOps Iceberg Prefix': { main: [[{ node: 'Agg Iceberg Prefix', type: 'main', index: 0 }]] },
    'Agg Iceberg Prefix': { main: [[{ node: 'Fetch Iceberg All', type: 'main', index: 0 }]] },
    'Fetch Iceberg All': { main: [[{ node: 'Build Delete List', type: 'main', index: 0 }]] },
    'Build Delete List': { main: [[{ node: 'Has Events?', type: 'main', index: 0 }]] },
    'Has Events?': { main: [[{ node: 'Is RevOps?', type: 'main', index: 0 }], []] },
    'Is RevOps?': { main: [
      [{ node: 'Delete RevOps', type: 'main', index: 0 }],
      [{ node: 'Delete Iceberg', type: 'main', index: 0 }]
    ]},
    'Delete RevOps': { main: [[{ node: 'Summary', type: 'main', index: 0 }]] },
    'Delete Iceberg': { main: [[{ node: 'Summary', type: 'main', index: 0 }]] }
  },
  settings: { executionOrder: 'v1' }
};

async function main() {
  const body = JSON.stringify({ name: workflow.name, nodes: workflow.nodes, connections: workflow.connections, settings: workflow.settings });

  console.log('Deploying title-based cleanup workflow...');
  const putResult = await apiRequest('PUT', `/api/v1/workflows/${CLEANUP_ID}`, body);
  if (putResult.status === 200) {
    console.log('  Updated OK');
  } else {
    console.log('  FAILED HTTP ' + putResult.status + ': ' + JSON.stringify(putResult.body).substring(0, 300));
    process.exit(1);
  }

  console.log('Activating...');
  const activateResult = await apiRequest('POST', `/api/v1/workflows/${CLEANUP_ID}/activate`, null);
  console.log('  Activate:', activateResult.status);
}

main().catch(console.error);
