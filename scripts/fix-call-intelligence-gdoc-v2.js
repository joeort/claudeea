// Fix call-intelligence: Update Write Meeting Notes to use Drive API upload
// Google Docs API wasn't propagated yet, Drive API works reliably.
// Drive API upload: PATCH /upload/drive/v3/files/{id}?uploadType=media with text/html
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
      headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' }
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

// Updated Prepare code: adds meeting_notes_html for Drive API upload
const PREPARE_CODE = `const analysis = $input.all()[0].json;
const meetingData = $('Merge Email + Client Data').first().json;
const parsed = typeof analysis.parsed_content === 'string'
  ? JSON.parse(analysis.parsed_content)
  : analysis.parsed_content;

const tasks = (parsed.action_items || []).map(item => ({
  name: item.action,
  description: \`**Owner:** \${item.owner}\\n**Priority:** \${item.priority}\\n**Deadline:** \${item.deadline}\\n**Category:** \${item.category}\\n**Context:** \${item.context}\\n\\n_From meeting: \${meetingData.meeting_title} (\${meetingData.meeting_date})_\`,
  priority: item.priority === 'high' ? 1 : item.priority === 'medium' ? 2 : 3,
  list_type: item.clickup_list,
  due_date: item.deadline !== 'ASAP' && item.deadline !== 'next meeting' ? item.deadline : null
}));

const highRisks = (parsed.risk_flags || []).filter(r => r.severity === 'high');

const meetingNotesContent = \`# \${meetingData.meeting_title}\\n\\n**Date:** \${meetingData.meeting_date}\\n**Attendees:** \${meetingData.attendees}\\n**Client:** \${meetingData.client_name}\\n\\n## Executive Summary\\n\${parsed.executive_summary}\\n\\n## Action Items\\n\${(parsed.action_items || []).map(i => \`- [\${i.owner}] \${i.action} (\${i.priority} priority, due: \${i.deadline})\`).join('\\n')}\\n\\n## Key Decisions\\n\${(parsed.key_decisions || []).map(d => \`- \${d.decision}: \${d.rationale}\`).join('\\n')}\\n\\n## Risk Flags\\n\${(parsed.risk_flags || []).map(r => \`- [\${r.severity}] \${r.type}: \${r.description}\`).join('\\n')}\\n\\n## Next Meeting Suggestions\\n\${(parsed.next_meeting_suggestions || []).map(s => \`- \${s}\`).join('\\n')}\\n\\n---\\n_Sentiment: \${parsed.sentiment} | Engagement Trend: \${parsed.engagement_health_delta}_\`;

// Build HTML for Google Docs (Drive API upload needs HTML)
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

const title = esc(meetingData.meeting_title);
const date = esc(meetingData.meeting_date);
const attendees = esc(meetingData.attendees);
const clientName = esc(meetingData.client_name);
const execSummary = esc(parsed.executive_summary);

const actionHtml = (parsed.action_items || []).map(i =>
  \`<li><b>[\${esc(i.owner)}]</b> \${esc(i.action)} (<i>\${esc(i.priority)} priority, due: \${esc(i.deadline)}</i>)</li>\`
).join('');

const decisionsHtml = (parsed.key_decisions || []).map(d =>
  \`<li><b>\${esc(d.decision)}</b>: \${esc(d.rationale)}</li>\`
).join('');

const risksHtml = (parsed.risk_flags || []).map(r =>
  \`<li><b>[\${esc(r.severity)}] \${esc(r.type)}</b>: \${esc(r.description)}</li>\`
).join('');

const suggestionsHtml = (parsed.next_meeting_suggestions || []).map(s =>
  \`<li>\${esc(s)}</li>\`
).join('');

const meetingNotesHtml = \`<html><body>
<h1>\${title}</h1>
<p><b>Date:</b> \${date}<br><b>Attendees:</b> \${attendees}<br><b>Client:</b> \${clientName}</p>
<h2>Executive Summary</h2>
<p>\${execSummary}</p>
<h2>Action Items</h2>
<ul>\${actionHtml || '<li>None</li>'}</ul>
<h2>Key Decisions</h2>
<ul>\${decisionsHtml || '<li>None</li>'}</ul>
<h2>Risk Flags</h2>
<ul>\${risksHtml || '<li>None</li>'}</ul>
<h2>Next Meeting Suggestions</h2>
<ul>\${suggestionsHtml || '<li>None</li>'}</ul>
<hr>
<p><i>Sentiment: \${esc(parsed.sentiment)} | Engagement Trend: \${esc(parsed.engagement_health_delta)}</i></p>
</body></html>\`;

return [{
  json: {
    ...meetingData,
    analysis: parsed,
    tasks: tasks,
    high_risks: highRisks,
    has_high_risks: highRisks.length > 0,
    google_drive_folder_id: meetingData.client?.google_drive_folder_id || '',
    clickup_space_id: meetingData.client?.clickup_space_id || '90114014960',
    meeting_notes_content: meetingNotesContent,
    meeting_notes_html: meetingNotesHtml
  }
}];`;

async function main() {
  console.log('Fetching current workflow...');
  const w = await request('GET', `/workflows/${WORKFLOW_ID}`);
  console.log('Node count:', w.nodes.length);

  const nodes = w.nodes;
  const connections = w.connections;

  // 1. Update Prepare node code
  const prepIdx = nodes.findIndex(n => n.id === 'prepare-outputs');
  if (prepIdx >= 0) {
    nodes[prepIdx].parameters.jsCode = PREPARE_CODE;
    console.log('Updated Prepare node with HTML generation');
  } else {
    console.log('ERROR: prepare-outputs not found');
    return;
  }

  // 2. Update Write Meeting Notes -> Drive API upload
  const writeIdx = nodes.findIndex(n => n.id === 'write-meeting-notes');
  if (writeIdx >= 0) {
    nodes[writeIdx] = {
      parameters: {
        method: 'PATCH',
        url: "=https://www.googleapis.com/upload/drive/v3/files/{{ $json.id }}?uploadType=media",
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googleDocsOAuth2Api',
        sendBody: true,
        contentType: 'raw',
        rawContentType: 'text/html',
        body: "={{ $('Prepare ClickUp Tasks + Notes').first().json.meeting_notes_html }}",
        options: {}
      },
      id: 'write-meeting-notes',
      name: 'Write Meeting Notes',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: nodes[writeIdx].position,
      credentials: {
        googleDocsOAuth2Api: {
          id: 'bbU1KBLk0uDZ3wms',
          name: 'Google Docs account'
        }
      },
      notes: 'Uploads HTML content to Google Doc via Drive API upload endpoint.'
    };
    console.log('Updated Write Meeting Notes -> Drive API upload');
  } else {
    console.log('ERROR: write-meeting-notes not found');
    return;
  }

  // 3. Deploy
  console.log('Deploying...');
  const result = await request('PUT', `/workflows/${WORKFLOW_ID}`, {
    name: w.name,
    nodes: nodes,
    connections: connections,
    settings: w.settings,
    staticData: w.staticData
  });

  if (result.id) {
    console.log('Deploy SUCCESS, node count:', result.nodes.length);
    const act = await request('POST', `/workflows/${WORKFLOW_ID}/activate`);
    console.log('Activated:', act.active);
  } else {
    console.log('Deploy FAILED:', JSON.stringify(result).substring(0, 500));
  }
}

main().catch(console.error);
