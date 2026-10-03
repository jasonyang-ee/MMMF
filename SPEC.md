<!-- SPEC FORMAT (baked by /encode-docs — keep; makes this file self-describing)
Sections: §G goal | §C constraints | §I interfaces | §R research? | §V invariants.
Symbols: → leads to | ∴ therefore | ∀ every | ∃ exists | ! required | ? unknown/optional | ⊥ forbidden/absent | ≠ differs | ∈ member | ∉ not member | ≤ at most | ≥ at least | & and | § section.
Durable truth only. Add sparingly; correct/prune on evidence. A violated requirement is not automatically obsolete.
Address V2 as §V.2. Never renumber or reuse ids; allocate from next counters, then advance them. Deletion leaves counters unchanged.
Preserve literals, conditions, negation, uncertainty, quantities, and requirement strength.
Tables: header + delimiter row, matching columns; escape literal pipes. Empty cell = -.
next: C14 I61 R24 V35
Keep one file; prune stale/redundant facts without losing live requirements.
Full rules: /encode-docs. Compression must preserve meaning.
-->

# SPEC

## §G GOAL

MMMF (Max Money Market Funds): personal account-balance forecasting SPA. User chooses starting balance and an inclusive date range, adds income/payments, and identifies the lowest projected balance and potential money-market-fund deposit timing.

Keep behavior and visual patterns consistent across components, languages, currencies, desktop and mobile. Expand localization through a shared language registry, complete translation catalogs and reusable searchable selection controls. Currency selection changes presentation and input precision; ⊥ exchange-rate conversion, bank integration, interest calculation or investment execution.

## §C CONSTRAINTS

id|description
|---|---|
C1|React 19 + Vite + Tailwind v4 frontend; ⊥ swap UI framework
C2|Express backend; file-based JSON storage under `data/` by default; ⊥ introduce external DB without explicit authority
C3|Cloudflare Workers/Pages mirror via Hono + KV; same REST operations, validation, defaults and JSON response shapes. Storage consistency differs (§I.47)
C4|Node.js ≥24 for development, tests, build and Express; Docker uses Node 24 Alpine
C5|ES Modules throughout (`"type":"module"`); client build configuration inside `client/`
C6|Persisted transaction, recurring-template and credit-card IDs ! originate from `Date.now().toString()`; ⊥ UUID. Demo session tokens are separate random credentials
C7|`express-rate-limit` active on API and static routes; ⊥ remove or bypass
C8|`DEMO=true` → per-session data isolation via `mmmf_demo_session` cookie; ⊥ cross-session access
C9|Active language IDs: `en`, `es`, `zht`, `ja`, `zhs`, `ko`, `de`, `fr`, `pt`, `it`, `ru`, `ar`, `hi`, `th`, `vi`, `id`, `ms`, `nl`, `pl`, `tr`. `shared/preferences.js` owns names, native names, BCP 47 locales and direction. Valid `lang` cookie overrides saved language in that browser
C10|Docker: port `5173`, persistence mount `/app/data/`, `TZ` and `DEFAULT_LANGUAGE` supported; Node default port `3600`
C11|Single shared account outside demo mode; no built-in login, user roles or bank credentials. Private deployment ! protected by trusted network/authenticated reverse proxy or Cloudflare Access; CORS is not authentication
C12|One display currency for the whole account. `currencySymbol` stores an uppercase three-letter currency code, not a literal symbol. Values remain finite JavaScript numbers; this is a forecast, not a decimal accounting ledger
C13|Future languages ! complete catalogs, stable persisted ID, valid locale/direction and verification of labels, dates, numbers, search, mobile wrapping and keyboard behavior. ⊥ advertise absent catalogs as supported; native-language editorial review remains distinct from structural completeness

## §I INTERFACES

id|type|shape → output, purpose, condition
|---|---|---|
I1|api|`GET /api/transactions` → persisted `Transaction[]`; generated monthly occurrences are client-only
I2|api|`POST /api/transactions` body `{name,date,amount,type,creditCardId?}` → `Transaction`, 201
I3|api|`PUT /api/transactions/:id` body mutable-field patch → `Transaction`, 200; unknown ID → 404
I4|api|`DELETE /api/transactions/:id` → `{success:true}`; absent ID is an idempotent success
I5|api|`DELETE /api/transactions` → `{success:true}`; clears manual transactions only
I6|api|`GET /api/recurring` → `Recurring[]`
I7|api|`POST /api/recurring` body `{name,amount,dayOfMonth,type}` → `Recurring`, 201
I8|api|`PUT /api/recurring/:id` mutable-field patch → `Recurring`, 200; unknown ID → 404
I9|api|`DELETE /api/recurring/:id` → `{success:true}`; absent ID succeeds
I10|api|`GET /api/credit-cards` → `CreditCard[]`
I11|api|`POST /api/credit-cards` body `{name,dayOfMonth}` → `CreditCard`, 201
I12|api|`PUT /api/credit-cards/:id` mutable-field patch → `CreditCard`, 200; unknown ID → 404
I13|api|`DELETE /api/credit-cards/:id` → `{success:true}`; existing payment transactions remain
I14|api|`GET /api/settings` → complete `Settings`; missing/invalid individual saved settings use safe defaults (language fallback §V.7)
I15|api|`PUT /api/settings` full settings or partial known-field patch → merged complete `Settings`; invalid provided values → 400
I16|data|`Transaction`: `{id:string,name:string,date:"YYYY-MM-DD",amount:number,type:"debit"\|"credit",createdAt:ISO-timestamp,creditCardId?:string}`. `name` trimmed, 1–200 characters; `amount` finite and >0; `date` valid Gregorian calendar day; optional card ID decimal digits
I17|data|`Recurring`: `{id,name,amount,type,dayOfMonth,createdAt}`; name/amount/type as §I.16; integer `dayOfMonth` ∈1–31
I18|data|`CreditCard`: `{id,name,dayOfMonth,createdAt}`; monthly payment template, not a stored card number. Name as §I.16; integer day ∈1–31
I19|data|`Settings`: `{startingBalance,currentDate,forecastEndDate,currencySymbol,dateFormat,language}`. Balance finite (may be negative); valid dates with end ≥ start; date format ∈`MMM dd, yyyy`, `yyyy/MM/dd`, `MM/dd/yyyy`; language ∈§C.9; currency code per §C.12
I20|file|`data/transactions.json` → `Transaction[]`
I21|file|`data/recurring.json` → `Recurring[]`
I22|file|`data/credit-cards.json` → `CreditCard[]`
I23|file|`data/settings.json` → `Settings`; missing collection files read as `[]`; missing settings file reads as defaults; first mutation creates needed paths
I24|env|`PORT`: Express port, default `3600`; Vite development proxy targets `3600`
I25|env|`NODE_ENV=production`: production Express mode/logging; built `client/dist/` served with SPA fallback; development also allows built-file fallback
I26|env|`DEMO="true"`: isolate API storage by session; any other value → shared single account
I27|env|`DEFAULT_LANGUAGE`: any active ID from §C.9, fallback `en`; consistent Express/Hono defaults
I28|env|`TZ`: Node local date/default calculations; Workers use their runtime timezone (normally UTC). Calendar-date strings remain unchanged across client timezones
I29|page|`client/index.html` → `client/src/main.jsx` → React StrictMode → `App.jsx`; title `MMMF`, public favicon and branding assets
I30|page|Development: Vite `:5173`, relative `/api` proxied to `http://localhost:3600`; browser cookies remain same-origin
I31|page|Production: Express serves API + built assets. Worker routes `/api` and `/api/*` to Hono, other paths to `ASSETS`; assets configured for SPA fallback. Pages discovers root `functions/api/[[route]].js`, static files from `client/dist/`
I32|component|`App.jsx`: owns fetched settings/entities, visible language, load/error/pending states and API mutations; derives recurrence, timeline, final and minimum balances; children receive callbacks. Mutations queued; state applied after success
I33|component|`BalanceTimeline.jsx`: initial-balance row + chronological forecast rows; description, signed amount, running balance, date, delete control for manual rows and Auto marker for generated rows; overflow stays inside table container
I34|component|`BalanceDisplay.jsx`: starting, forecasted, net-change and lowest balances; lowest date. Starting balance supports focus/select inline editing; Enter/blur save, Escape cancel
I35|component|`RecurringList.jsx`: reveal/cancel add form; name/amount/type/day validation; inline name/amount editing; delete template; empty-state guidance. Generated transactions are recomputed after changes
I36|component|`RecurringCreditCards.jsx`: card CRUD and inline names; earliest unpaid monthly date in forecast, including start day; opening payment form focuses amount. Save adds a debit with `creditCardId`; no date → disabled payment action
I37|component|`TransactionForm.jsx`: description, positive amount, type and date; default date = browser local today; reset only after successful creation
I38|component|`ForecastSettings.jsx`: start/end selection, +30/+60/+90 calendar-day shortcuts, days-in-range text, destructive clear confirmation. Moving start past end advances end to start+30. Clear keeps starting balance, recurring templates and cards; then resets dates to today/today+30 through a separate settings write
I39|component|`GlobalSettings.jsx`: language and currency search selectors, native three-option date-format select, named dark-mode switch. Dark preference in localStorage; initial fallback to system preference; storage failure does not crash UI
I40|component|`DatePicker.jsx`: labeled button + native modal dialog containing Gregorian calendar grid. Localized month/week/day labels; minimum date; month navigation; Today/Cancel; arrows, Home/End, PageUp/PageDown; Escape closes; browser restores trigger focus
I41|component|`api.js`: relative `/api` fetch wrapper; checks `res.ok` before parsing success; errors propagate to App; GET and mutation paths shared by runtimes
I42|module|`utils.js`: forecast/recurrence/card scheduling, localized currency/date formatting, currency input step; `shared/dates.js`: parse, local day, add calendar days, clamped monthly dates
I43|module|`i18n.js`: React provider/context and root `lang`/`dir`; `translations.js`: original 11 catalogs plus nine JSON catalogs in `locales/`, common additions from `locales/messages.json`; all 20 active and structurally complete
I44|api|JSON body ≤100 KiB; successful reads/updates/deletes 200, creates 201; invalid input/JSON 400, disallowed Origin 403, unknown API route/item 404, oversized body 413, rate limit 429, storage failure 500. Errors `{error:string}`; API replies not cached. Entity writes whitelist mutable fields and ignore caller IDs/timestamps
I45|module|`server/index.js`: executable entry; `server/app.js`: Express middleware/routes/static/error handling; `server/dataService.js`: shared API defaults/validation/mutations; `server/hono-app.js`: Hono routes and KV adapter; `server/demo-session.js`: session parsing/expiry and legacy KV cleanup
I46|storage|`fileStoreService.js`: per-file process-local read/modify/write queue; pretty JSON → same-directory temporary file → fsync → rename. Reads see complete old or new files. Malformed existing JSON is preserved and reported, not replaced with empty data. No cross-process lock or multi-file transaction
I47|storage|KV keys: `transactions`, `recurring`, `credit-cards`, `settings`; demo prefix `<sessionId>:`. Mutations serialize within one isolate only. KV eventual consistency, concurrent writers in different isolates and per-key write-rate limits can cause stale reads, lost updates or failed saves; ⊥ promise transactional/multi-user financial durability. Stronger guarantees require an explicitly approved storage redesign
I48|data|Shared language registry separates persisted IDs (`zht`, `zhs`) from locale tags (`zh-Hant`, `zh-Hans`); Arabic `dir=rtl`, others `ltr`. Catalog lookup: selected language → English key fallback → key string only for unknown keys. Functions and `{0}` interpolation supported
I49|component|`SearchSelect.jsx`: labeled editable combobox, portaled bounded listbox (≤300px), selected checkmark, descriptions, case/diacritic-insensitive search across label/name/code/aliases. Arrows navigate; Enter commits; Escape, Tab and outside pointer close without changing value. Unknown text never saved; no matches announced; selected item remains available
I50|data|Currency options from `Intl.supportedValuesOf("currency")`, localized/English names from `Intl.DisplayNames`, symbols from `Intl.NumberFormat`; retained saved code included across ICU-version differences. Older runtimes without catalog enumeration retain the legacy 11-code fallback. Codes disambiguate shared symbols such as `$` and `¥`
I51|flow|Startup: GET settings establishes demo cookie before parallel entity reads; StrictMode reuses the initial load. Failure → localized error and Retry, no empty editable account. Language cookie affects browser display without a background settings write
I52|style|`index.css` owns red primary palette, neutral/slate actions, `.card`, `.input`, `.label`, `.btn*`, balance semantic colors, dark classes, scrollbars and focus outlines. `DeleteButton` and `TypeToggle` own their shared control behavior; toggles expose state, icon controls have names
I53|storage|Demo files: `<DATA_DIR>/sessions/<validated-sessionId>/<entity>.json`; session ID `demo_<16 random characters>_<timestamp>`. Cookie HttpOnly, SameSite=Strict, Path=/, 5-day max age, Secure on HTTPS. Invalid/expired/future/malformed tokens rotate. No default shared-account data copied into a demo
I54|env|`DATA_DIR`: optional Express storage root for deployment/testing; default repository `data/`. `ALLOWED_ORIGIN`: one exact allowed cross-origin API origin; unconfigured cross-origin requests rejected; trusted proxy must preserve Host or supply explicit origin configuration
I55|operations|`start.sh`: Node ≥24, locked install when dependencies absent, build, Express+Vite, cleanup on failure/signals. `release.sh`: guarded version/changelog commit and one-tag push; only run release with explicit authority. No application-side telemetry service
I56|flow|Starting balance is balance at forecast start, before that day's entries. Include manual/generated transactions only in inclusive `[currentDate,forecastEndDate]`; chronological order, credits before debits on a day, stable same-type order. `currentBalance` means final forecasted balance; net = final−start; minimum includes initial row and retains earliest tie
I57|flow|Monthly occurrence day clamps to month's final day; one generated occurrence per template/month within range. Manual transaction suppresses occurrence only when date, name, numeric amount and type all match. Generated rows are never persisted or individually deleted
I58|flow|Card occurrence uses stable `creditCardId` for new payments; legacy transactions without ID match current card name and debit type. Existing future payments do not skip earlier gaps. Legacy same-name cards/renames remain ambiguous without explicit association; ⊥ guess a historical migration
I59|verification|`npm test`: Node regressions for date/timezone boundaries, catalogs, API parity, sessions, storage and concurrency. `npm run test:ui`: Playwright interaction, failure recovery and multilingual mobile checks using disposable demo data. `npm run build`, `npm run build:worker`, `npm run build:pages`; `bash -n start.sh release.sh`, `shellcheck start.sh release.sh`; dependency audit and Docker smoke checks for relevant changes. No separate JS lint configuration
I60|deployment|`Dockerfile` includes built frontend, production dependencies, `server/` and `shared/`; curl health check on `/`. `wrangler.jsonc` = Workers, `wrangler.pages.jsonc` = Pages. `.github/workflows/check.yml` builds/tests images and validates frontend/Cloudflare; `release.yml` publishes images/releases; `cleanup-ghcr.yml` manifest-aware cleanup. `.github/dependabot.yml` controls version PRs; security alerts remain repository settings

## §R RESEARCH

id|claim|source
|---|---|---|
R19|Editable combobox requires named input/listbox, expanded state, focus tracking and keyboard commit/cancel; active suggestion may differ from committed choice. Checked 2026-10-03|[WAI-ARIA APG combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
R20|Intl provides runtime-dependent canonical currency catalog, localized display names and currency-specific fraction digits; ⊥ hardcode a globally exhaustive symbol list. Checked 2026-10-03|[ECMA-402](https://tc39.es/ecma402/#sec-intl.supportedvaluesof)
R21|KV is eventually consistent; same-key concurrent writes can overwrite; maximum same-key write frequency one per second; expiry must be ≥60 seconds ahead. Checked 2026-10-03|[KV writes](https://developers.cloudflare.com/kv/api/write-key-value-pairs/), [consistency](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
R22|Workers static assets use explicit binding and SPA fallback; API routes must run Worker before fallback. Checked 2026-10-03|[Workers asset bindings](https://developers.cloudflare.com/workers/static-assets/binding/)
R23|Pages Functions discovered from root `functions/`, separate from static build output. Checked 2026-10-03|[Pages Functions setup](https://developers.cloudflare.com/pages/functions/get-started/)

## §V INVARIANTS

id|invariant definition
|---|---|
V1|New persisted entity ID = `Date.now().toString()`; unique within collection; updates preserve ID and createdAt; client-supplied metadata never overrides server values
V2|Demo reads and writes ! scoped to validated `mmmf_demo_session`; no shared-account fallback or data copied between sessions
V3|Express API rate limit 300 requests/IP/minute; static limit 50 requests/IP/second; both active before their handlers. Hono provides equivalent per-isolate API limit; distributed Cloudflare limits require edge configuration
V4|Loopback (`127.*`, `::1`, IPv4-mapped loopback) exempt only from static limiter for health checks; API limiter still applies
V5|Same-date forecast credits precede debits; pre-start and post-end transactions excluded
V6|GET settings returns complete safe defaults: balance 0, server-local today, currentDate+30 days, USD, `MMM dd, yyyy`, valid DEFAULT_LANGUAGE or en; individual missing fields completed; malformed stored document → 500
V7|Language validation ! use shared active registry (§C.9). Invalid stored language → en; missing stored language → valid DEFAULT_LANGUAGE or en; invalid browser cookie ignored; invalid API write → 400
V8|`client/dist/` served by Express; non-API navigation → SPA fallback; unknown API route → JSON 404, ⊥ HTML success
V9|Express and Hono expose the same REST surface and observable validation/default/error contract; adapter durability limitations remain explicit (§I.46–47)
V10|JSON file writes ! `JSON.stringify(data, null, 2)`; atomic replacement, no in-place truncation
V11|Unreadable/malformed storage → JSON 500; ⊥ silent empty-data success or destructive overwrite
V12|Settings writes validate every supplied known field, merge with stored defaults, reject invalid dates/range, language, currency syntax, format and non-finite/non-numeric balance; ⊥ lost independent fields from partial saves
V13|API wrapper checks success before JSON state application; failures visible; editable drafts retained; no false success/reset
V14|Production origins ! restricted; no wildcard. Express reads `process.env.ALLOWED_ORIGIN`, Hono reads `c.env.ALLOWED_ORIGIN`; same-origin clients work; foreign Origin requests rejected before writes
V15|`release.sh` ⊥ create GitHub Release (CI owns it); guards absent target tag and nonempty `[Unreleased]`; ⊥ push all tags
V16|GHCR cleanup package derives from `${{ github.event.repository.name }}`, never stale hardcoded package
V17|Dependabot version PR limit 0 for all ecosystems; security scanning/alerts remain enabled through repository settings
V18|Viewport ≤390px → no horizontal body scroll; wide tables scroll within their own container; popups remain inside viewport
V19|Discrete buttons/switches/icon controls/calendar nav/day cells ! ≥44px mobile target through shared minimum size or equivalent padding. Dense inline text editing exempt from minimum dimensions, but ! keyboard accessible; inputs/search fields use shared `.input`
V20|Buttons/inputs/cards reuse `.btn*`/`.input`/`.card`; shared control logic one source; ⊥ dead component files or duplicated utility clones. New states ! support light/dark themes and visible keyboard focus
V21|GHCR cleanup ! manifest-aware; preserve untagged platform/attestation children referenced by tagged image indexes; never orphan a tagged image
V22|CI Node floor ! satisfy package engines and invoked tools; Node 24 for JS/Cloudflare/release jobs
V23|Main layout retains three grouped columns at ≥1100px: `320px 1fr 384px` = left balances/settings, center timeline (`min-w-0`), right cards/recurring/entry. Below 1100px, same DOM order in one column; no intermediate two-column tier; preserve overflow and touch behavior. RTL mirrors reading direction
V24|Date-only calculations use calendar-day operations, not ISO UTC conversion of local midnights; month-end/leap-year/DST behavior consistent
V25|Language/currency selectors share search/listbox implementation; results scroll within bounded popup; selection changes only on explicit commit; no-results/cancel never overwrites persisted value
V26|All active catalogs contain every English key, including validation, loading/error, selector and calendar labels; root lang uses BCP 47 locale, Arabic sets rtl. Currency/date formatting follows selected language; numeric date patterns retain their requested order and Gregorian years
V27|Currency changes do not convert or rewrite amounts; formatter and amount-input step honor currency fraction digits (e.g. JPY 0, USD 2, KWD 3). Saved code remains selectable across runtime catalog differences
V28|Initial load ! complete before editing; demo cookie established before concurrent entity loads; loading and failure states visible and retryable
V29|Mutations ! wait for successful API response before committed state/form reset; pending prevents repeated form submissions. Inline editing: focus/select, Enter/blur save once, Escape cancels, failed save keeps draft
V30|Clear-all requires localized confirmation; remove only manual transactions, preserve recurring/cards/balance; apply completed steps to UI even if later date reset fails. No claim of atomicity across collection/settings writes
V31|Recurring/payment scheduling includes forecast boundaries, clamps days 29–31, and preserves older unpaid gaps. Card IDs distinguish new payments after renames
V32|No unsanitized HTML injection, script evaluation or user-controlled storage paths; React renders names as text; session tokens validated before directory/key construction
V33|Demo expiry: five days from session creation; new KV values expire automatically (minimum API TTL may retain storage ≤60 seconds beyond unusable session); legacy cleanup paginates; local expired directories cleaned opportunistically at most daily
V34|Regression verification uses disposable data, never user finance files; no deployment, push, tag or release during ordinary review without explicit authority
