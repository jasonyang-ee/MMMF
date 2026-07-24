# AGENTS.md

## AI File Purpose

- `AGENTS.md` = repo work rules.
- `SPEC.md` = single system truth, durable & mutable. Read before any change. only for durable change. ⊥ one-time fixes; high bar to add.
- `PLAN.md` + `HANDOFF.md` = short-lived cycle files. `PLAN.md` = next phase plan & owns task tracking (§T). `HANDOFF.md` = session progress tracking.
- `BACKLOG.md` = optional, free style pending prep inputs and notes. only ingested by `/prep`.

## Codebase Summary

MMMF (Max Money Market Funds) — personal finance balance forecasting SPA.
Stack: React 19 + Vite (Tailwind v4) frontend | Express.js backend | file-based JSON storage | Hono for Cloudflare Workers mirror.
→ data shapes, API surface, invariants, component list: `SPEC.md`

## Layout

```
client/src/App.jsx              # central state + all API calls
client/src/components/          # BalanceDisplay, BalanceTimeline, DatePicker,
                                #   DeleteButton, ForecastSettings, GlobalSettings,
                                #   Header, RecurringCreditCards, RecurringList,
                                #   TransactionForm, TypeToggle
client/src/api.js               # fetch wrapper for all /api routes
client/src/utils.js             # calculateBalance, generateRecurringTransactions, formatters
client/src/i18n.js              # I18nProvider + useI18n; 4 active langs
client/index.html               # Vite entry point
server/index.js                 # Express REST API + static serving (production)
server/hono-app.js              # Cloudflare Workers/Pages mirror (Hono + KV)
server/demo-session.js          # cookie-based session isolation (DEMO=true mode)
cloudflare/worker.js            # Hono worker entry point
cloudflare/functions/api/[[route]].js  # Cloudflare Pages function route
data/                           # JSON flat-file DB: transactions.json, recurring.json,
                                #   settings.json, credit-cards.json
client/dist/                    # Vite build output (served by Express in production)
```

## Skills

1. `/setup` → bootstrap guidance + minimal durable files
2. `/prep` → iterative PLAN.md + HANDOFF.md + SPEC.md handoff
3. `/review-plan` → research/refute plan → GO/NO-GO
4. `/cook` → execute all remaining phases in order → verify → commit → handoff after each phase. Optional phase arg → target one phase. Single main agent.
5. `/cater` → same phases via sub-agents, parallel when file sets ⊥ intersect. 4 | 5 exclusive per phase, ⊥ both.
6. `/garnish` → SPEC.md cleanup → blank PLAN.md + HANDOFF.md to template
7. `/review-code` → baseline code sweep → prep

support: `/handoff` session baton | `/encode-docs` sole mutator of `SPEC.md`, `PLAN.md`, and `HANDOFF.md` | `encode-header` header template | `/encode-commit` commit summary | `/encode-pr` PR review comments

## Project Scripts

- `./start.sh` — install deps, build frontend, start dev servers (Express :3600 + Vite :5173).
- `./release.sh` — bump version + tag release.

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

## Encoding Symbols

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

Tables use `|`; escape literal `\|`. SPEC `§C`/`§I`/`§R`/`§V` tables carry a GFM delimiter row (`|---|---|`, one cell per column) under the header. `§T` status: `x` done, `~` wip, `.` todo.

## Rules

- Rate limiting active on API (`express-rate-limit`); ⊥ remove or bypass.
- Demo mode (`DEMO=true`) → session-isolated data via cookies; ⊥ leak cross-session data.
- IDs ! use `Date.now().toString()`; ⊥ introduce UUID unless explicitly requested.

## End of Chat Checklist

- Ensure ∀ lint + tests pass.
- Update `CHANGELOG.md` `## [Unreleased]` ∀ feature/fix.
- Commit directly (single summary commit, ⊥ Claude co-author trailer). ⊥ push | tag without explicit ask.
