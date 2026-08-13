#!/usr/bin/env python3
"""Sync local `public/images` with Cloudinary resources.

Features:
- List images in Cloudinary and optionally download them into `public/images`.
- Optionally delete local files that are not present on Cloudinary.
- Runs in dry-run mode by default; pass `--yes` to apply changes.

Usage:
  python sync_from_cloudinary.py [--yes] [--download] [--delete-local] [--folder <name>]

"""
from pathlib import Path
import base64
import json
import os
import sys
import time
from urllib.parse import urlencode

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
ROOT.mkdir(parents=True, exist_ok=True)

AUTH_HEADER = 'Basic ' + base64.b64encode(f'{API_KEY}:{API_SECRET}'.encode()).decode()


def request_json(url, data=None):
    auth = (API_KEY, API_SECRET)
    try:
        # Try GET with params first; if the endpoint rejects GET with 404,
        # fall back to POST. Some Cloudinary list endpoints use POST.
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


def download_url_for_resource(resource):
    # Prefer secure_url if available, otherwise build a delivery URL.
    if resource.get('secure_url'):
        return resource['secure_url']
    fmt = resource.get('format') or 'jpg'
    base = f'https://res.cloudinary.com/{CLOUD_NAME}/image/upload'
    return f'{base}/{resource["public_id"]}.{fmt}'


def local_path_for_resource(resource):
    public_id = resource['public_id']
    fmt = resource.get('format') or 'jpg'
    parts = public_id.split('/')
    filename = parts[-1] + '.' + fmt
    rel = Path(*parts[:-1]) / filename if len(parts) > 1 else Path(filename)
    return ROOT / rel


def main():
    dry_run = '--yes' not in sys.argv
    do_download = '--download' in sys.argv
    do_delete_local = '--delete-local' in sys.argv
    folder_filter = None
    if '--folder' in sys.argv:
        try:
            idx = sys.argv.index('--folder')
            folder_filter = sys.argv[idx + 1]
        except Exception:
            print('Usage: sync_from_cloudinary.py [--yes] [--download] [--delete-local] [--folder <folderName>]')
            sys.exit(1)

    print('Listing Cloudinary images...')
    resources = list_images(prefix=folder_filter)
    print(f'Found {len(resources)} image resources in Cloudinary')

    expected_local = set()
    for r in resources:
        lp = local_path_for_resource(r)
        expected_local.add(lp.resolve())

    if do_download:
        print('Preparing downloads...')
        for r in resources:
            lp = local_path_for_resource(r)
            url = download_url_for_resource(r)
            if lp.exists():
                # skip if already present
                continue
            print(('DRY download:' if dry_run else 'Downloading:'), url, '->', lp)
            if dry_run:
                continue
            lp.parent.mkdir(parents=True, exist_ok=True)
            try:
                resp = requests.get(url, timeout=60)
                resp.raise_for_status()
                lp.write_bytes(resp.content)
            except Exception as e:
                print('Download failed for', url, e, file=sys.stderr)

    if do_delete_local:
        print('Scanning local files for deletion candidates...')
        local_files = [p for p in ROOT.rglob('*') if p.is_file()]
        to_delete = [p for p in local_files if p.resolve() not in expected_local]
        print(f'Local files: {len(local_files)}, candidates for deletion: {len(to_delete)}')
        for p in to_delete:
            print(('DRY delete:' if dry_run else 'Deleting:'), p)
            if not dry_run:
                try:
                    p.unlink()
                except Exception as e:
                    print('Failed to delete', p, e, file=sys.stderr)

    # Regenerate portfolio.js from Cloudinary (keeps code synced)
    print('Regenerating src/data/portfolio.js from Cloudinary...')
    if dry_run:
        print('DRY: would run: python update_cloudinary_portfolio.py')
    else:
        import subprocess
        try:
            subprocess.check_call([sys.executable, 'update_cloudinary_portfolio.py'])
        except subprocess.CalledProcessError as e:
            print('Failed to update portfolio.js:', e, file=sys.stderr)

    print('Sync complete.' )


if __name__ == '__main__':
    main()
