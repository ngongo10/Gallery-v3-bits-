import os
import base64
import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
API_KEY = os.environ.get('CLOUDINARY_API_KEY')
API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')
if not CLOUD_NAME or not API_KEY or not API_SECRET:
    raise SystemExit('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')

AUTH_HEADER = 'Basic ' + base64.b64encode(f'{API_KEY}:{API_SECRET}'.encode()).decode()


def request_json(url, data=None):
    headers = {'Authorization': AUTH_HEADER}
    body = None
    if data is not None:
        body = urlencode(data).encode()
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
    req = Request(url, data=body, headers=headers)
    try:
        with urlopen(req) as resp:
            text = resp.read().decode()
            print('URL:', url)
            print('STATUS:', resp.status)
            print('BODY:', text[:5000])
            return json.loads(text)
    except HTTPError as e:
        print('ERROR', e.code, e.reason)
        print(e.read().decode())
        raise
    except URLError as e:
        print('URL ERROR', e)
        raise

print('FOLDERS LIST')
request_json(f'https://api.cloudinary.com/v1_1/{CLOUD_NAME}/folders/list', {'max_results': 500})
print('\nROOT IMAGE RESOURCES')
request_json(f'https://api.cloudinary.com/v1_1/{CLOUD_NAME}/resources/image/list', {'max_results': 5, 'type': 'upload', 'resource_type': 'image'})
