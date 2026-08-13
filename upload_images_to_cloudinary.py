#!/usr/bin/env python3
"""Upload images under public/images to Cloudinary preserving folder structure.

Usage:
  python upload_images_to_cloudinary.py [--yes]

Run without `--yes` to do a dry-run and see how many files will be uploaded.
"""
from pathlib import Path
import hashlib
import json
import os
import sys
import time
from urllib.parse import urlencode

import mimetypes

try:
    import requests
except Exception:
    print('This script requires the `requests` package. Install with: pip install requests', file=sys.stderr)
    sys.exit(1)


CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
API_KEY = os.getenv('CLOUDINARY_API_KEY')
API_SECRET = os.getenv('CLOUDINARY_API_SECRET')

if not CLOUD_NAME or not API_KEY or not API_SECRET:
    sys.exit('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the environment.')

ROOT = Path('public/images')
if not ROOT.exists():
    sys.exit('public/images directory not found; put your local albums there.')


def iter_images(root: Path):
    for p in sorted(root.rglob('*')):
        if p.is_file():
            ext = p.suffix.lower()
            if ext in {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'}:
                rel = p.relative_to(root)
                # use forward-slash paths
                yield p, str(rel).replace('\\', '/')


def make_signature(params, api_secret):
    items = []
    for k in sorted(params.keys()):
        if params[k] is None or params[k] == '':
            continue
        items.append(f"{k}={params[k]}")
    to_sign = '&'.join(items)
    to_sign = to_sign + api_secret
    return hashlib.sha1(to_sign.encode('utf-8')).hexdigest()


def upload_file(local_path: Path, public_id: str, overwrite=False):
    url = f'https://api.cloudinary.com/v1_1/{CLOUD_NAME}/image/upload'
    timestamp = int(time.time())
    params = {
        'public_id': public_id,
        'timestamp': timestamp,
    }
    if not overwrite:
        params['overwrite'] = 'false'

    signature = make_signature(params, API_SECRET)
    data = {
        'api_key': API_KEY,
        'timestamp': timestamp,
        'public_id': public_id,
        'signature': signature,
    }
    if not overwrite:
        data['overwrite'] = 'false'

    files = {'file': (local_path.name, open(local_path, 'rb'), mimetypes.guess_type(str(local_path))[0] or 'application/octet-stream')}
    resp = requests.post(url, data=data, files=files, timeout=120)
    try:
        return resp.status_code, resp.json()
    except Exception:
        return resp.status_code, {'error': resp.text}


def main():
    dry_run = '--yes' not in sys.argv
    # optional: --folder <name> to only upload files under that top-level folder
    folder_filter = None
    if '--folder' in sys.argv:
        try:
            idx = sys.argv.index('--folder')
            folder_filter = sys.argv[idx + 1]
        except Exception:
            print('Usage: upload_images_to_cloudinary.py [--yes] [--folder <folderName>]')
            sys.exit(1)
    to_upload = []
    def sanitize_public_id(rel_path: str):
        import unicodedata, re
        parts = rel_path.split('/')
        clean_parts = []
        for i, part in enumerate(parts):
            # remove extension on last part
            if i == len(parts) - 1:
                part = Path(part).stem
            # normalize to ASCII
            part = unicodedata.normalize('NFKD', part)
            part = part.encode('ascii', 'ignore').decode('ascii')
            # replace disallowed chars with hyphen, allow letters, numbers, underscore, hyphen
            part = re.sub(r'[^A-Za-z0-9_-]+', '-', part).strip('-')
            if not part:
                part = 'item'
            clean_parts.append(part)
        return '/'.join(clean_parts)

    for path, rel in iter_images(ROOT):
        # rel uses forward slashes (folder/sub/file)
        if folder_filter:
            if not rel.startswith(folder_filter + '/') and rel != folder_filter:
                continue
        public_id = sanitize_public_id(rel)
        to_upload.append((path, public_id))

    print(f'Found {len(to_upload)} images under {ROOT} to upload.')
    if dry_run:
        for p, pid in to_upload[:20]:
            print('DRY:', pid, '->', p)
        if len(to_upload) > 20:
            print('... (showing first 20)')
        print('\nRun with --yes to actually upload.')
        return

    uploaded = 0
    failed = []
    uploaded_items = []
    for p, pid in to_upload:
        print('Uploading', pid)
        status, body = upload_file(p, pid, overwrite=False)
        if status == 200 and 'public_id' in body:
            uploaded += 1
            print(' OK', body.get('public_id'))
            folder_label = str(pid).split('/')[0]
            uploaded_items.append({
                'public_id': body.get('public_id'),
                'folder': folder_label,
                'file': Path(pid).name,
            })
        else:
            failed.append((p, status, body))
            print(' FAIL', status, body)

    print(f'Upload finished: {uploaded} uploaded, {len(failed)} failed')
    if failed:
        print('Failures sample:')
        for f in failed[:10]:
            print(f)

    # Save a local record of uploaded items and generate portfolio.js locally
    snapshot = Path('.cloudinary_uploaded.json')
    snapshot.write_text(json.dumps(uploaded_items, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Wrote upload snapshot to {snapshot}')

    # Generate src/data/portfolio.js from uploaded_items (group by top-level folder)
    from collections import defaultdict
    groups = defaultdict(list)
    for item in uploaded_items:
        folder = item['folder']
        public_id = item['public_id']
        groups[folder].append(public_id)

    DEST = Path('src/data/portfolio.js')
    CLOUDINARY_BASE_URL = f'https://res.cloudinary.com/{CLOUD_NAME}/image/upload/f_auto,q_auto'
    lines = [
        '// Portfolio data generated from local upload snapshot',
        f'// Generated: {time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}',
        '',
        f"const CLOUDINARY_BASE_URL = '{CLOUDINARY_BASE_URL}';",
        'const cloudinaryUrl = (path) => {',
        '  if (!path.startsWith("/")) return path;',
        '  const publicPath = path.startsWith("/images/") ? path.substring(8) : path.substring(1);',
        '  return `${CLOUDINARY_BASE_URL}/${encodeURI(publicPath)}`;',
        '};',
        '',
        'export const categories = [',
    ]

    used_ids = set()
    def slugify(name):
        import unicodedata, re
        normalized = unicodedata.normalize('NFKD', name)
        ascii_name = normalized.encode('ascii', 'ignore').decode('ascii')
        slug = re.sub(r'[^a-z0-9]+', '-', ascii_name.lower()).strip('-')
        return slug or 'album'

    for folder, public_ids in sorted(groups.items(), key=lambda x: x[0].lower()):
        cat_id_base = slugify(folder)
        cat_id = cat_id_base
        suffix = 1
        while cat_id in used_ids:
            cat_id = f'{cat_id_base}-{suffix}'
            suffix += 1
        used_ids.add(cat_id)

        items = []
        for idx, pid in enumerate(sorted(public_ids)):
            image_path = f'/{pid}'
            item_id = f'{cat_id}-{idx}'
            caption = f'{folder} #{idx+1}'
            items.append((item_id, image_path, caption))

        if not items:
            continue

        lines.append('  {')
        lines.append(f'    "id": "{cat_id}",')
        lines.append(f'    "label": "{folder}",')
        lines.append(f'    "cover": cloudinaryUrl("{items[0][1]}"),')
        lines.append('    "items": [')
        for it in items:
            lines.append('      {')
            lines.append(f'        "id": "{it[0]}",')
            lines.append(f'        "image": cloudinaryUrl("{it[1]}"),')
            lines.append(f'        "caption": "{it[2]}"')
            lines.append('      },')
        lines.append('    ]')
        lines.append('  },')

    lines.append('];')
    lines.append('')
    lines.append('export const allItems = [')
    for folder, public_ids in sorted(groups.items(), key=lambda x: x[0].lower()):
        cat_id = slugify(folder)
        for idx, pid in enumerate(sorted(public_ids)):
            item_id = f'{cat_id}-{idx}'
            image_path = f'/{pid}'
            title = f'{folder} #{idx+1}'
            lines.append('  {')
            lines.append(f'    "id": "{item_id}",')
            lines.append(f'    "image": cloudinaryUrl("{image_path}"),')
            lines.append(f'    "title": "{title}",')
            lines.append(f'    "category": "{cat_id}",')
            lines.append(f'    "categoryLabel": "{folder}"')
            lines.append('  },')
    lines.append('];')

    DEST.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'Wrote {DEST} with {len(groups)} categories and {sum(len(v) for v in groups.values())} items.')


if __name__ == '__main__':
    main()
