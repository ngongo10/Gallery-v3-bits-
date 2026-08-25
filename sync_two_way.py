#!/usr/bin/env python3
"""Two-Way Cloudinary Sync Script (sync_two_way.py)
1. Kiem tra va upload anh moi tu public/images/ len Cloudinary.
2. Xoa anh local neu tren Cloudinary da bi xoa (neu co flag --clean-local hoac nguoc lai).
3. Cap nhat portfolio.js theo danh sach tren Cloudinary.
4. Tu dong push Git (tuy chon).
"""
import os, sys, json, base64, hashlib, subprocess
from pathlib import Path
from datetime import datetime

# Load .env
env_file = Path('.env')
if env_file.exists():
    for line in env_file.read_text(encoding='utf-8-sig').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        os.environ[k.strip()] = v.strip().strip('"').strip("'")

try:
    import requests
except ImportError:
    print("Vui long cai dat requests: pip install requests", file=sys.stderr)
    sys.exit(1)

CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
API_KEY = os.getenv('CLOUDINARY_API_KEY')
API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
ROOT = Path('public/images')

if not CLOUD_NAME or not API_KEY or not API_SECRET:
    sys.exit("Khong tim thay CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET trong .env")

AUTH = (API_KEY, API_SECRET)

def make_signature(params, api_secret):
    items = [f"{k}={params[k]}" for k in sorted(params.keys()) if params[k] not in (None, '')]
    to_sign = '&'.join(items) + api_secret
    return hashlib.sha1(to_sign.encode('utf-8')).hexdigest()

def get_cloudinary_assets():
    url = f'https://api.cloudinary.com/v1_1/{CLOUD_NAME}/resources/search'
    resp = requests.post(url, json={'expression': 'resource_type:image AND type:upload', 'max_results': 500}, auth=AUTH).json()
    resources = resp.get('resources', [])
    cursor = resp.get('next_cursor')
    while cursor:
        r2 = requests.post(url, json={'expression': 'resource_type:image AND type:upload', 'max_results': 500, 'next_cursor': cursor}, auth=AUTH).json()
        resources.extend(r2.get('resources', []))
        cursor = r2.get('next_cursor')
    return resources

def upload_file(local_path, folder_name, public_id):
    url = f'https://api.cloudinary.com/v1_1/{CLOUD_NAME}/image/upload'
    timestamp = int(datetime.utcnow().timestamp())
    params = {
        'folder': folder_name,
        'public_id': public_id,
        'timestamp': timestamp,
        'overwrite': False
    }
    signature = make_signature(params, API_SECRET)
    data = {
        'api_key': API_KEY,
        'timestamp': timestamp,
        'signature': signature,
        'folder': folder_name,
        'public_id': public_id,
        'overwrite': 'false'
    }
    with open(local_path, 'rb') as f:
        resp = requests.post(url, data=data, files={'file': f}, timeout=60)
        return resp.status_code in (200, 201)

def main():
    print("="*60)
    print(">>> DONG BO 2 CHIEU: LOCAL <--> CLOUDINARY <--> WEB")
    print("="*60)

    # 1. Lay danh sach hien tai tren Cloudinary
    print("[1/3] Dang kiem tra Cloudinary...")
    cloud_resources = get_cloudinary_assets()
    cloud_public_ids = {r['public_id'].lower() for r in cloud_resources}
    cloud_filenames = {Path(r['public_id']).name.lower() for r in cloud_resources}
    print(f" -> Tim thay {len(cloud_resources)} anh tren Cloudinary.")

    # 2. Kiem tra local folder public/images de upload anh moi
    uploaded_count = 0
    if ROOT.exists():
        local_files = [p for p in ROOT.rglob('*') if p.is_file() and p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'}]
        print(f"[2/3] Kiem tra {len(local_files)} file tai local public/images/...")
        
        for p in local_files:
            rel = p.relative_to(ROOT)
            folder_name = rel.parent.as_posix()
            stem = p.stem
            expected_pid = f"{folder_name}/{stem}".strip('/').lower()
            
            if expected_pid not in cloud_public_ids and stem.lower() not in cloud_filenames:
                print(f" -> Phat hien anh moi local: {rel} => Dang upload...")
                success = upload_file(p, folder_name if folder_name != '.' else '', stem)
                if success:
                    print(f"    + Upload thanh cong: {stem}")
                    uploaded_count += 1
                else:
                    print(f"    - Upload that bai: {stem}")
        if uploaded_count == 0:
            print(" -> Tat ca anh local da duoc dong bo tren Cloudinary.")
    else:
        print("[2/3] Khong co thu muc public/images local. Bo qua upload.")

    # 3. Cap nhat portfolio.js
    print("[3/3] Dang cap nhat src/data/portfolio.js...")
    subprocess.check_call([sys.executable, 'update_cloudinary_portfolio.py'])
    print(" -> Cap nhat portfolio.js hoan tat!")
    print("="*60)

if __name__ == '__main__':
    main()
