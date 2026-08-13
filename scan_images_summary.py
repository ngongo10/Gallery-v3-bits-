from pathlib import Path
from PIL import Image
import os
root = Path('public/images')
if not root.exists():
    raise SystemExit('public/images not found')
count = {'jpg':0,'png':0,'jpeg':0,'webp':0,'avif':0,'gif':0,'other':0}
minw = 10**9
minh = 10**9
maxw = 0
maxh = 0
format_sizes = {}
large = []
for p in sorted(root.rglob('*')):
    if p.is_file():
        ext = p.suffix.lower().lstrip('.')
        count[ext] = count.get(ext, 0) + 1
        if ext in {'jpg','jpeg','png','webp','avif','gif'}:
            try:
                with Image.open(p) as img:
                    w, h = img.size
            except Exception as e:
                continue
            size = os.path.getsize(p)
            minw = min(minw, w)
            minh = min(minh, h)
            maxw = max(maxw, w)
            maxh = max(maxh, h)
            format_sizes.setdefault(ext, []).append(size)
            if size > 1000000 or w >= 3000 or h >= 3000:
                large.append((str(p.relative_to(root)), ext, size, w, h))
print(f'counts: {count}')
print(f'dimensions range: min={minw}x{minh}, max={maxw}x{maxh}')
for ext, sizes in format_sizes.items():
    print(f'{ext}: count={len(sizes)}, avg={sum(sizes)/len(sizes)/1024:.1f}KB, min={min(sizes)/1024:.1f}KB, max={max(sizes)/1024:.1f}KB')
print('\nlarge or high-res example images:')
for row in large[:30]:
    print(row)
