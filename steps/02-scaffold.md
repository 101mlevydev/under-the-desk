# Step 02 — Scaffold (Vite + React) + git + env check

**Phase:** Setup · **Status:** done · **Depends on:** 01 approved

## Goal
A running Vite + React 18 skeleton on a git branch, RTL by default.

## Do
- Verify toolchain: `node -v`, `npm -v`, `git --version`.
- `git init` (if needed); create branch `build/under-the-desk`.
- `npm create vite@latest .` (react template) in `under-the-desk/`; add `peerjs` and a small QR
  generator (e.g. `qrcode`) — **bundled locally, no CDN**.
- `index.html` → `<html dir="rtl" lang="he">`; load Heebo/Assistant (or system) font.
- Empty `App.jsx` that renders a "מתחת לשולחן" splash.
- `.gitignore` for `node_modules`, `dist`.

## Files
- `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `.gitignore`

## Done-when
- [ ] `npm run dev` serves the splash with **no console errors**, RTL.
- [ ] `npm run build` produces `dist/` static output.

## Verify
- `run` dev server; browser MCP loads the page; console clean. Commit `step 02: scaffold`.
