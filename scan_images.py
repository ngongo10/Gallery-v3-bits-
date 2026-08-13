from pathlib import Path
from PIL import Image
root = Path('public/images')
if not root.exists():
    raise SystemExit('public/images not found')
for p in sorted(root.rglob('*')):
    if p.is_file() and p.suffix.lower() in {'.jpg','.jpeg','.png','.webp','.avif','.gif'}:
        try:
            with Image.open(p) as img:
                print(f'{p.relative_to(root)}\t{p.suffix.lower().lstrip(".")}\t{p.stat().st_size}\t{img.width}x{img.height}')
        except Exception as e:
            print(f'{p.relative_to(root)}\t{p.suffix.lower().lstrip(".")}\t{p.stat().st_size}\tERROR:{e}')
