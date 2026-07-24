<!-- SPEC FORMAT (baked by /encode-docs — keep; makes this file self-describing)
Sections, fixed order: §G goal | §C constraints | §I interfaces | §R research? | §V invariants
Symbols: → leads to | ∴ therefore | ∀ every | ∃ some | ! must | ? may/unknown | ⊥ never | ≠ | ∈ | ∉ | ≤ | ≥ | & and | § section
Durable truth only. Mutable: add sparingly (high bar), prune freely on evidence.
Address §<S>.<n> — §V.2 = invariants item 2. Commits/PRs cite by §.
Encoding: drop articles/filler/aux verbs. Fragments fine. Short synonyms (fix > implement).
Preserve verbatim: code, paths, identifiers, URLs, numbers, error strings, SQL, regex.
Tables (§C/§I/§R/§V): pipe-delimited, id-keyed; header row + GFM delimiter row (|---|---|), one cell per column. Escape literal \| . Empty cell = -
ids: monotonic, never reused — take the next from `next:` below, ⊥ from the highest row (rows get pruned)
next: C11 I44 R19 V24
One file rule: >1000 lines → prune stale §V, ⊥ split into more files.
Full rules: /encode-docs skill. Cutting a word that loses a fact ⊥ allowed.
-->

# SPEC

## §G GOAL

SPA forecasts personal account balance across date range → user identifies optimal money market fund deposit timing.

## §C CONSTRAINTS

id|description
|---|---|
C1|React 19 + Vite (Tailwind v4) frontend; ⊥ swap UI framework
C2|Express.js backend; file-based JSON storage in `data/`; ⊥ introduce external DB
C3|Cloudflare Workers/Pages mirror via Hono + KV; ! stay API-compatible with Express routes
C4|Node.js ≥ 20
C5|ES Modules throughout (`"type": "module"`)
C6|IDs ! use `Date.now().toString()`; ⊥ UUID unless explicitly asked
C7|`express-rate-limit` active; ⊥ remove or bypass
C8|Demo mode (`DEMO=true`) → per-session data isolation via `mmmf_demo_session` cookie; ⊥ leak cross-session
C9|i18n: supported languages `en`, `es`, `zht`, `ja`; `lang` cookie overrides server setting
C10|Docker: port 5173, bind mount `/app/data/`, env `TZ` + `DEFAULT_LANGUAGE`

## §I INTERFACES

id|type|shape → output,purpose,condition
|---|---|---|
I1|api|`GET /api/transactions` → `Transaction[]`
I2|api|`POST /api/transactions` body `{date, amount, type, description}` → `Transaction` 201
I3|api|`PUT /api/transactions/:id` → `Transaction`
I4|api|`DELETE /api/transactions/:id` → `{success:true}`
I5|api|`DELETE /api/transactions` → `{success:true}` (clear all, keep recurring)
I6|api|`GET /api/recurring` → `Recurring[]`
I7|api|`POST /api/recurring` body `{name, amount, dayOfMonth, type}` → `Recurring` 201
I8|api|`PUT /api/recurring/:id` → `Recurring`
I9|api|`DELETE /api/recurring/:id` → `{success:true}`
I10|api|`GET /api/credit-cards` → `CreditCard[]`
I11|api|`POST /api/credit-cards` body `{name, dayOfMonth}` → `CreditCard` 201
I12|api|`PUT /api/credit-cards/:id` → `CreditCard`
I13|api|`DELETE /api/credit-cards/:id` → `{success:true}`
I14|api|`GET /api/settings` → `Settings`
I15|api|`PUT /api/settings` body `Settings` → `Settings`
I16|data|`Transaction`: `{ id, date, amount, type:"debit"\|"credit", name, createdAt }` (client forms send `name`, e.g. `TransactionForm.jsx:24`, `RecurringCreditCards` onUse; ⊥ `description`)
I17|data|`Recurring`: `{ id, name, amount, dayOfMonth, type:"debit"\|"credit", createdAt }`
I18|data|`CreditCard`: `{ id, name, dayOfMonth, createdAt }`
I19|data|`Settings`: `{ startingBalance, currentDate, forecastEndDate, currencySymbol, dateFormat, language }`
I20|file|`data/transactions.json` — `Transaction[]`
I21|file|`data/recurring.json` — `Recurring[]`
I22|file|`data/credit-cards.json` — `CreditCard[]`
I23|file|`data/settings.json` — `Settings`
I24|env|`PORT` — Express listen port (default `3600`)
I25|env|`NODE_ENV` — `production` → serve `client/dist/` static + SPA fallback
I26|env|`DEMO` — `"true"` → session-isolated data per cookie
I27|env|`DEFAULT_LANGUAGE` — `en`\|`es`\|`zht`\|`ja` (default `en`); used when no per-session lang set
I28|env|`TZ` — timezone for server date ops
I29|page|`GET /` — SPA entry; loads App.jsx
I30|page|dev: Vite proxies `/api` → `http://localhost:3600/api`
I31|page|prod: Express serves `client/dist/` + `/api` routes
I32|component|`App.jsx` — central state + ∀ API calls; passes callbacks to children
I33|component|`BalanceTimeline.jsx` — forecast table (balance history by date)
I34|component|`BalanceDisplay.jsx` — starting/current/lowest balance display; inline edit
I35|component|`RecurringList.jsx` — recurring debits/credits CRUD; inline edit on click
I36|component|`RecurringCreditCards.jsx` — credit cards + per-cycle payment input; auto-focus amount
I37|component|`TransactionForm.jsx` — one-time transaction entry
I38|component|`ForecastSettings.jsx` — currentDate, forecastEndDate, clear-all
I39|component|`GlobalSettings.jsx` — currency, date format, language, dark mode toggle
I40|component|`DatePicker.jsx` — custom calendar picker (mobile-aware)
I41|component|`api.js` — fetch wrapper; ∀ `/api` calls
I42|component|`utils.js` — `calculateBalance`, `generateRecurringTransactions`, `formatCurrency`, `formatDate`
I43|component|`i18n.js` — `I18nProvider` + `useI18n`; 4 active languages + translations for 20

## §R RESEARCH

id|claim|source
|---|---|---|
R1|`server/hono-app.js:16` uses `app.use("/api/*", cors())` — wildcard, no config; Cloudflare deployment also needs CORS restriction|`server/hono-app.js:16`
R2|Cloudflare Workers serves frontend assets co-located (`wrangler.jsonc`: `assets.directory: ./client/dist`); same origin → `cors()` unnecessary in prod for same-origin clients|`wrangler.jsonc:17`
R3|Express prod: `NODE_ENV=production` → Express serves `client/dist/` from same origin → same-origin; `cors()` can be removed or origin set to `false` for prod|`server/index.js:107`
R4|`.github/workflows/cleanup-ghcr.yml:26` hardcodes `package-name: iclib` — stale name; repo GHCR package is `mmmf`; cleanup never fires against the actual package|`cleanup-ghcr.yml:26`
R5|Dependabot `open-pull-requests-limit: 0` stops version-update PRs; security alerts (scan report on GitHub Security tab) are a separate repo-level setting independent of this file|GitHub Dependabot docs
R6|`TransactionList` imported `App.jsx:11` but ⊥ rendered in JSX (grep: only import line, no `<TransactionList`); `TransactionList.jsx` ⊥ other importer → dead import + dead file|`App.jsx:11`, `client/src/components/TransactionList.jsx`
R7|`DarkModeToggle.jsx` ⊥ imported anywhere (grep: only self def+export); dark-mode toggle logic dup inline `GlobalSettings.jsx:11-39` (state+effect+toggle fn) & `GlobalSettings.jsx:67-113` (svg+switch markup) → dead component + dup logic|`client/src/components/DarkModeToggle.jsx`, `GlobalSettings.jsx:11-113`
R8|submit-button slate clone `bg-slate-600 text-white hover:bg-slate-700 dark:bg-slate-700...` (∉ `.btn*`) @ 5 sites|`RecurringList.jsx:299`, `TransactionForm.jsx:118`, `RecurringCreditCards.jsx:230`, `RecurringCreditCards.jsx:256`, `RecurringCreditCards.jsx:367`
R9|debit/credit type-toggle button pair dup — near-identical, size differs (`py-2 px-3 text-sm` vs `py-2.5 px-4`) → extract parametrized shared|`RecurringList.jsx:272-295`, `TransactionForm.jsx:81-104`
R10|add/cancel header toggle-link clone `text-primary-600 hover:text-primary-700 dark:text-gray-400... text-sm font-medium`|`RecurringList.jsx:223-228`, `RecurringCreditCards.jsx:331-336`
R11|delete-icon-button + trash svg path clone (`p-0.5` w-4 h-4 / `p-1` w-5 h-5) → dedup to shared; all <44px hit area|`RecurringList.jsx:144`, `RecurringCreditCards.jsx:202`, `BalanceTimeline.jsx:71`, `TransactionList.jsx:58` (dead)
R12|touch targets <44px: dark-toggle switch `h-6 w-11`=24px; delete btns ~20-28px; DatePicker nav `p-2`+w-5 h-5 ~36px; DatePicker day cell `h-10`=40px|`GlobalSettings.jsx:98-105`, `DatePicker.jsx:139-166`, `DatePicker.jsx:205`
R13|`App.jsx:357` grid single breakpoint `grid-cols-1 min-[1420px]:grid-cols-[320px_1fr_384px]`; <1420px → 1-col DOM order = BalanceDisplay,ForecastSettings,GlobalSettings → BalanceTimeline → RecurringCreditCards,RecurringList,TransactionForm ∴ timeline buried after 3 settings cards on mobile (SUPERSEDED 2026-07-19: user wants v1.1.4 grid back; layout reorder+2-col tier REVERTED, breakpoint lowered 1420→1100, mobile timeline-after-settings order ACCEPTED by user → V23)|`App.jsx:357-427`
R14|V18 body-h-scroll risk LOW: BalanceTimeline table `minWidth:480px` inside `overflow-x-auto custom-scrollbar -mx-4 sm:mx-0` (contained); DatePicker popup `w-[calc(100vw-2rem)] sm:w-80 max-w-80` fits 360px ∴ main V18 work = layout order + intermediate breakpoint, ⊥ overflow fixes|`BalanceTimeline.jsx:32-35`, `DatePicker.jsx:136`
R15|Hono `cors()` `origin` opt accepts callback `(origin, c) => string\|null`, `c` = req Context; Workers env vars exposed on `c.env`, ⊥ `process.env` (Node global). ∴ `server/hono-app.js:20` `process.env.ALLOWED_ORIGIN` always undefined in Workers → CORS allowlist inert|`server/hono-app.js:20`, `cloudflare/worker.js:15` (`app.fetch(request, env, ctx)`), `server/demo-session.js:142` (`c.env.DEMO`), Hono cors docs
R16|Express `PUT /api/settings` validates `language ∈ {en,es,zht,ja}` & `Number.isFinite(startingBalance)` → 400 `{error:"Invalid settings"}`; Hono mirror `server/hono-app.js:212-216` ⊥ validation → V9/V12 parity gap on Cloudflare|`server/index.js:369-383`, `server/hono-app.js:212-216`
R17|`docker/build-push-action@v5` attaches provenance/SBOM attestations by DEFAULT on push → even single-platform build → OCI image index (manifest list) w/ untagged child manifests (arch image + `unknown/unknown` attestation); release build explicit multi-arch (`platforms: linux/amd64,linux/arm64`) → per-arch children also untagged; only top-level index carries tag, children stored in GHCR as untagged package versions|`.github/workflows/check.yml:59-67`, `.github/workflows/release.yml:79-88`, docker build-push-action provenance docs
R18|`actions/delete-package-versions@v5` ⊥ manifest-aware; `delete-only-untagged-versions:'true'` + `min-versions-to-keep:0` deletes ∀ untagged versions incl. child manifests referenced by tagged index → tagged `:test`/release tags survive but referenced platform manifest gone → `docker pull` → `manifest unknown`; cleanup triggers on `workflow_run` completion of `Check` (builds `:test` ∀ push) → ∀ push guts `:test`; manifest-aware cleaners (e.g. dataaxiom/ghcr-cleanup-action) skip untagged children of tagged indexes|`.github/workflows/cleanup-ghcr.yml:24-32`, `.github/workflows/check.yml`

## §V INVARIANTS

id|invariant definition
|---|---|
V1|∀ API write → ID = `Date.now().toString()` (⊥ UUID)
V2|demo mode (`DEMO=true`) → ∀ read/write scoped to `mmmf_demo_session` cookie value; ⊥ cross-session leak
V3|`express-rate-limit` active on ∀ routes; ⊥ disable or skip
V4|loopback IPs (`127.0.0.1`, `::1`, `::ffff:127.*`) exempt from static rate limiter (health checks)
V5|forecast balance sort order: same-date credits before debits
V6|settings missing fields → defaults applied on `GET /api/settings` (⊥ null returned)
V7|language ∈ `["en","es","zht","ja"]`; invalid → fallback `"en"`; ! consistent server + client
V8|`client/dist/` served as static ∀ `NODE_ENV=production`; ∀ unknown routes → SPA fallback
V9|Hono app (Cloudflare) ! expose same REST API surface as Express; ⊥ new endpoints on one runtime only
V10|∀ JSON file write → `JSON.stringify(data, null, 2)` (pretty-print)
V11|∀ write route → readJsonFile null → 500 JSON error; ⊥ unhandled TypeError
V12|`PUT /api/settings` → language field ! validated ∈ V7 set; startingBalance ! numeric
V13|`client/src/api.js` fetch calls → res.ok check before `.json()`; ⊥ 4xx/5xx silently applied to state
V14|CORS → production deployments ! restrict allowed origins; ⊥ wildcard in production. Express reads allowlist from `process.env.ALLOWED_ORIGIN` (prod → origin=false when unset); Hono reads from `c.env.ALLOWED_ORIGIN` (Workers env binding, ⊥ `process.env`). Both runtimes ! enforce same allowlist semantics (V9 parity)
V15|`release.sh` ⊥ create GitHub Release (CI `release.yml` owns it); ! guard: tag ⊥ exist, `[Unreleased]` ≠ empty, ⊥ push all tags
V16|`cleanup-ghcr.yml` `package-name` ! match actual GHCR package (`mmmf`); ⊥ hardcode stale name; prefer `${{ github.event.repository.name }}`
V17|Dependabot ⊥ auto-open PRs (`open-pull-requests-limit: 0` ∀ ecosystems); scanning/alerts ! remain enabled via repo Security settings
V18|viewport ≤390px → ⊥ horizontal body scroll; wide content (tables) scrolls inside own `overflow-x-auto` container only
V19|∀ discrete tap control (buttons, toggle switches, icon buttons, calendar nav + day cells) → touch target ≥44px on mobile viewport; ! implement via `min-h-11 min-w-11` (44px = Tailwind 11) \| padding yielding ≥44px hit area so greppable; ⊥ visual-only claim. EXCLUDED: dense inline click-to-edit text rows (recurring/card name+amount, balance figures) — per-row 44px min-height bloats list density on mobile ∴ deliberately exempt; `.input`/`.input cursor-pointer` selects governed by `.input` shared class (§V.20), ⊥ V19
V20|buttons/inputs/cards ! use shared `.btn*`/`.input`/`.card` classes from `client/src/index.css`; ⊥ duplicate inline utility clones of existing component classes; ⊥ dead/unused component files; shared logic (e.g. dark-mode toggle) ! single source, ⊥ inline re-implementation
V21|GHCR untagged cleanup ! manifest-aware; ⊥ delete untagged child manifests referenced by tagged multi-arch/attested index (∴ ⊥ orphan tag → `manifest unknown`); `actions/delete-package-versions` ⊥ satisfy → use manifest-aware action (skips children of tagged indexes)
V22|CI job `node-version` (`actions/setup-node`) ! satisfy the max floor of `package.json` `engines.node` (≥24) & any tool run in that job (Wrangler ≥22); ⊥ pin below it; ∴ `Cloudflare_Build_Test` & release both pin `24`
V23|`App.jsx` `<main>` layout ! = v1.1.4 3-col style (`doc/screenshotFull.png`): viewport ≥1100px → `grid grid-cols-1 min-[1100px]:grid-cols-[320px_1fr_384px]` w/ 3 grouped column divs = Left(BalanceDisplay+ForecastSettings+GlobalSettings) \| Center(BalanceTimeline, `min-w-0`) \| Right(RecurringCreditCards+RecurringList+TransactionForm); <1100px → 1-col stack same DOM order; ⊥ intermediate 2-col tier (`lg:grid-cols-2`); ⊥ flat-children col/row-placement reorder. layout revert ! preserve V18 overflow container + V19 touch targets + V20 shared classes (all live in child components, ⊥ `<main>` grid)
