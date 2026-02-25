import json, os

temp = os.environ.get('TEMP', '/tmp').replace('\\', '/')

with open(f'{temp}/wf_test_mp6.json', encoding='utf-8') as f:
    wf = json.load(f)

# Combined node: fetch both ClickUp endpoints + build result
combined_code = r"""const eventInfo = $('Simulate Calendar Event').first().json;
const clientData = $('Client Lookup').first().json;

// Fetch open tasks
const openTasksRaw = await this.helpers.httpRequest({
  method: 'GET',
  url: 'https://api.clickup.com/api/v2/team/9011968555/task?space_ids[]=90114014960&include_closed=false',
  headers: { 'Authorization': 'pk_120226108_5A4ZTPSW5PUZ4YDQR9NP1LR2OPCA5BLX' },
  json: true
});

// Fetch waiting-on-client tasks
const waitingTasksRaw = await this.helpers.httpRequest({
  method: 'GET',
  url: 'https://api.clickup.com/api/v2/team/9011968555/task?space_ids[]=90114014960&include_closed=false',
  headers: { 'Authorization': 'pk_120226108_5A4ZTPSW5PUZ4YDQR9NP1LR2OPCA5BLX' },
  json: true
});

const openTasks = (openTasksRaw.tasks || [])
  .map(t => `- [${t.priority?.priority || 'normal'}] ${t.name} (${t.status?.status || 'open'})`)
  .join('\n') || 'No open tasks';
const waitingTasks = (waitingTasksRaw.tasks || [])
  .filter(t => t.status?.status?.toLowerCase().includes('waiting'))
  .map(t => `- ${t.name}`)
  .join('\n') || 'No waiting items';

return [{ json: {
  summary: `Meeting prep for ${clientData.client_name}`,
  open_task_count: (openTasksRaw.tasks || []).length,
  waiting_task_count: (waitingTasksRaw.tasks || []).filter(t => t.status?.status?.toLowerCase().includes('waiting')).length,
  open_tasks: openTasks,
  waiting_tasks: waitingTasks,
  client_name: clientData.client_name,
  meeting_duration: eventInfo.meeting_duration
} }];"""

# Simplify: remove the two ClickUp nodes, replace Build Result with combined node
new_nodes = []
for n in wf['nodes']:
    if n['name'] in ('Get Open ClickUp Tasks', 'Get Waiting on Client Tasks'):
        continue  # Remove these nodes
    elif n['name'] == 'Build Result':
        n['parameters'] = {'jsCode': combined_code}
        n['name'] = 'Fetch Tasks & Build Result'
        new_nodes.append(n)
    else:
        new_nodes.append(n)

# Fix connections: Is Client Meeting? -> directly to combined node
new_connections = {}
for src, conns in wf['connections'].items():
    if src in ('Get Open ClickUp Tasks', 'Get Waiting on Client Tasks'):
        continue  # Remove these connections
    elif src == 'Is Client Meeting?':
        new_connections[src] = {
            'main': [
                [{'node': 'Fetch Tasks & Build Result', 'type': 'main', 'index': 0}],
                []
            ]
        }
    else:
        new_connections[src] = conns

payload = {
    'name': wf['name'],
    'nodes': new_nodes,
    'connections': new_connections,
    'settings': wf.get('settings', {})
}

with open(f'{temp}/wf_test_mp6_out.json', 'w', encoding='utf-8') as f:
    json.dump(payload, f)
print(f"Done: {len(new_nodes)} nodes (removed 2 ClickUp nodes, merged into Build Result)")
