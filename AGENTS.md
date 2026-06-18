# AGENTS.md

## Cursor Cloud specific instructions

### Repository layout — two separate Chrome MV3 extensions

This repo contains **two independent products**, each with its own `package.json`:

1. **Root (`/workspace`) — "WhatsApp CRM"** — WXT + React 19 + Dexie + Zod. This is the
   primary product (see root `README.md`, the workspace rules, and `.github/workflows/build-extension.yml`,
   which builds this one and zips `.output/chrome-mv3`). Architecture follows Clean Architecture
   (`src/domain`, `src/application`, `src/infrastructure`, `src/ui`, `src/entrypoints`).
2. **`extension/` — "Explain Like WhatsApp"** — Vite + `@crxjs/vite-plugin` + React 19 + Firebase.
   A different product that explains highlighted text. Recent git history mostly touches this folder.

The update script installs deps for both (`npm install` at root + `npm install --prefix extension`).

### Root "WhatsApp CRM" — run / test / build

Standard scripts in root `package.json`:
- Test: `npm test` (Vitest, runs `src/**/*.test.ts`).
- Build: `npm run build` (WXT → `.output/chrome-mv3`).
- Dev: `npm run dev` (WXT dev server on `localhost:3000`, also auto-launches its own browser via web-ext).
- There is **no lint script** and no ESLint config; "linting" here is just TypeScript strict mode (build/`wxt prepare` will surface type errors).

### `extension/` "Explain Like WhatsApp" — run / test / build

Standard scripts in `extension/package.json` (run from `extension/`):
- Typecheck: `npm run typecheck` (`tsc --noEmit`).
- Build: `npm run build` (`tsc && vite build` → `extension/dist`).
- Dev: `npm run dev` (Vite).
- There are **no automated tests** in this sub-project.
- Full runtime (auth/AI/payments) needs a `.env` (see `extension/.env.example`): Firebase, AI provider, Razorpay. Build/typecheck succeed **without** `.env`; only live login/AI/payment flows require it.

### Loading + testing the extension UI in Chrome (non-obvious)

- To manually test the WhatsApp CRM UI, load the **production build** `.output/chrome-mv3` as an
  unpacked extension. Prefer it over `.output/chrome-mv3-dev` for manual testing: the dev build pulls
  scripts from `localhost:3000` and direct navigation to its pages can fail with `ERR_BLOCKED_BY_CLIENT`.
- **MV3 side panels cannot be opened by direct URL** (`chrome-extension://<id>/sidepanel.html` is blocked).
  The panel is configured with `openPanelOnActionClick`, so open it via a real user gesture: click the
  Chrome toolbar "puzzle piece" (Extensions) icon → click **WhatsApp CRM** (pin it first if needed).
  Have an ordinary web page tab active first, since the panel opens relative to the active tab.
- Core CRM flows (add lead, reminders, campaigns) persist to IndexedDB via the background service worker
  and do **not** require a WhatsApp Web login. AI auto-reply requires a local Ollama server (`localhost:11434`).
