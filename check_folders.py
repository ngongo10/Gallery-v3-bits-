import os, requests, sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

for line in Path('.env').read_text('utf-8-sig').splitlines():
    if '=' in line:
        k, v = line.strip().split('=', 1)
        os.environ[k] = v

cloud = os.environ['CLOUDINARY_CLOUD_NAME']
auth = (os.environ['CLOUDINARY_API_KEY'], os.environ['CLOUDINARY_API_SECRET'])

r = requests.get(f'https://api.cloudinary.com/v1_1/{cloud}/folders', auth=auth).json()
print('Root folders:', [f['name'] for f in r.get('folders', [])])

for folder in r.get('folders', []):
    sub = requests.get(f"https://api.cloudinary.com/v1_1/{cloud}/folders/{folder['name']}", auth=auth).json()
    subs = [s['name'] for s in sub.get('folders', [])]
    if subs:
        print(f"  Sub [{folder['name']}]: {subs}")

s = requests.post(
    f'https://api.cloudinary.com/v1_1/{cloud}/resources/search',
    json={'expression': 'resource_type:image', 'max_results': 500},
    auth=auth
).json()
resources = s.get('resources', [])
print(f'Total resources: {len(resources)}')

folder_map = {}
for res in resources:
    f = res.get('asset_folder') or res.get('folder') or '(root)'
    folder_map[f] = folder_map.get(f, 0) + 1

for f, c in sorted(folder_map.items()):
    print(f'  {f}: {c} anh')
