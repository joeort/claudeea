const fs = require('fs');
const path = require('path');
const https = require('https');

const config = require('../.mcp.json');
const N8N_API_KEY = config.mcpServers['n8n-mcp'].env.N8N_API_KEY;
const CLEANUP_ID = 'cB2ltgxTU7oMtk7I';

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

// Simplified cleanup workflow: RevOps + Blackthorn only
const cleanupWorkflow = {
  name: 'calendar-sync-cleanup',
  nodes: [
    {
      parameters: { path: 'calendar-sync-cleanup', httpMethod: 'GET', responseMode: 'lastNode' },
      id: 'webhook-trigger', name: 'Manual Trigger',
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
        queryParameters: { parameters: [
          { name: 'timeMin', value: '={{ $now.minus({ days: 60 }).toISO() }}' },
          { name: 'timeMax', value: '={{ $now.plus({ days: 30 }).toISO() }}' },
          { name: 'singleEvents', value: 'true' },
          { name: 'maxResults', value: '2500' },
          { name: 'showDeleted', value: 'false' }
        ]},
        options: {}
      },
      id: 'fetch-revops', name: 'Fetch RevOps Events',
      type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [400, 300],
      credentials: { googleCalendarOAuth2Api: { id: 'dZ2lCgJhToJOSI7t', name: 'RevOps Calendar - joe@revopsinflection.com' } }
    },
    {
      parameters: {
        jsCode: [
          'const data = $input.first().json;',
          'const events = data.items || [];',
          'return [{ json: { calendarLabel: "revops", events } }];'
        ].join('\n'),
        mode: 'runOnceForAllItems'
      },
      id: 'agg-revops', name: 'Agg RevOps',
      type: 'n8n-nodes-base.code', typeVersion: 2, position: [620, 300]
    },
    {
      parameters: {
        method: 'GET',
        url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googleCalendarOAuth2Api',
        sendQuery: true,
        queryParameters: { parameters: [
          { name: 'timeMin', value: '={{ $now.minus({ days: 60 }).toISO() }}' },
          { name: 'timeMax', value: '={{ $now.plus({ days: 30 }).toISO() }}' },
          { name: 'singleEvents', value: 'true' },
          { name: 'maxResults', value: '2500' },
          { name: 'showDeleted', value: 'false' }
        ]},
        options: {}
      },
      id: 'fetch-blackthorn', name: 'Fetch Blackthorn Events',
      type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [840, 300],
      credentials: { googleCalendarOAuth2Api: { id: 'xhKqi8iJDl6w5bh6', name: 'Blackthorn Calendar account' } }
    },
    {
      parameters: {
        jsCode: [
          'const ALL_SYNC_TAGS = ["n8n-calendar-sync", "n8n-calendar-sync-iceberg"];',
          'function getSyncSource(e) { return e.extendedProperties?.private?.syncSource || null; }',
          '',
          'const revopsEvents = ($("Agg RevOps").first().json.events || []);',
          'const blackthornData = $input.first().json;',
          'const blackthornEvents = blackthornData.items || [];',
          '',
          'const deleteActions = [];',
          'for (const e of revopsEvents) {',
          '  const src = getSyncSource(e);',
          '  if (src && ALL_SYNC_TAGS.includes(src)) deleteActions.push({ calendarId: "joe%40revopsinflection.com", credential: "revops", eventId: e.id, summary: e.summary || "(no title)", syncSource: src });',
          '}',
          'for (const e of blackthornEvents) {',
          '  const src = getSyncSource(e);',
          '  if (src && ALL_SYNC_TAGS.includes(src)) deleteActions.push({ calendarId: "primary", credential: "blackthorn", eventId: e.id, summary: e.summary || "(no title)", syncSource: src });',
          '}',
          '',
          'console.log("RevOps synced events: " + revopsEvents.filter(e => ALL_SYNC_TAGS.includes(getSyncSource(e))).length);',
          'console.log("Blackthorn synced events: " + blackthornEvents.filter(e => ALL_SYNC_TAGS.includes(getSyncSource(e))).length);',
          'console.log("Total to delete: " + deleteActions.length);',
          '',
          'if (deleteActions.length === 0) return [{ json: { calendarId: "none", credential: "none", eventId: "none", summary: "Already clean!", syncSource: "", url: "" } }];',
          'return deleteActions.map(a => ({ json: { ...a, url: "https://www.googleapis.com/calendar/v3/calendars/" + a.calendarId + "/events/" + a.eventId + "?sendUpdates=none" } }));'
        ].join('\n'),
        mode: 'runOnceForAllItems'
      },
      id: 'build-delete-list', name: 'Build Delete List',
      type: 'n8n-nodes-base.code', typeVersion: 2, position: [1060, 300]
    },
    {
      parameters: { conditions: { string: [{ value1: '={{ $json.calendarId }}', operation: 'notEqual', value2: 'none' }] } },
      id: 'has-events', name: 'Has Events?',
      type: 'n8n-nodes-base.if', typeVersion: 1, position: [1280, 300]
    },
    {
      parameters: { conditions: { string: [{ value1: '={{ $json.credential }}', operation: 'equal', value2: 'revops' }] } },
      id: 'route-revops', name: 'Is RevOps?',
      type: 'n8n-nodes-base.if', typeVersion: 1, position: [1500, 200]
    },
    {
      parameters: {
        method: 'DELETE', url: '={{ $json.url }}',
        authentication: 'predefinedCredentialType', nodeCredentialType: 'googleCalendarOAuth2Api',
        options: { response: { response: { neverError: true } }, batching: { batch: { batchSize: 3, batchInterval: 1000 } } }
      },
      id: 'delete-revops', name: 'Delete RevOps',
      type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [1720, 100],
      credentials: { googleCalendarOAuth2Api: { id: 'dZ2lCgJhToJOSI7t', name: 'RevOps Calendar - joe@revopsinflection.com' } }
    },
    {
      parameters: {
        method: 'DELETE', url: '={{ $json.url }}',
        authentication: 'predefinedCredentialType', nodeCredentialType: 'googleCalendarOAuth2Api',
        options: { response: { response: { neverError: true } }, batching: { batch: { batchSize: 3, batchInterval: 1000 } } }
      },
      id: 'delete-blackthorn', name: 'Delete Blackthorn',
      type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [1720, 300],
      credentials: { googleCalendarOAuth2Api: { id: 'xhKqi8iJDl6w5bh6', name: 'Blackthorn Calendar account' } }
    },
    {
      parameters: {
        jsCode: [
          'const items = $input.all();',
          'const total = items.length;',
          'const errors = items.filter(i => i.json.statusCode && i.json.statusCode >= 400).length;',
          'return [{ json: { status: "cleanup complete", totalDeleted: total - errors, errors, timestamp: new Date().toISOString() } }];'
        ].join('\n'),
        mode: 'runOnceForAllItems'
      },
      id: 'summary', name: 'Summary',
      type: 'n8n-nodes-base.code', typeVersion: 2, position: [1940, 200]
    }
  ],
  connections: {
    'Manual Trigger': { main: [[{ node: 'Fetch RevOps Events', type: 'main', index: 0 }]] },
    'Fetch RevOps Events': { main: [[{ node: 'Agg RevOps', type: 'main', index: 0 }]] },
    'Agg RevOps': { main: [[{ node: 'Fetch Blackthorn Events', type: 'main', index: 0 }]] },
    'Fetch Blackthorn Events': { main: [[{ node: 'Build Delete List', type: 'main', index: 0 }]] },
    'Build Delete List': { main: [[{ node: 'Has Events?', type: 'main', index: 0 }]] },
    'Has Events?': { main: [[{ node: 'Is RevOps?', type: 'main', index: 0 }], []] },
    'Is RevOps?': { main: [
      [{ node: 'Delete RevOps', type: 'main', index: 0 }],
      [{ node: 'Delete Blackthorn', type: 'main', index: 0 }]
    ]},
    'Delete RevOps': { main: [[{ node: 'Summary', type: 'main', index: 0 }]] },
    'Delete Blackthorn': { main: [[{ node: 'Summary', type: 'main', index: 0 }]] }
  },
  settings: { executionOrder: 'v1' }
};

async function main() {
  const body = JSON.stringify({ name: cleanupWorkflow.name, nodes: cleanupWorkflow.nodes, connections: cleanupWorkflow.connections, settings: cleanupWorkflow.settings });

  console.log('Updating cleanup workflow (RevOps + Blackthorn only)...');
  const putResult = await apiRequest('PUT', `/api/v1/workflows/${CLEANUP_ID}`, body);
  if (putResult.status === 200) {
    console.log('  Updated OK');
  } else {
    console.log('  FAILED HTTP ' + putResult.status + ': ' + JSON.stringify(putResult.body).substring(0, 300));
    process.exit(1);
  }
}

main().catch(console.error);
