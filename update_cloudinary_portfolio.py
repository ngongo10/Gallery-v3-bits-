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

# Auto load .env if present
env_file = Path('.env')
if env_file.exists():
    for line in env_file.read_text(encoding='utf-8-sig').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        k, v = k.strip(), v.strip().strip('"').strip("'")
        if k:
            os.environ[k] = v

CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
API_KEY = os.getenv('CLOUDINARY_API_KEY')
API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
DEST = Path('src/data/portfolio.js')
IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'}


def require_cloudinary_credentials():
    global CLOUD_NAME, API_KEY, API_SECRET, AUTH_HEADER
    CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
    API_KEY = os.getenv('CLOUDINARY_API_KEY')
    API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
    if not CLOUD_NAME or not API_KEY or not API_SECRET:
        raise RuntimeError('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the environment.')
    AUTH_HEADER = 'Basic ' + base64.b64encode(f'{API_KEY}:{API_SECRET}'.encode()).decode()


AUTH_HEADER = 'Basic ' + base64.b64encode(f'{API_KEY}:{API_SECRET}'.encode()).decode() if API_KEY and API_SECRET else ''


def request_json(url, data=None):
    # Prefer requests for reliable HTTP behavior; fall back to urllib if
    # requests is not available.
    if requests is not None:
        auth = (API_KEY, API_SECRET)
        try:
            # Some Cloudinary admin/list endpoints require POST (resources/folders).
            # Prefer POST for those endpoints, otherwise try GET first.
            if data is not None:
                if '/resources/' in url or '/folders/list' in url:
                    resp = requests.post(url, data=data, auth=auth, timeout=30)
                    if resp.status_code == 404:
                        resp = requests.get(url, params=data, auth=auth, timeout=30)
                else:
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


def search_all_images():
    # Use Cloudinary Search API as a fallback — it reliably returns assets
    # including `asset_folder` and supports pagination via `next_cursor`.
    url = f'https://api.cloudinary.com/v1_1/{CLOUD_NAME}/resources/search'
    params = {
        'expression': 'resource_type:image AND type:upload',
        'max_results': 500,
    }
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


def normalize_folder_name(name):
    value = (name or '').strip().strip('/')
    if value.startswith('images/'):
        value = value.split('/', 1)[1]
    return value.strip('/')


def canonical_folder_name(name):
    return normalize_folder_name(name).casefold()


def resource_folder_name(resource):
    if not resource:
        return ''

    asset_folder = (resource.get('asset_folder') or resource.get('folder') or '').strip().strip('/')
    if asset_folder:
        return normalize_folder_name(asset_folder)

    public_id = (resource.get('public_id') or '').strip().strip('/')
    if '/' in public_id:
        return public_id.split('/', 1)[0].strip('/')
    return ''


def derive_folder_names_from_resources(resources):
    names = {}
    for resource in resources or []:
        folder = resource_folder_name(resource)
        if not folder or canonical_folder_name(folder) in {'images', 'video'}:
            continue
        key = canonical_folder_name(folder)
        names.setdefault(key, folder)
    return sorted(names.values(), key=lambda value: value.casefold())


def filter_live_folders(raw_folders, resources):
    live_folders = derive_folder_names_from_resources(resources)
    live_keys = {canonical_folder_name(name) for name in live_folders}
    cleaned = []
    seen = set()

    for name in raw_folders or []:
        normalized = normalize_folder_name(name)
        if not normalized:
            continue
        key = canonical_folder_name(normalized)
        if live_keys and key not in live_keys:
            continue
        if key in seen:
            continue
        cleaned.append(normalized)
        seen.add(key)

    if cleaned:
        return sorted(cleaned, key=lambda value: value.casefold())
    if live_folders:
        return live_folders
    return []


def js_string(value):
    return json.dumps(value, ensure_ascii=False)


def main():
    require_cloudinary_credentials()

    raw_folders = list_folders()
    all_resources = search_all_images()
    if not all_resources:
        all_resources = list_images()

    folders = filter_live_folders(raw_folders, all_resources)

    if not folders:
        print('No live folders found in Cloudinary; writing empty src/data/portfolio.js', file=sys.stderr)
        lines = [
            '// Portfolio data generated from Cloudinary folders',
            f'// Generated: {datetime.utcnow().isoformat()}Z',
            "const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/g55oyjhn/image/upload/f_auto,q_auto,c_limit';",
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
        return

    folder_prefix_map = {}
    for folder_name in folders:
        folder_prefix_map[folder_name] = folder_name

    resources_cache = {}
    for folder_name in folders:
        folder_key = canonical_folder_name(folder_name)
        selected = []
        seen_public_ids = set()
        for resource in all_resources:
            resource_name = resource_folder_name(resource)
            if canonical_folder_name(resource_name) != folder_key:
                continue
            public_id = resource.get('public_id')
            if public_id in seen_public_ids:
                continue
            seen_public_ids.add(public_id)
            selected.append(resource)

        resources_cache[folder_name] = selected

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

        resources = resources_cache.get(folder_name, [])
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

    # Preserve existing metadata (description, storyText) from old portfolio.js
    old_descriptions = {
        'run-away': 'Hồi Ký 1:\nMột chuyến đi tự thân tới 1 vài điểm du lịch tại thái nguyên.',
        'tiec-bai-bien': 'Chỉ là 1 bộ ảnh Cosplayer.',
    }
    old_story_texts = {
        'run-away-7': 'Có thể phải hơn thế nữa',
    }

    lines = [
        '// Portfolio data generated from Cloudinary folders',
        f'// Generated: {datetime.utcnow().isoformat()}Z',
        '',
        "const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/g55oyjhn/image/upload/f_auto,q_auto,c_limit';",
        'const cloudinaryUrl = (path) => {',
        '  if (!path.startsWith("/")) return path;',
        '  const publicPath = path.startsWith("/images/") ? path.substring(8) : path.substring(1);',
        '  return `${CLOUDINARY_BASE_URL}/${encodeURI(publicPath)}`;',
        '};',
        '',
        'export const categories = [',
    ]

    for category in categories:
        cid = category["id"]
        lines.append('  {')
        lines.append(f'    "id": {js_string(cid)},')
        lines.append(f'    "label": {js_string(category["label"])},')
        if cid in old_descriptions:
            lines.append(f'    "description": {js_string(old_descriptions[cid])},')
        lines.append(f'    "cover": cloudinaryUrl({js_string(category["cover"])}) ,')
        lines.append('    "items": [')
        for item in category['items']:
            iid = item["id"]
            lines.append('      {')
            lines.append(f'        "id": {js_string(iid)},')
            lines.append(f'        "image": cloudinaryUrl({js_string(item["image"])}) ,')
            lines.append(f'        "caption": {js_string(item["caption"])},')
            if iid in old_story_texts:
                lines.append(f'        "storyText": {js_string(old_story_texts[iid])},')
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


if __name__ == '__main__':
    main()
