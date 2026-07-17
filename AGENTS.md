# AGENTS.md

## AI File Purpose

- `AGENTS.md` = repo work rules.
- `SPEC.md` = single system truth. Read before ∀ change. Baked format header @ top. §V invariants, §T tasks, §R sourced research.
- `PLAN.md` + `HANDOFF.md` = short-lived cycle files. `PLAN.md` = next phase plan. `HANDOFF.md` = phase handoff summary. ∀ change → update `SPEC.md` + `PLAN.md` + `HANDOFF.md`.

## Codebase Summary

MMMF (Max Money Market Funds) — personal finance balance forecasting SPA.
Stack: React 19 + Vite (Tailwind v4) frontend | Express.js backend | file-based JSON storage | Hono for Cloudflare Workers mirror.
Goal: predict account balance by date → optimize money market fund deposit timing.

## Layout

```
client/src/          # React SPA — App.jsx (state), components/, api.js, utils.js, i18n.js
server/index.js      # Express REST API + static serving in production
server/hono-app.js   # Cloudflare Workers/Pages mirror (Hono + KV)
server/demo-session.js # cookie-based session isolation for demo mode
data/                # JSON flat-file DB: transactions.json, recurring.json, settings.json, credit-cards.json
cloudflare/          # Hono worker entry + Pages function route
client/dist/         # Vite build output (served by Express in production)
```

## Skills

1. `/prep` → bootstrap guidance + minimal durable files
2. `/cook` → iterative `PLAN.md` + `HANDOFF.md` + `SPEC.md` handoff
3. `/review-plan` → research/refute plan → GO/NO-GO
4. `/workonplan` → execute phase → verify → commit → handoff. Single main agent.
5. `/dispatchplan` → same phases via sub-agents, parallel when file sets ⊥ intersect.
   4 | 5 exclusive per phase, ⊥ both.
6. `/garnish` → spec cleanup → purge `PLAN.md` + `HANDOFF.md`
7. `/review-code` → baseline code sweep → cook

support: `/spec` sole `SPEC.md` mutator | `/handoff` baton | `/caveman-encode` file encoding | `/caveman` chat brevity | `/caveman-commit` commit summary | `/caveman-pr` PR review comments

## Project Scripts

- `./start.sh` — install deps, build frontend, start dev servers (Express :3600 + Vite :5173).
- `npm run dev` — start Express + Vite concurrently (dev, no build step).
- `npm run build` — Vite production build → `client/dist/`.
- `npm start` — start Express in production (serves `client/dist/`).
- `?` — no test runner configured. ! check lint before ending chat.
- `./release.sh` — bump version + tag release.

## Architecture

- Express server reads/writes JSON files in `data/` directory.
- Hono app (`server/hono-app.js`) mirrors Express API but uses Cloudflare KV for storage.
- Demo mode (`server/demo-session.js`) provides isolated sessions with auto-cleanup.
- Frontend is a single-page React app; Vite proxies `/api` to Express in dev.
- Production: Express serves built `client/dist/` as static files with SPA fallback.
- Docker: port 5173, bind mount `/app/data/`, env `TZ` + `DEFAULT_LANGUAGE`.

## Key Frontend Components

- `App.jsx` — central state + ∀ API calls. Children receive callbacks.
- `BalanceTimeline.jsx` — forecast chart visualization.
- `RecurringList.jsx` — recurring debits/credits management.
- `RecurringCreditCards.jsx` — credit cards with per-cycle payment input.
- `TransactionForm.jsx` / `TransactionList.jsx` — one-time transaction entry/display.
- `GlobalSettings.jsx` / `ForecastSettings.jsx` — app configuration.
- `DarkModeToggle.jsx` — theme switching.
- `i18n.js` — i18n provider; supported: `en`, `es`, `zht`, `ja`.

## Code Style

- ES Modules throughout (`"type": "module"` in `package.json`).
- React components use JSX with hooks (`useState`, `useEffect`, `useRef`).
- Inline editing: `useRef` + `useEffect` for focus/select, Enter → save, Escape → cancel.
- Tailwind utility classes; dark mode via class-based toggle.
- Config files (`vite`, `postcss`, `tailwind`) live inside `client/`, ⊥ root.
- Server logs: ASCII only, format `[LEVEL] [ServiceName] Message`.
- Server files: `{entity}Controller.js`, `{name}Service.js`, `{entity}.js` (routes).
- Client files: `{PageName}.jsx` (pages), `{ComponentName}.jsx` (components).
- Naming: camelCase (vars/functions), PascalCase (components), snake_case (DB columns).

## Data Format

- ∀ data stored as JSON arrays in `data/*.json`.
- IDs: `Date.now().toString()`.
- Settings: `{ startingBalance, currentDate, forecastEndDate, currencySymbol, dateFormat, language }`.
- Recurring: `{ id, name, amount, dayOfMonth, type: "debit"|"credit" }`.
- Credit cards: `{ id, name, dayOfMonth }` — amounts added per billing cycle as transactions.

## Caveman Symbols

Use symbols below as short, exact operators. Preserve paths, code, IDs, URLs, numbers, regex, errors verbatim.

- `→` leads to | becomes | triggers
- `∴` therefore | consequence
- `∀` every | for all
- `∃` some | exists
- `!` must | required
- `?` unknown | optional
- `⊥` never | forbidden | absent
- `≠` differs | `∈` member of | `∉` not member of
- `≤` at most | `≥` at least | `&` and | `|` or
- `§` section reference, e.g. `§V.3`

Tables use `|`; escape literal `\|`. `§T` status: `x` done, `~` wip, `.` todo.
`caveman` prose drops symbols; `caveman-encode` requires them for `SPEC.md`, `PLAN.md`, `HANDOFF.md`.

## Rules

- Rate limiting active on API (`express-rate-limit`); ⊥ remove or bypass.
- Demo mode (`DEMO=true`) → session-isolated data via cookies; ⊥ leak cross-session data.
- IDs ! use `Date.now().toString()`; ⊥ introduce UUID unless explicitly requested.
- Node.js ≥ 20 ! required.

## End of Chat Checklist

- Ensure ∀ lint + tests pass.
- Update `CHANGELOG.md` `## [Unreleased]` ∀ feature/fix.
- Update `SPEC.md` ∀ code change / new feature (flip `§T`, add `§V`).
- Refresh `HANDOFF.md` when phase/session ends.
- Commit directly (single summary commit, ⊥ Claude co-author trailer). ⊥ push | tag without explicit ask.
