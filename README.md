# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Cloudinary sync helper

This repo includes helper scripts to keep `src/data/portfolio.js` and `public/images` in sync with your Cloudinary account.

- `update_cloudinary_portfolio.py`: regenerate `src/data/portfolio.js` from Cloudinary folders.
- `upload_images_to_cloudinary.py`: upload images from `public/images` to Cloudinary and generate a snapshot.
- `sync_from_cloudinary.py`: (new) list Cloudinary images and optionally download them to `public/images`, delete local files not on Cloudinary, and regenerate `src/data/portfolio.js`.

Usage example (dry-run):

```bash
python sync_from_cloudinary.py --download --delete-local
```

Add `--yes` to apply deletions/downloads for real.

Quick manual sync steps
 - Set Cloudinary env for the session (PowerShell):

```powershell
. .\set_cloudinary_env.ps1
```

- Regenerate `src/data/portfolio.js` from Cloudinary (no downloads):

```powershell
python .\update_cloudinary_portfolio.py
```

- Generate portfolio from an explicit list of public_ids:

```powershell
python .\generate_portfolio_from_ids.py
```

- Backup and remove local `public/images` (run after you confirm Cloudinary has all images):

```powershell
$ts = (Get-Date -Format "yyyyMMdd-HHmm")
Move-Item .\public\images ".\public\images_backup_$ts"
# After verifying backup, remove permanently:
Remove-Item -Recurse -Force ".\public\images_backup_$ts"
```

Security note: keep API secrets out of source control. Use `.env` (and add it to `.gitignore`) or platform secrets for CI.

