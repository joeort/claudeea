import json, sys, os

temp = os.environ.get('TEMP', '/tmp').replace('\\', '/')
with open(f'{temp}/wf_test_mp2.json', encoding='utf-8') as f:
    wf = json.load(f)

for n in wf['nodes']:
    p = n.get('parameters', {})
    url = p.get('url', '')
    if isinstance(url, str) and 'clickup' in url.lower() and 'clickup_space_id' in url:
        # Replace n8n expression with hardcoded Blackthorn space ID
        url = url.replace("{{ $('Client Lookup').first().json.clickup_space_id }}", "90114014960")
        url = url.replace("{{ $json.clickup_space_id }}", "90114014960")
        p['url'] = url
        print(f"Fixed: {n['name']}")

payload = {
    'name': wf['name'],
    'nodes': wf['nodes'],
    'connections': wf['connections'],
    'settings': wf.get('settings', {})
}
with open(f'{temp}/wf_test_mp2_out.json', 'w', encoding='utf-8') as f:
    json.dump(payload, f)
print("Done")
