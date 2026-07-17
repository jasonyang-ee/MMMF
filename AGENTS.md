# AGENTS.md

## AI File Purpose

- `AGENTS.md` = repo work rules.
- `SPEC.md` = single system truth. Read before ∀ change. Baked format header @ top. §V invariants, §T tasks, §R sourced research.
- `PLAN.md` + `HANDOFF.md` = short-lived cycle files. `PLAN.md` = next phase plan. `HANDOFF.md` = phase handoff summary. ∀ change → update `SPEC.md` + `PLAN.md` + `HANDOFF.md`.

## Codebase Summary

MMMF (Max Money Market Funds) — personal finance balance forecasting SPA.
Stack: React 19 + Vite (Tailwind v4) frontend | Express.js backend | file-based JSON storage | Hono for Cloudflare Workers mirror.
→ data shapes, API surface, invariants, component list: `SPEC.md`

## Layout

```
client/src/App.jsx              # central state + all API calls
client/src/components/          # BalanceDisplay, BalanceTimeline, DatePicker,
                                #   DarkModeToggle, ForecastSettings, GlobalSettings,
                                #   Header, RecurringCreditCards, RecurringList,
                                #   TransactionForm, TransactionList
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

1. `/prep` → bootstrap guidance + minimal durable files
2. `/cook` → iterative `PLAN.md` + `HANDOFF.md` + `SPEC.md` handoff
3. `/review-plan` → research/refute plan → GO/NO-GO
4. `/workonplan` → execute phase → verify → commit → handoff. Single main agent.
5. `/dispatchplan` → same phases via sub-agents, parallel when file sets ⊥ intersect. 4 | 5 exclusive per phase, ⊥ both.
6. `/garnish` → spec cleanup → purge `PLAN.md` + `HANDOFF.md`
7. `/review-code` → baseline code sweep → cook

support: `/spec` sole `SPEC.md` mutator | `/handoff` baton | `/caveman-encode` file encoding | `/caveman` chat brevity | `/caveman-commit` commit summary | `/caveman-pr` PR review comments

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

## End of Chat Checklist

- Ensure ∀ lint + tests pass.
- Update `CHANGELOG.md` `## [Unreleased]` ∀ feature/fix.
- Update `SPEC.md` ∀ code change / new feature (flip `§T`, add `§V`).
- Refresh `HANDOFF.md` when phase/session ends.
- Commit directly (single summary commit, ⊥ Claude co-author trailer). ⊥ push | tag without explicit ask.
