from pathlib import Path
import base64
import json
import os
import re
import sys
import unicodedata
from datetime import datetime
from urllib.parse import urlencode
try:
    import requests
except Exception:
    requests = None

CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
API_KEY = os.getenv('CLOUDINARY_API_KEY')
API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
DEST = Path('src/data/portfolio.js')
IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'}

if not CLOUD_NAME or not API_KEY or not API_SECRET:
    sys.exit('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the environment.')

AUTH_HEADER = 'Basic ' + base64.b64encode(f'{API_KEY}:{API_SECRET}'.encode()).decode()


def request_json(url, data=None):
    # Prefer requests for reliable HTTP behavior; fall back to urllib if
    # requests is not available.
    if requests is not None:
        auth = (API_KEY, API_SECRET)
        try:
            # If data is provided, try GET with query params first (most list
            # endpoints accept query params). If GET returns 404, fall back to
            # POST which some Cloudinary endpoints expect.
            if data is not None:
                resp = requests.get(url, params=data, auth=auth, timeout=30)
                if resp.status_code == 404:
                    resp = requests.post(url, data=data, auth=auth, timeout=30)
            else:
                resp = requests.get(url, auth=auth, timeout=30)
        except requests.RequestException as e:
            print('Request error:', e, file=sys.stderr)
            raise
        if resp.status_code != 200:
            print(f'HTTP error {resp.status_code}: {resp.text[:200]}', file=sys.stderr)
            resp.raise_for_status()
        return resp.json()
    else:
        # Fallback to urllib
        from urllib.error import HTTPError, URLError
        from urllib.request import Request, urlopen
        headers = {
            'Authorization': AUTH_HEADER,
        }
        # Use GET with query string for listing endpoints to match requests behavior.
        if data is not None:
            url = url + '?' + urlencode(data)
        req = Request(url, headers=headers)
        try:
            with urlopen(req) as resp:
                return json.loads(resp.read().decode())
        except HTTPError as e:
            print(f'HTTP error {e.code}: {e.reason}', file=sys.stderr)
            print(e.read().decode(), file=sys.stderr)
            raise
        except URLError as e:
            print(f'URL error: {e}', file=sys.stderr)
            raise


def list_folders():
    url = f'https://api.cloudinary.com/v1_1/{CLOUD_NAME}/folders/list'
    data = {'max_results': 500}
    resp = request_json(url, data)
    folders = [folder['name'] for folder in resp.get('folders', []) if folder.get('name')]
    return sorted(set(folders), key=lambda value: value.lower())


def list_images(prefix=None):
    url = f'https://api.cloudinary.com/v1_1/{CLOUD_NAME}/resources/image/list'
    params = {
        'max_results': 500,
        'type': 'upload',
        'resource_type': 'image',
    }
    if prefix:
        params['prefix'] = prefix

    resources = []
    while True:
        resp = request_json(url, params)
        resources.extend(resp.get('resources', []))
        cursor = resp.get('next_cursor')
        if not cursor:
            break
        params['next_cursor'] = cursor
    return sorted(resources, key=lambda resource: resource['public_id'].lower())


def slugify(name):
    normalized = unicodedata.normalize('NFKD', name)
    ascii_name = normalized.encode('ascii', 'ignore').decode('ascii')
    slug = re.sub(r'[^a-z0-9]+', '-', ascii_name.lower()).strip('-')
    return slug or 'album'


def js_string(value):
    return '"' + value.replace('\\', '\\\\').replace('"', '\\"') + '"'


folders = [folder for folder in list_folders() if '/' not in folder]

# If Cloudinary /folders/list returns nothing, fall back to listing all
# resources and derive top-level folders from the `public_id` (the part
# before the first `/`). This supports accounts where folders may not be
# returned via the folders endpoint or the API key doesn't surface them.
resources_cache = None
if not folders:
    print('No folders returned by /folders/list; falling back to scanning resources...', file=sys.stderr)
    all_resources = list_images()
    derived = set()
    for r in all_resources:
        pid = r.get('public_id', '')
        if '/' in pid:
            derived.add(pid.split('/', 1)[0])
    folders = sorted(derived, key=lambda value: value.lower())
    # Keep a cache of resources so we don't re-request per-folder
    if folders:
        resources_cache = {}
        for f in folders:
            resources_cache[f] = [r for r in all_resources if r.get('public_id','').startswith(f + '/')]

if not folders:
    # If no folders found, write an empty portfolio.js to remove stale references
    print('No root folders found in Cloudinary; writing empty src/data/portfolio.js', file=sys.stderr)
    lines = [
        '// Portfolio data generated from Cloudinary folders',
        f'// Generated: {datetime.utcnow().isoformat()}Z',
        "const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/a9rfzg6k/image/upload/f_auto,q_auto';",
        'const cloudinaryUrl = (path) => {',
        '  if (!path.startsWith("/")) return path;',
        '  const publicPath = path.startsWith("/images/") ? path.substring(8) : path.substring(1);',
        '  return `${CLOUDINARY_BASE_URL}/${encodeURI(publicPath)}`;',
        '};',
        '',
        'export const categories = [];',
        '',
        'export const allItems = [];',
        '',
    ]
    DEST.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'Wrote empty {DEST}')
    # Continue execution (categories will be empty)

categories = []
all_items = []
used_ids = set()

for folder_name in folders:
    cat_id_base = slugify(folder_name)
    cat_id = cat_id_base
    suffix = 1
    while cat_id in used_ids:
        cat_id = f'{cat_id_base}-{suffix}'
        suffix += 1
    used_ids.add(cat_id)

    # Use cached resources when we derived folders from a full resource scan
    if resources_cache is not None:
        resources = resources_cache.get(folder_name, [])
    else:
        resources = list_images(folder_name)
    if not resources:
        continue

    items = []
    for index, resource in enumerate(resources):
        public_id = resource['public_id']
        public_path = f'/{public_id}'
        item_id = f'{cat_id}-{index}'
        caption = f'{folder_name} #{index + 1}'

        items.append({
            'id': item_id,
            'image': public_path,
            'caption': caption,
        })

        all_items.append({
            'id': item_id,
            'image': public_path,
            'title': caption,
            'category': cat_id,
            'categoryLabel': folder_name,
        })

    categories.append({
        'id': cat_id,
        'label': folder_name,
        'cover': items[0]['image'],
        'items': items,
    })

lines = [
    '// Portfolio data generated from Cloudinary folders',
    f'// Generated: {datetime.utcnow().isoformat()}Z',
    '',
    "const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/a9rfzg6k/image/upload/f_auto,q_auto';",
    'const cloudinaryUrl = (path) => {',
    '  if (!path.startsWith("/")) return path;',
    '  const publicPath = path.startsWith("/images/") ? path.substring(8) : path.substring(1);',
    '  return `${CLOUDINARY_BASE_URL}/${encodeURI(publicPath)}`;',
    '};',
    '',
    'export const categories = [',
]

for category in categories:
    lines.append('  {')
    lines.append(f'    "id": {js_string(category["id"])},')
    lines.append(f'    "label": {js_string(category["label"])},')
    lines.append(f'    "cover": cloudinaryUrl({js_string(category["cover"])}) ,')
    lines.append('    "items": [')
    for item in category['items']:
        lines.append('      {')
        lines.append(f'        "id": {js_string(item["id"])},')
        lines.append(f'        "image": cloudinaryUrl({js_string(item["image"])}) ,')
        lines.append(f'        "caption": {js_string(item["caption"])},')
        lines.append('      },')
    lines.append('    ]')
    lines.append('  },')

lines.append('];')
lines.append('')
lines.append('export const allItems = [')

for item in all_items:
    lines.append('  {')
    lines.append(f'    "id": {js_string(item["id"])},')
    lines.append(f'    "image": cloudinaryUrl({js_string(item["image"])}) ,')
    lines.append(f'    "title": {js_string(item["title"])},')
    lines.append(f'    "category": {js_string(item["category"])},')
    lines.append(f'    "categoryLabel": {js_string(item["categoryLabel"])},')
    lines.append('  },')

lines.append('];')

DEST.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Updated {DEST} with {len(categories)} categories and {len(all_items)} items.')
