// Update call-intelligence workflow: replace Gmail Get with HTTP Request + base64 decode
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

const PARSE_CODE = `// Parse Fathom email for meeting data (from Gmail API full format)
const email = $input.all()[0].json;

// Decode body from Gmail API full format
function decodeBase64Url(str) {
  if (!str) return '';
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(b64, 'base64').toString('utf-8');
}

function extractBody(payload) {
  let html = '';
  let text = '';

  if (payload.body && payload.body.data) {
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType === 'text/html') html = decoded;
    else if (payload.mimeType === 'text/plain') text = decoded;
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        text = decodeBase64Url(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
        html = decodeBase64Url(part.body.data);
      } else if (part.parts) {
        const nested = extractBody(part);
        if (nested.text) text = nested.text;
        if (nested.html) html = nested.html;
      }
    }
  }

  return { text, html };
}

const { text: plainText, html: htmlBody } = extractBody(email.payload || {});

let body = plainText;

if (!body && htmlBody) {
  body = htmlBody
    .replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi, '')
    .replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, '')
    .replace(/<br\\s*\\/?>/gi, '\\n')
    .replace(/<\\/p>/gi, '\\n\\n')
    .replace(/<\\/div>/gi, '\\n')
    .replace(/<\\/li>/gi, '\\n')
    .replace(/<\\/h[1-6]>/gi, '\\n\\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\\n{3,}/g, '\\n\\n')
    .trim();
}

if (!body) body = email.snippet || '';

const headers = (email.payload && email.payload.headers) || [];
const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');
const dateHeader = headers.find(h => h.name.toLowerCase() === 'date');
const subject = subjectHeader ? subjectHeader.value : '';

let meetingTitle = subject
  .replace(/^Recap of your meeting with\\s*/i, '')
  .replace(/^(Meeting notes:|Meeting summary:|Notes from)\\s*/i, '')
  .replace(/\\s*-\\s*(Meeting Summary|Notes|Recap)$/i, '')
  .trim();

const meetingDate = dateHeader ? dateHeader.value : new Date().toISOString();

const attendeePatterns = [
  /Attendees?:?\\s*([^\\n]+)/i,
  /Participants?:?\\s*([^\\n]+)/i,
  /With:?\\s*([^\\n]+)/i,
  /Between:?\\s*([^\\n]+)/i
];

let attendees = '';
for (const pattern of attendeePatterns) {
  const match = body.match(pattern);
  if (match) { attendees = match[1].trim(); break; }
}

const summaryMatch = body.match(/(?:Summary|Overview|Recap)[:\\s]*\\n([\\s\\S]*?)(?=\\n(?:Action Items|Key Points|Decisions|Highlights|$))/i);
const summary = summaryMatch ? summaryMatch[1].trim() : body.substring(0, 4000);

const actionItemsMatch = body.match(/(?:Action Items|Next Steps|Tasks|Follow[- ]?ups?)[:\\s]*\\n([\\s\\S]*?)(?=\\n(?:Key Points|Decisions|Summary|Highlights|$))/i);
const actionItems = actionItemsMatch ? actionItemsMatch[1].trim() : 'None auto-detected';

const emailDomains = [];
const emailRegex = /[\\w.-]+@([\\w.-]+\\.\\w+)/g;
let emailMatch;
while ((emailMatch = emailRegex.exec(attendees + ' ' + body)) !== null) {
  const domain = emailMatch[1].toLowerCase();
  if (!domain.includes('gmail.com') && !domain.includes('fathom') && !domain.includes('revopsinflection')) {
    emailDomains.push(domain);
  }
}

return [{
  json: {
    meeting_title: meetingTitle || subject,
    meeting_date: meetingDate,
    attendees: attendees,
    attendee_domains: [...new Set(emailDomains)],
    fathom_summary: summary,
    fathom_action_items: actionItems,
    raw_email_body: body,
    email_id: email.id
  }
}];`;

async function main() {
  // 1. Get current workflow
  console.log('Fetching current workflow...');
  const w = await request('GET', `/workflows/${WORKFLOW_ID}`);

  // 2. Update Fetch Full Email node -> HTTP Request
  const nodes = w.nodes;
  const fetchIdx = nodes.findIndex(n => n.id === 'fetch-full-email');
  if (fetchIdx >= 0) {
    nodes[fetchIdx] = {
      parameters: {
        method: 'GET',
        url: '=https://gmail.googleapis.com/gmail/v1/users/me/messages/{{ $json.id }}?format=full',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'gmailOAuth2',
        options: {}
      },
      id: 'fetch-full-email',
      name: 'Fetch Full Email',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [368, 304],
      credentials: {
        gmailOAuth2: {
          id: 'O7ykd3puCOyyR8BV',
          name: 'Gmail account'
        }
      },
      notes: 'Fetches full email via Gmail API - n8n Gmail node strips body content.'
    };
    console.log('Updated Fetch Full Email -> HTTP Request node');
  } else {
    console.log('ERROR: Fetch Full Email node not found!');
    return;
  }

  // 3. Update Parse Fathom Email code
  const parseIdx = nodes.findIndex(n => n.id === 'parse-fathom');
  if (parseIdx >= 0) {
    nodes[parseIdx].parameters.jsCode = PARSE_CODE;
    console.log('Updated Parse Fathom Email with base64 decoding');
  }

  // 4. Deploy
  console.log('Deploying...');
  const result = await request('PUT', `/workflows/${WORKFLOW_ID}`, {
    name: w.name,
    nodes: nodes,
    connections: w.connections,
    settings: w.settings,
    staticData: w.staticData
  });

  console.log('Deploy result:', result.id ? 'SUCCESS' : 'FAILED');
  console.log('Active:', result.active);
  console.log('Node count:', result.nodes?.length);

  // 5. Activate
  const act = await request('POST', `/workflows/${WORKFLOW_ID}/activate`);
  console.log('Activated:', act.active);
}

main().catch(console.error);
