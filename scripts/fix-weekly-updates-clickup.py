"""Fix weekly-client-updates workflow:
1. Remove separate ClickUp HTTP Request nodes
2. Merge ClickUp API calls into Build Update Prompt
3. Use dynamic space_id from client data
"""
import json, os

temp = os.environ.get('TEMP', '/tmp').replace('\\', '/')

with open(f'{temp}/wf_weekly_updates.json', encoding='utf-8') as f:
    wf = json.load(f)

# Get the full Build Update Prompt code to see what we need
for n in wf['nodes']:
    if n['name'] == 'Build Update Prompt':
        original_code = n['parameters']['jsCode']

# New combined code: fetch ClickUp tasks + build prompt
combined_code = r"""// Categorize tasks and build the Claude prompt
const client = $('Split by Client').first().json;
const spaceId = client['ClickUp Space ID'];

// Fetch this week's updated tasks
const weekTasks = await this.helpers.httpRequest({
  method: 'GET',
  url: `https://api.clickup.com/api/v2/team/9011968555/task?space_ids[]=${spaceId}&date_updated_gt=${Date.now() - 7 * 24 * 60 * 60 * 1000}&include_closed=true`,
  headers: { 'Authorization': 'pk_120226108_5A4ZTPSW5PUZ4YDQR9NP1LR2OPCA5BLX' },
  json: true
});

// Fetch blocked/waiting tasks
const blockedTasks = await this.helpers.httpRequest({
  method: 'GET',
  url: `https://api.clickup.com/api/v2/team/9011968555/task?space_ids[]=${spaceId}&include_closed=false`,
  headers: { 'Authorization': 'pk_120226108_5A4ZTPSW5PUZ4YDQR9NP1LR2OPCA5BLX' },
  json: true
});

const allTasks = weekTasks.tasks || [];
const completed = allTasks.filter(t => t.status?.status === 'closed' || t.status?.status === 'complete');
const inProgress = allTasks.filter(t => t.status?.status === 'in progress' || t.status?.status === 'open');
const blocked = (blockedTasks.tasks || []).filter(t => t.status?.status?.toLowerCase().includes('waiting'));

const formatTasks = (tasks) => tasks.map(t =>
  `- ${t.name} (Priority: ${t.priority?.priority || 'normal'})`
).join('\n') || 'None';

const weekEnd = new Date();
const weekEndStr = weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

return [{
  json: {
    system_prompt: `You are a senior RevOps consultant writing weekly status update emails to your B2B SaaS clients. Your tone is professional, concise, and confident — like a trusted advisor, not a vendor. You show progress clearly, call out blockers without blame, and always orient toward outcomes.\n\nWriting rules:\n- Lead with the headline (TL;DR)\n- Use bullet points, not paragraphs\n- Be specific — include numbers, dates, and names\n- Blockers should have clear asks with deadlines\n- End with forward momentum\n- Match the client's update preference: "executive" = 5-7 bullets max, "detailed" = full breakdown`,
    user_prompt: `Write a weekly status update email for my client.\n\n**Client:** ${client['Client Name']}\n**Week Ending:** ${weekEndStr}\n**Update Preference:** ${client['Update Preference'] || 'detailed'}\n**Primary Contact:** ${client['Primary Contact Name']}\n\n**Tasks Completed This Week:**\n${formatTasks(completed)}\n\n**Tasks In Progress:**\n${formatTasks(inProgress)}\n\n**Blocked / Waiting on Client:**\n${formatTasks(blocked)}\n\n---\n\nGenerate the email with: Subject line, TL;DR (2-3 sentences), Completed This Week, In Progress (with expected completion), Needs Your Input (specific asks with deadlines), and Next Week's Focus (top 2-3 priorities).`,
    model: 'gemini-free',
    workflow_name: 'weekly-client-updates',
    client_name: client['Client Name'],
    purpose: 'Weekly status update draft',
    client: client
  }
}];"""

# Remove ClickUp HTTP nodes, update Build Update Prompt
new_nodes = []
for n in wf['nodes']:
    if n['name'] in ("Get This Week's Tasks", "Get Blocked Tasks"):
        continue
    elif n['name'] == 'Build Update Prompt':
        n['parameters'] = {'jsCode': combined_code}
        n['name'] = 'Fetch Tasks & Build Prompt'
        new_nodes.append(n)
    else:
        new_nodes.append(n)

# Fix connections
new_connections = {}
for src, conns in wf['connections'].items():
    if src in ("Get This Week's Tasks", "Get Blocked Tasks"):
        continue
    elif src == 'Split by Client':
        # Go directly to combined node instead of parallel ClickUp nodes
        new_connections[src] = {
            'main': [[{'node': 'Fetch Tasks & Build Prompt', 'type': 'main', 'index': 0}]]
        }
    else:
        updated = json.loads(json.dumps(conns).replace('Build Update Prompt', 'Fetch Tasks & Build Prompt'))
        new_connections[src] = updated

payload = {
    'name': wf['name'],
    'nodes': new_nodes,
    'connections': new_connections,
    'settings': wf.get('settings', {})
}

with open(f'{temp}/wf_weekly_updates_out.json', 'w', encoding='utf-8') as f:
    json.dump(payload, f)
print(f"Done: {len(new_nodes)} nodes (was {len(wf['nodes'])})")
for n in new_nodes:
    print(f"  {n['name']}: {n['type']}")
