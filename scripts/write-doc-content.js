// Write meeting notes content to the existing empty Google Doc
// Uses a temp n8n workflow to leverage the Google Docs OAuth2 credential
const https = require('https');
const fs = require('fs');

const mcpConfig = JSON.parse(fs.readFileSync('c:/Users/josep/OneDrive/Claude Code/Claude EA/.mcp.json', 'utf8'));
const API_KEY = mcpConfig.mcpServers['n8n-mcp'].env.N8N_API_KEY;
const DOC_ID = '1cx04TtONBZ2CKxERrBYMbKdy4eiLFPurGgp8HNC0rO8';
const notesContent = fs.readFileSync('c:/Users/josep/OneDrive/Claude Code/Claude EA/scripts/meeting_notes_temp.txt', 'utf8');

function apiRequest(method, path, body) {
  return new Promise(function(resolve, reject) {
    const options = {
      hostname: 'n8n.revopsinflection.com',
      path: '/api/v1' + path,
      method: method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, function(res) {
      let data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() { resolve(JSON.parse(data)); });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const batchBody = JSON.stringify({
    requests: [{
      insertText: {
        text: notesContent,
        location: { index: 1 }
      }
    }]
  });

  const webhookPath = 'temp-write-doc-' + Date.now();
  const testWorkflow = {
    name: 'temp-write-doc-content',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: webhookPath,
          responseMode: 'lastNode',
          options: {}
        },
        id: 'trigger',
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [0, 0],
        webhookId: webhookPath
      },
      {
        parameters: {
          method: 'POST',
          url: 'https://docs.googleapis.com/v1/documents/' + DOC_ID + '/batchUpdate',
          authentication: 'predefinedCredentialType',
          nodeCredentialType: 'googleDocsOAuth2Api',
          sendBody: true,
          specifyBody: 'json',
          jsonBody: batchBody,
          options: {}
        },
        id: 'write-doc',
        name: 'Write Doc',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 0],
        credentials: {
          googleDocsOAuth2Api: {
            id: 'bbU1KBLk0uDZ3wms',
            name: 'Google Docs account'
          }
        }
      }
    ],
    connections: {
      'Webhook': {
        main: [[{ node: 'Write Doc', type: 'main', index: 0 }]]
      }
    },
    settings: { executionOrder: 'v1' }
  };

  console.log('Creating temp workflow...');
  const created = await apiRequest('POST', '/workflows', testWorkflow);
  if (!created.id) {
    console.log('Failed to create:', JSON.stringify(created).substring(0, 300));
    return;
  }
  console.log('Created workflow:', created.id);

  // Activate so webhook is live
  await apiRequest('POST', '/workflows/' + created.id + '/activate');
  console.log('Activated');

  // Wait a moment for webhook to register
  await new Promise(r => setTimeout(r, 2000));

  // Trigger via webhook
  console.log('Triggering webhook...');
  const webhookResult = await new Promise(function(resolve, reject) {
    const options = {
      hostname: 'n8n.revopsinflection.com',
      path: '/webhook/' + webhookPath,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    const req = https.request(options, function(res) {
      let data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        console.log('Webhook response status:', res.statusCode);
        try { resolve(JSON.parse(data)); } catch(e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.write('{}');
    req.end();
  });

  console.log('Result:', JSON.stringify(webhookResult).substring(0, 300));

  // Check last execution for this workflow
  await new Promise(r => setTimeout(r, 2000));
  const execs = await apiRequest('GET', '/executions?workflowId=' + created.id + '&limit=1&includeData=true');
  if (execs.data && execs.data[0]) {
    const ex = execs.data[0];
    console.log('Execution status:', ex.status);
    var rd = ex.data && ex.data.resultData;
    if (rd && rd.error) {
      console.log('Error:', JSON.stringify(rd.error.message || rd.error).substring(0, 500));
    }
    if (rd && rd.runData) {
      Object.keys(rd.runData).forEach(function(k) {
        var nd = rd.runData[k][0];
        if (nd.error) console.log('Node', k, 'error:', nd.error.message);
        if (nd.data && nd.data.main && nd.data.main[0] && nd.data.main[0][0]) {
          console.log('Node', k, 'output:', JSON.stringify(nd.data.main[0][0].json).substring(0, 300));
        }
      });
    }
  }

  // Clean up
  await apiRequest('POST', '/workflows/' + created.id + '/deactivate');
  await apiRequest('DELETE', '/workflows/' + created.id);
  console.log('Cleaned up temp workflow');
}

main().catch(console.error);
