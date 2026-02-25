import json, os

temp = os.environ.get('TEMP', '').replace('\\', '/')

with open(f'{temp}/wf_test_mp6.json', encoding='utf-8') as f:
    wf = json.load(f)

open_tasks_code = """const response = await this.helpers.httpRequest({
  method: 'GET',
  url: 'https://api.clickup.com/api/v2/team/9011968555/task',
  qs: {
    'space_ids[]': '90114014960',
    'include_closed': 'false',
    'order_by': 'priority'
  },
  headers: {
    'Authorization': 'pk_120226108_5A4ZTPSW5PUZ4YDQR9NP1LR2OPCA5BLX'
  },
  json: true
});
return [{ json: response }];"""

waiting_tasks_code = """const response = await this.helpers.httpRequest({
  method: 'GET',
  url: 'https://api.clickup.com/api/v2/team/9011968555/task',
  qs: {
    'space_ids[]': '90114014960',
    'include_closed': 'false'
  },
  headers: {
    'Authorization': 'pk_120226108_5A4ZTPSW5PUZ4YDQR9NP1LR2OPCA5BLX'
  },
  json: true
});
return [{ json: response }];"""

for n in wf['nodes']:
    if n['name'] == 'Get Open ClickUp Tasks':
        n['type'] = 'n8n-nodes-base.code'
        n['typeVersion'] = 2
        n['parameters'] = {'jsCode': open_tasks_code}
        n.pop('credentials', None)
        print(f"Fixed: {n['name']} -> Code node")
    elif n['name'] == 'Get Waiting on Client Tasks':
        n['type'] = 'n8n-nodes-base.code'
        n['typeVersion'] = 2
        n['parameters'] = {'jsCode': waiting_tasks_code}
        n.pop('credentials', None)
        print(f"Fixed: {n['name']} -> Code node")

payload = {
    'name': wf['name'],
    'nodes': wf['nodes'],
    'connections': wf['connections'],
    'settings': wf.get('settings', {})
}
with open(f'{temp}/wf_test_mp6_out.json', 'w', encoding='utf-8') as f:
    json.dump(payload, f)
print("Done")
