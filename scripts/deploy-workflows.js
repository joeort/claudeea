const fs = require('fs');
const path = require('path');
const https = require('https');

const config = require('../.mcp.json');
const N8N_API_KEY = config.mcpServers['n8n-mcp'].env.N8N_API_KEY;
const N8N_URL = 'https://n8n.revopsinflection.com';

const workflows = [
  { file: 'n8n-workflows/shared/calendar-sync.json', id: 'Xe4FrbXLSfHoGuWb', name: 'calendar-sync' },
  { file: 'n8n-workflows/shared/calendar-sync-iceberg.json', id: 'IzSxVR2JHM3OItOnRu5Iq', name: 'calendar-sync-iceberg' },
  { file: 'n8n-workflows/shared/error-handler.json', id: '4hiumJ5C9tlJwRBI', name: 'error-handler' },
  { file: 'n8n-workflows/phase1-foundation/meeting-prep.json', id: 'Uldzen1iaokPSlbI', name: 'meeting-prep' },
];

async function deployWorkflow(wfInfo) {
  const filePath = path.join(__dirname, '..', wfInfo.file);
  const wf = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const body = JSON.stringify({
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings || {},
  });

  return new Promise((resolve, reject) => {
    const url = new URL(`/api/v1/workflows/${wfInfo.id}`, N8N_URL);
    const req = https.request(url, {
      method: 'PUT',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log(`  ✓ ${wfInfo.name}: deployed (updated ${result.updatedAt})`);
            resolve(result);
          } else {
            console.log(`  ✗ ${wfInfo.name}: HTTP ${res.statusCode} - ${result.message || data.substring(0, 200)}`);
            resolve(null);
          }
        } catch (e) {
          console.log(`  ✗ ${wfInfo.name}: Parse error - ${data.substring(0, 200)}`);
          resolve(null);
        }
      });
    });
    req.on('error', (e) => {
      console.log(`  ✗ ${wfInfo.name}: ${e.message}`);
      resolve(null);
    });
    req.write(body);
    req.end();
  });
}

async function activateWorkflow(wfInfo) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/api/v1/workflows/${wfInfo.id}/activate`, N8N_URL);
    const req = https.request(url, {
      method: 'POST',
      headers: { 'X-N8N-API-KEY': N8N_API_KEY },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        console.log(`  ✓ ${wfInfo.name}: active=${result.active}`);
        resolve(result);
      });
    });
    req.on('error', (e) => {
      console.log(`  ✗ ${wfInfo.name} activate: ${e.message}`);
      resolve(null);
    });
    req.end();
  });
}

async function main() {
  console.log('Deploying workflows to n8n...\n');
  for (const wf of workflows) {
    const result = await deployWorkflow(wf);
    if (result) {
      await activateWorkflow(wf);
    }
    console.log('');
  }
  console.log('Done.');
}

main().catch(console.error);
