"""Fix the real meeting-prep workflow:
1. Remove separate ClickUp HTTP Request nodes
2. Merge ClickUp API calls into Build Claude Prompt as a single Code node
3. Use dynamic space_id from client-lookup
4. Use direct API key (since the old credential is broken)
"""
import json, os

temp = os.environ.get('TEMP', '/tmp').replace('\\', '/')

with open(f'{temp}/wf_meeting_prep.json', encoding='utf-8') as f:
    wf = json.load(f)

# Get the existing Build Claude Prompt code to preserve the prompt logic
build_prompt_code = None
for n in wf['nodes']:
    if n['name'] == 'Build Claude Prompt':
        build_prompt_code = n['parameters']['jsCode']

# New combined code: fetch ClickUp tasks + build prompt
combined_code = r"""// Gather all inputs for agenda generation
const eventInfo = $('Extract Event Info').first().json;
const clientData = $('Client Lookup').first().json;
const spaceId = clientData.clickup_space_id;

// Fetch open tasks from ClickUp
const openTasksRaw = await this.helpers.httpRequest({
  method: 'GET',
  url: `https://api.clickup.com/api/v2/team/9011968555/task?space_ids[]=${spaceId}&include_closed=false`,
  headers: { 'Authorization': 'pk_120226108_5A4ZTPSW5PUZ4YDQR9NP1LR2OPCA5BLX' },
  json: true
});

// Fetch waiting-on-client tasks
const waitingTasksRaw = await this.helpers.httpRequest({
  method: 'GET',
  url: `https://api.clickup.com/api/v2/team/9011968555/task?space_ids[]=${spaceId}&include_closed=false`,
  headers: { 'Authorization': 'pk_120226108_5A4ZTPSW5PUZ4YDQR9NP1LR2OPCA5BLX' },
  json: true
});

const openTasks = (openTasksRaw.tasks || []).map(t =>
  `- [${t.priority?.priority || 'normal'}] ${t.name} (Status: ${t.status?.status || 'open'})`
).join('\n') || 'No open tasks';

const waitingTasks = (waitingTasksRaw.tasks || [])
  .filter(t => t.status?.status?.toLowerCase().includes('waiting'))
  .map(t =>
    `- ${t.name} (Created: ${new Date(parseInt(t.date_created)).toLocaleDateString()})`
  ).join('\n') || 'No waiting items';

return [{
  json: {
    system_prompt: `You are a senior RevOps consultant's AI assistant. You prepare meeting agendas that make client calls highly productive. Your agendas are concise, action-oriented, and ensure nothing falls through the cracks. Style: Direct, professional, no fluff. Time-box every section. Lead with the most important items.`,
    user_prompt: `Prepare a meeting agenda for my upcoming client call.\n\n**Meeting Details:**\n- Client: ${clientData.client_name}\n- Date/Time: ${eventInfo.meeting_datetime}\n- Duration: ${eventInfo.meeting_duration} minutes\n- Attendees: ${eventInfo.attendees}\n- Update Preference: ${clientData.update_preference || 'detailed'}\n\n**Open ClickUp Tasks (sorted by priority):**\n${openTasks}\n\n**"Waiting on Client" Items:**\n${waitingTasks}\n\n**Any special context or topics I want to cover:**\n${eventInfo.manual_notes || 'None specified'}\n\n---\n\nGenerate a meeting agenda with:\n1. Quick Win / Opener (2 min) — start with a positive update\n2. Key Discussion Items (time-boxed based on priority)\n3. Blocked / Needs Client Input (be specific about what you need from them)\n4. Strategic Topics (if time allows)\n5. Action Items & Next Steps\n\nFormat as clean markdown. Include suggested time allocations that total ${eventInfo.meeting_duration} minutes.`,
    model: 'gemini-free',
    workflow_name: 'meeting-prep',
    client_name: clientData.client_name,
    purpose: 'Meeting agenda generation'
  }
}];"""

# Remove ClickUp HTTP nodes, update Build Claude Prompt
new_nodes = []
for n in wf['nodes']:
    if n['name'] in ('Get Open ClickUp Tasks', 'Get Waiting on Client Tasks'):
        continue  # Remove
    elif n['name'] == 'Build Claude Prompt':
        n['parameters'] = {'jsCode': combined_code}
        n['name'] = 'Fetch Tasks & Build Prompt'
        new_nodes.append(n)
    else:
        new_nodes.append(n)

# Fix connections
new_connections = {}
for src, conns in wf['connections'].items():
    if src in ('Get Open ClickUp Tasks', 'Get Waiting on Client Tasks'):
        continue
    elif src == 'Is Client Meeting?':
        # True branch goes directly to combined node
        new_connections[src] = {
            'main': [
                [{'node': 'Fetch Tasks & Build Prompt', 'type': 'main', 'index': 0}],
                []
            ]
        }
    else:
        # Update any references to old node name
        updated_conns = json.loads(json.dumps(conns).replace('Build Claude Prompt', 'Fetch Tasks & Build Prompt'))
        new_connections[src] = updated_conns

payload = {
    'name': wf['name'],
    'nodes': new_nodes,
    'connections': new_connections,
    'settings': wf.get('settings', {})
}

with open(f'{temp}/wf_meeting_prep_out.json', 'w', encoding='utf-8') as f:
    json.dump(payload, f)
print(f"Done: {len(new_nodes)} nodes (was {len(wf['nodes'])})")
for n in new_nodes:
    print(f"  {n['name']}: {n['type']}")
