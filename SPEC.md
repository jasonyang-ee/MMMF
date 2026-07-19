<!-- SPEC FORMAT (baked by /spec — keep; makes this file self-describing)
Sections, fixed order: §G goal | §C constraints | §I interfaces | §R research? | §V invariants | §T tasks | §B bugs
Address §<S>.<n> — §V.2 = invariants item 2. Commits/PRs cite by §.
Encoding caveman: drop articles/filler/aux verbs. Fragments fine. Short synonyms (fix > implement).
Preserve verbatim: code, paths, identifiers, URLs, numbers, error strings, SQL, regex.
Symbols: → leads to | ∴ therefore | ∀ every | ∃ some | ! must | ? may/unknown | ⊥ never | ≠ | ∈ | ∉ | ≤ | ≥ | & and | § section
Tables (§R,§T,§B): pipe-delimited. ids monotonic, never reused. Escape literal \| . Empty cell = -
§T status: x done | ~ wip | . todo
One file rule: >500 lines → compact §B oldest-first, ⊥ split into more files.
Full rules: /spec skill (§FORMAT). Cutting a word that loses a fact ⊥ allowed.
-->

# SPEC

## §G GOAL

SPA forecasts personal account balance across date range → user identifies optimal money market fund deposit timing.

## §C CONSTRAINTS

- React 19 + Vite (Tailwind v4) frontend; ⊥ swap UI framework.
- Express.js backend; file-based JSON storage in `data/`; ⊥ introduce external DB.
- Cloudflare Workers/Pages mirror via Hono + KV; ! stay API-compatible with Express routes.
- Node.js ≥ 20.
- ES Modules throughout (`"type": "module"`).
- IDs ! use `Date.now().toString()`; ⊥ UUID unless explicitly asked.
- `express-rate-limit` active; ⊥ remove or bypass.
- Demo mode (`DEMO=true`) → per-session data isolation via `mmmf_demo_session` cookie; ⊥ leak cross-session.
- i18n: supported languages `en`, `es`, `zht`, `ja`; `lang` cookie overrides server setting.
- Docker: port 5173, bind mount `/app/data/`, env `TZ` + `DEFAULT_LANGUAGE`.

## §I INTERFACES

### REST API (Express :3600 + Hono mirror)

- `GET /api/transactions` → `Transaction[]`
- `POST /api/transactions` body `{date, amount, type, description}` → `Transaction` 201
- `PUT /api/transactions/:id` → `Transaction`
- `DELETE /api/transactions/:id` → `{success:true}`
- `DELETE /api/transactions` → `{success:true}` (clear all, keep recurring)
- `GET /api/recurring` → `Recurring[]`
- `POST /api/recurring` body `{name, amount, dayOfMonth, type}` → `Recurring` 201
- `PUT /api/recurring/:id` → `Recurring`
- `DELETE /api/recurring/:id` → `{success:true}`
- `GET /api/credit-cards` → `CreditCard[]`
- `POST /api/credit-cards` body `{name, dayOfMonth}` → `CreditCard` 201
- `PUT /api/credit-cards/:id` → `CreditCard`
- `DELETE /api/credit-cards/:id` → `{success:true}`
- `GET /api/settings` → `Settings`
- `PUT /api/settings` body `Settings` → `Settings`

### Data Shapes

- `Transaction`: `{ id, date, amount, type:"debit"|"credit", description?, createdAt }`
- `Recurring`: `{ id, name, amount, dayOfMonth, type:"debit"|"credit", createdAt }`
- `CreditCard`: `{ id, name, dayOfMonth, createdAt }`
- `Settings`: `{ startingBalance, currentDate, forecastEndDate, currencySymbol, dateFormat, language }`

### Files

- `data/transactions.json` — `Transaction[]`
- `data/recurring.json` — `Recurring[]`
- `data/credit-cards.json` — `CreditCard[]`
- `data/settings.json` — `Settings`

### Environment

- `PORT` — Express listen port (default `3600`)
- `NODE_ENV` — `production` → serve `client/dist/` static + SPA fallback
- `DEMO` — `"true"` → session-isolated data per cookie
- `DEFAULT_LANGUAGE` — `en`|`es`|`zht`|`ja` (default `en`); used when no per-session lang set
- `TZ` — timezone for server date ops

### Frontend (Vite :5173 in dev)

- `GET /` — SPA entry; loads App.jsx
- Dev: Vite proxies `/api` → `http://localhost:3600/api`
- Prod: Express serves `client/dist/` + `/api` routes

### Frontend Components

- `App.jsx` — central state + ∀ API calls; passes callbacks to children
- `BalanceTimeline.jsx` — forecast table (balance history by date)
- `BalanceDisplay.jsx` — starting/current/lowest balance display; inline edit
- `RecurringList.jsx` — recurring debits/credits CRUD; inline edit on click
- `RecurringCreditCards.jsx` — credit cards + per-cycle payment input; auto-focus amount
- `TransactionForm.jsx` — one-time transaction entry
- `ForecastSettings.jsx` — currentDate, forecastEndDate, clear-all
- `GlobalSettings.jsx` — currency, date format, language, dark mode toggle
- `DatePicker.jsx` — custom calendar picker (mobile-aware)
- `api.js` — fetch wrapper; ∀ `/api` calls
- `utils.js` — `calculateBalance`, `generateRecurringTransactions`, `formatCurrency`, `formatDate`
- `i18n.js` — `I18nProvider` + `useI18n`; 4 active languages + translations for 20

## §R RESEARCH

| id  | claim                                                                                                                                                                              | source                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| R1  | `server/hono-app.js:16` uses `app.use("/api/*", cors())` — wildcard, no config; Cloudflare deployment also needs CORS restriction                                                  | `server/hono-app.js:16` |
| R2  | Cloudflare Workers serves frontend assets co-located (`wrangler.jsonc`: `assets.directory: ./client/dist`); same origin → `cors()` unnecessary in prod for same-origin clients     | `wrangler.jsonc:17`     |
| R3  | Express prod: `NODE_ENV=production` → Express serves `client/dist/` from same origin → same-origin; `cors()` can be removed or origin set to `false` for prod                      | `server/index.js:107`   |
| R4  | `.github/workflows/cleanup-ghcr.yml:26` hardcodes `package-name: iclib` — stale name; repo GHCR package is `mmmf`; cleanup never fires against the actual package                  | `cleanup-ghcr.yml:26`   |
| R5  | Dependabot `open-pull-requests-limit: 0` stops version-update PRs; security alerts (scan report on GitHub Security tab) are a separate repo-level setting independent of this file | GitHub Dependabot docs  |
| R6  | `TransactionList` imported `App.jsx:11` but ⊥ rendered in JSX (grep: only import line, no `<TransactionList`); `TransactionList.jsx` ⊥ other importer → dead import + dead file | `App.jsx:11`, `client/src/components/TransactionList.jsx` |
| R7  | `DarkModeToggle.jsx` ⊥ imported anywhere (grep: only self def+export); dark-mode toggle logic dup inline `GlobalSettings.jsx:11-39` (state+effect+toggle fn) & `GlobalSettings.jsx:67-113` (svg+switch markup) → dead component + dup logic | `client/src/components/DarkModeToggle.jsx`, `GlobalSettings.jsx:11-113` |
| R8  | submit-button slate clone `bg-slate-600 text-white hover:bg-slate-700 dark:bg-slate-700...` (∉ `.btn*`) @ 5 sites | `RecurringList.jsx:299`, `TransactionForm.jsx:118`, `RecurringCreditCards.jsx:230`, `RecurringCreditCards.jsx:256`, `RecurringCreditCards.jsx:367` |
| R9  | debit/credit type-toggle button pair dup — near-identical, size differs (`py-2 px-3 text-sm` vs `py-2.5 px-4`) → extract parametrized shared | `RecurringList.jsx:272-295`, `TransactionForm.jsx:81-104` |
| R10 | add/cancel header toggle-link clone `text-primary-600 hover:text-primary-700 dark:text-gray-400... text-sm font-medium` | `RecurringList.jsx:223-228`, `RecurringCreditCards.jsx:331-336` |
| R11 | delete-icon-button + trash svg path clone (`p-0.5` w-4 h-4 / `p-1` w-5 h-5) → dedup to shared; all <44px hit area | `RecurringList.jsx:144`, `RecurringCreditCards.jsx:202`, `BalanceTimeline.jsx:71`, `TransactionList.jsx:58` (dead) |
| R12 | touch targets <44px: dark-toggle switch `h-6 w-11`=24px; delete btns ~20-28px; DatePicker nav `p-2`+w-5 h-5 ~36px; DatePicker day cell `h-10`=40px | `GlobalSettings.jsx:98-105`, `DatePicker.jsx:139-166`, `DatePicker.jsx:205` |
| R13 | `App.jsx:357` grid single breakpoint `grid-cols-1 min-[1420px]:grid-cols-[320px_1fr_384px]`; <1420px → 1-col DOM order = BalanceDisplay,ForecastSettings,GlobalSettings → BalanceTimeline → RecurringCreditCards,RecurringList,TransactionForm ∴ timeline buried after 3 settings cards on mobile | `App.jsx:357-427` |
| R14 | V18 body-h-scroll risk LOW: BalanceTimeline table `minWidth:480px` inside `overflow-x-auto custom-scrollbar -mx-4 sm:mx-0` (contained); DatePicker popup `w-[calc(100vw-2rem)] sm:w-80 max-w-80` fits 360px ∴ main V18 work = layout order + intermediate breakpoint, ⊥ overflow fixes | `BalanceTimeline.jsx:32-35`, `DatePicker.jsx:136` |

## §V INVARIANTS

V1: ∀ API write → ID = `Date.now().toString()` (⊥ UUID)
V2: demo mode (`DEMO=true`) → ∀ read/write scoped to `mmmf_demo_session` cookie value; ⊥ cross-session leak
V3: `express-rate-limit` active on ∀ routes; ⊥ disable or skip
V4: loopback IPs (`127.0.0.1`, `::1`, `::ffff:127.*`) exempt from static rate limiter (health checks)
V5: forecast balance sort order: same-date credits before debits
V6: settings missing fields → defaults applied on `GET /api/settings` (⊥ null returned)
V7: language ∈ `["en","es","zht","ja"]`; invalid → fallback `"en"`; ! consistent server + client
V8: `client/dist/` served as static ∀ `NODE_ENV=production`; ∀ unknown routes → SPA fallback
V9: Hono app (Cloudflare) ! expose same REST API surface as Express; ⊥ new endpoints on one runtime only
V10: ∀ JSON file write → `JSON.stringify(data, null, 2)` (pretty-print)
V11: ∀ write route → readJsonFile null → 500 JSON error; ⊥ unhandled TypeError
V12: `PUT /api/settings` → language field ! validated ∈ V7 set; startingBalance ! numeric
V13: `client/src/api.js` fetch calls → res.ok check before `.json()`; ⊥ 4xx/5xx silently applied to state
V14: CORS → production deployments ! restrict allowed origins; ⊥ wildcard in production
V15: `release.sh` ⊥ create GitHub Release (CI `release.yml` owns it); ! guard: tag ⊥ exist, `[Unreleased]` ≠ empty, ⊥ push all tags
V16: `cleanup-ghcr.yml` `package-name` ! match actual GHCR package (`mmmf`); ⊥ hardcode stale name; prefer `${{ github.event.repository.name }}`
V17: Dependabot ⊥ auto-open PRs (`open-pull-requests-limit: 0` ∀ ecosystems); scanning/alerts ! remain enabled via repo Security settings
V18: viewport ≤390px → ⊥ horizontal body scroll; wide content (tables) scrolls inside own `overflow-x-auto` container only
V19: ∀ discrete tap control (buttons, toggle switches, icon buttons, calendar nav + day cells) → touch target ≥44px on mobile viewport; ! implement via `min-h-11 min-w-11` (44px = Tailwind 11) | padding yielding ≥44px hit area so greppable; ⊥ visual-only claim. EXCLUDED: dense inline click-to-edit text rows (recurring/card name+amount, balance figures) — per-row 44px min-height bloats list density on mobile ∴ deliberately exempt; `.input`/`.input cursor-pointer` selects governed by `.input` shared class (§V.20), ⊥ V19
V20: buttons/inputs/cards ! use shared `.btn*`/`.input`/`.card` classes from `client/src/index.css`; ⊥ duplicate inline utility clones of existing component classes; ⊥ dead/unused component files; shared logic (e.g. dark-mode toggle) ! single source, ⊥ inline re-implementation

## §T TASKS

| id  | status | task                                                                                                             | cites       |
| --- | ------ | ---------------------------------------------------------------------------------------------------------------- | ----------- |
| T1  | x      | initial SPA + Express scaffold                                                                                   | -           |
| T2  | x      | file-based JSON storage (transactions, recurring, settings)                                                      | V10         |
| T3  | x      | balance forecast calculation + chart (BalanceTimeline.jsx)                                                       | V5          |
| T4  | x      | credit cards CRUD + per-cycle payment input                                                                      | -           |
| T5  | x      | rate limiting + loopback exemption                                                                               | V3,V4       |
| T6  | x      | demo mode session isolation                                                                                      | V2          |
| T7  | x      | Cloudflare Workers/Pages Hono mirror                                                                             | V9          |
| T8  | x      | i18n (en, es, zht, ja) + lang cookie                                                                             | V7          |
| T9  | x      | dark mode toggle (class-based)                                                                                   | -           |
| T10 | x      | mobile layout support                                                                                            | -           |
| T11 | x      | Docker image (port 5173, `/app/data/` mount)                                                                     | V8          |
| T12 | .      | add test runner + lint check to CI                                                                               | ?           |
| T13 | .      | ? expand currency support beyond current set                                                                     | ?           |
| T14 | x      | server-side settings validation (language, startingBalance)                                                      | V12         |
| T15 | x      | api.js res.ok guard on all fetch calls                                                                           | V13         |
| T16 | x      | CORS origin restriction for production                                                                           | V14         |
| T17 | x      | rewrite `release.sh` — `pipefail`, dry-run, body-scan for breaking changes, correct changelog awk, drop `gh` dep | V15         |
| T18 | x      | final verify API harden — §V.12-14 compliance confirmed                                                          | V12,V13,V14 |
| T19 | x      | final verify release.sh — §V.15 compliance confirmed                                                             | V15         |
| T20 | x      | fix `cleanup-ghcr.yml` — correct package-name to `mmmf`; use repo-name var                                       | V16         |
| T21 | x      | fix `dependabot.yml` — set `open-pull-requests-limit: 0` all ecosystems; keep schedule/scan                      | V17         |
| T22 | x      | final verify CI/CD — §V.16-17 compliance confirmed; dry-run check.yml logic verified                             | V16,V17     |
| T23 | x      | research: audit ∀ 11 components mobile behavior + consistency catalog (touch targets, dupe styles, dead code)    | V18,V19,V20 |
| T24 | x      | mobile responsive fixes — layout order, touch targets, no body h-scroll ≤390px                                    | V18,V19     |
| T25 | x      | UI consistency unification — dedupe inline button/input clones → shared classes                                   | V20         |
| T26 | x      | final verify UI — §V.18-20 compliance, build + viewport checks                                                    | V18,V19,V20 |

## §B BUGS

| id  | date       | cause                                                                               | fix |
| --- | ---------- | ----------------------------------------------------------------------------------- | --- |
| B1  | 2026-07-16 | `lang` cookie allowlist used `"jp"` → `"ja"` cookie rejected on reload              | V7  |
| B2  | 2026-07-16 | `DEFAULT_LANGUAGE` only accepted `en`\|`es`; `zht`/`ja` silently fell to `en`       | V7  |
| B3  | 2026-07-16 | write routes called array methods on null from `readJsonFile` → unhandled TypeError | V11 |
