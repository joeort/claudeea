// Fix call-intelligence: Replace Google Docs node with HTTP Request nodes
// The n8n Google Docs node creates the doc but silently drops the content parameter.
// Fix: Use Drive API to create + Docs API batchUpdate to insert text.
const https = require('https');
const fs = require('fs');

const mcpConfig = JSON.parse(fs.readFileSync('c:/Users/josep/OneDrive/Claude Code/Claude EA/.mcp.json', 'utf8'));
const API_KEY = mcpConfig.mcpServers['n8n-mcp'].env.N8N_API_KEY;
const BASE_URL = 'n8n.revopsinflection.com';
const WORKFLOW_ID = 'LtDiO3rtO4OAMWmp';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: `/api/v1${path}`,
      method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('Fetching current workflow...');
  const w = await request('GET', `/workflows/${WORKFLOW_ID}`);
  console.log('Node count:', w.nodes.length);

  const nodes = w.nodes;
  const connections = w.connections;

  // Find and remove the old Google Docs node
  const gdocIdx = nodes.findIndex(n => n.id === 'save-notes-gdoc');
  if (gdocIdx < 0) {
    console.log('ERROR: save-notes-gdoc node not found');
    return;
  }
  const oldNode = nodes[gdocIdx];
  console.log('Found Google Docs node at index', gdocIdx, '- position:', oldNode.position);

  // Replace with: Create Meeting Doc (HTTP Request to Drive API)
  nodes[gdocIdx] = {
    parameters: {
      method: 'POST',
      url: 'https://www.googleapis.com/drive/v3/files',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleDocsOAuth2Api',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: "={{ JSON.stringify({ name: 'Meeting Notes: ' + $('Prepare ClickUp Tasks + Notes').first().json.meeting_title + ' - ' + $('Prepare ClickUp Tasks + Notes').first().json.meeting_date, mimeType: 'application/vnd.google-apps.document', parents: [$('Prepare ClickUp Tasks + Notes').first().json.google_drive_folder_id] }) }}",
      options: {}
    },
    id: 'create-meeting-doc',
    name: 'Create Meeting Doc',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: oldNode.position,
    credentials: {
      googleDocsOAuth2Api: {
        id: 'bbU1KBLk0uDZ3wms',
        name: 'Google Docs account'
      }
    },
    notes: 'Creates empty Google Doc in client Drive folder via Drive API.'
  };

  // Add new node: Write Meeting Notes (HTTP Request to Docs API batchUpdate)
  const writeNode = {
    parameters: {
      method: 'POST',
      url: '=https://docs.googleapis.com/v1/documents/{{ $json.id }}/batchUpdate',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleDocsOAuth2Api',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: "={{ JSON.stringify({ requests: [{ insertText: { text: $('Prepare ClickUp Tasks + Notes').first().json.meeting_notes_content, location: { index: 1 } } }] }) }}",
      options: {}
    },
    id: 'write-meeting-notes',
    name: 'Write Meeting Notes',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [oldNode.position[0] + 250, oldNode.position[1]],
    credentials: {
      googleDocsOAuth2Api: {
        id: 'bbU1KBLk0uDZ3wms',
        name: 'Google Docs account'
      }
    },
    notes: 'Inserts meeting notes content into the doc via Docs API batchUpdate.'
  };
  nodes.push(writeNode);

  // Update connections: rewire whatever pointed to old node -> Create Meeting Doc
  // And add Create Meeting Doc -> Write Meeting Notes
  for (const [nodeName, nodeConns] of Object.entries(connections)) {
    if (nodeConns.main) {
      for (const outputGroup of nodeConns.main) {
        if (outputGroup) {
          for (const conn of outputGroup) {
            if (conn.node === 'Save Meeting Notes to Google Doc') {
              conn.node = 'Create Meeting Doc';
              console.log(`Rewired connection from "${nodeName}" -> Create Meeting Doc`);
            }
          }
        }
      }
    }
  }

  // Add connection: Create Meeting Doc -> Write Meeting Notes
  connections['Create Meeting Doc'] = {
    main: [[{ node: 'Write Meeting Notes', type: 'main', index: 0 }]]
  };

  // Remove old connection key if it exists
  delete connections['Save Meeting Notes to Google Doc'];

  console.log('Deploying...');
  const result = await request('PUT', `/workflows/${WORKFLOW_ID}`, {
    name: w.name,
    nodes: nodes,
    connections: connections,
    settings: w.settings,
    staticData: w.staticData
  });

  if (result.id) {
    console.log('Deploy SUCCESS');
    console.log('Node count:', result.nodes.length);

    // Activate
    const act = await request('POST', `/workflows/${WORKFLOW_ID}/activate`);
    console.log('Activated:', act.active);
  } else {
    console.log('Deploy FAILED:', JSON.stringify(result).substring(0, 500));
  }
}

main().catch(console.error);
