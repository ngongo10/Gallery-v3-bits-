#!/usr/bin/env python3
"""Generate src/data/portfolio.js from an explicit list of Cloudinary public_ids.

Usage: set Cloudinary env vars, then:
  python generate_portfolio_from_ids.py

Edit the `PUBLIC_IDS` list below to include any public_id you want to include.
"""
from pathlib import Path
import base64
import json
import os
import sys
import time
try:
    import requests
except Exception:
    requests = None

CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
API_KEY = os.getenv('CLOUDINARY_API_KEY')
API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
DEST = Path('src/data/portfolio.js')

if not CLOUD_NAME or not API_KEY or not API_SECRET:
    sys.exit('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the environment.')

PUBLIC_IDS = [
    '20210505-DSC00886',
    'IMG20240628084759',
    '20210505-DSC00829',
    '1108237420831272260',
    '20210505-DSC01007',
    'Somewhere_where_everything_was_nothing_and_you',
]


def get_resource(public_id):
    url = f'https://api.cloudinary.com/v1_1/{CLOUD_NAME}/resources/image/upload/{public_id}'
    auth = (API_KEY, API_SECRET)
    if requests is not None:
        resp = requests.get(url, auth=auth, timeout=30)
        resp.raise_for_status()
        return resp.json()
    else:
        from urllib.request import Request, urlopen
        from urllib.error import HTTPError
        import base64
        hdr = {'Authorization': 'Basic ' + base64.b64encode(f'{API_KEY}:{API_SECRET}'.encode()).decode()}
        req = Request(url, headers=hdr)
        try:
            with urlopen(req) as r:
                return json.load(r)
        except HTTPError as e:
            print('HTTP error', e.code, e.read().decode(), file=sys.stderr)
            raise


groups = {}
all_items = []
used_ids = set()

for pid in PUBLIC_IDS:
    try:
        r = get_resource(pid)
    except Exception as e:
        print('Failed to fetch', pid, e, file=sys.stderr)
        continue
    public_id = r.get('public_id')
    folder = r.get('asset_folder') or ''
    # normalize folder name: remove leading 'images/' if present
    if folder.startswith('images/'):
        folder_label = folder.split('/', 1)[1]
    elif folder.startswith('/'):
        folder_label = folder.lstrip('/')
    else:
        folder_label = folder or 'Uncategorized'

    groups.setdefault(folder_label, []).append(public_id)

    # record all_items
    # generate a stable id
    key = (folder_label, public_id)
    all_items.append({'public_id': public_id, 'folder': folder_label})


def slugify(name):
    import unicodedata, re
    normalized = unicodedata.normalize('NFKD', name)
    ascii_name = normalized.encode('ascii', 'ignore').decode('ascii')
    slug = re.sub(r'[^a-z0-9]+', '-', ascii_name.lower()).strip('-')
    return slug or 'album'


lines = [
    '// Portfolio data generated from Cloudinary public_id list',
    f'// Generated: {time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}',
    '',
    f"const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/{CLOUD_NAME}/image/upload/f_auto,q_auto';",
    'const cloudinaryUrl = (path) => {',
    '  if (!path.startsWith("/")) return path;',
    '  const publicPath = path.startsWith("/images/") ? path.substring(8) : path.substring(1);',
    '  return `${CLOUDINARY_BASE_URL}/${encodeURI(publicPath)}`;',
    '};',
    '',
    'export const categories = [',
]

used = set()
for folder, public_ids in sorted(groups.items(), key=lambda x: x[0].lower()):
    cat_id = slugify(folder)
    # ensure unique
    base = cat_id
    i = 1
    while cat_id in used:
        cat_id = f'{base}-{i}'
        i += 1
    used.add(cat_id)

    lines.append('  {')
    lines.append(f'    "id": "{cat_id}",')
    lines.append(f'    "label": "{folder}",')
    lines.append(f'    "cover": cloudinaryUrl("/{public_ids[0]}"),')
    lines.append('    "items": [')
    for idx, pid in enumerate(public_ids):
        item_id = f'{cat_id}-{idx}'
        caption = f'{folder} #{idx+1}'
        lines.append('      {')
        lines.append(f'        "id": "{item_id}",')
        lines.append(f'        "image": cloudinaryUrl("/{pid}"),')
        lines.append(f'        "caption": "{caption}"')
        lines.append('      },')
    lines.append('    ]')
    lines.append('  },')

lines.append('];')
lines.append('')
lines.append('export const allItems = [')
for folder, public_ids in sorted(groups.items(), key=lambda x: x[0].lower()):
    cat_id = slugify(folder)
    for idx, pid in enumerate(public_ids):
        item_id = f'{cat_id}-{idx}'
        title = f'{folder} #{idx+1}'
        lines.append('  {')
        lines.append(f'    "id": "{item_id}",')
        lines.append(f'    "image": cloudinaryUrl("/{pid}"),')
        lines.append(f'    "title": "{title}",')
        lines.append(f'    "category": "{cat_id}",')
        lines.append(f'    "categoryLabel": "{folder}"')
        lines.append('  },')
lines.append('];')

DEST.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Wrote {DEST} with {len(groups)} categories and {sum(len(v) for v in groups.values())} items.')
