# Repository review — 2026-10-03

Scope: the entire tracked repository, plus every file introduced by this review. Trace inputs, state, persistence and rendering across React, Express and Hono/KV. Improve the durable specification, language/currency selection and UI consistency. Standalone `/review-vibe`; no planning cycle. User clarification: complete and activate all 20 existing language entries.

Baseline: `main` at `0ad2fb4b2bca0a2193094547a4abbe10302d8e80`, clean working tree. All changes in the containing review commit belong to this task. Round 1 covered source inspection and implementation; round 2 covered affected callers, the full owned diff, browser/container verification and documentation reconciliation. Source examination and authorized fixes are complete, with the explicit limits below.

## Coverage

“Reviewed” means the source and its relevant callers were inspected; tests provide additional evidence, not a substitute for inspection.

| Section | Paths and surfaces | State / evidence |
|---|---|---|
| API and persistence | All `server/*.js`, `shared/dates.js`, `shared/preferences.js`; CRUD, validation, errors, IDs, origin checks, isolation, limits, concurrency and corruption recovery | Reviewed. Shared API service traced through both adapters. Node regressions cover contracts, metadata protection, invalid/oversized bodies, corrupt JSON/records, cookies, limits and concurrent file mutations. |
| Forecast and application state | `client/src/App.jsx`, `api.js`, `utils.js`; initialization, save queue, partial failures, recurring generation, card scheduling, range boundaries, amount/date formatting | Reviewed. Node cases cover three timezones, leap months, DST, range limits, same-day ordering and card links. Browser checks cover successful/failed mutations, drafts, retry, clear preservation and inline editing. Development browser verifies same-origin proxy writes and StrictMode session initialization. |
| UI and accessibility | All 12 current `client/src/components/*`, `index.css`, `main.jsx`, `client/index.html`; every component, keyboard/focus, labels, pending/error/empty/success states, theme and responsive layout | Reviewed. Playwright covers selectors, calendar, forms, inline controls, 320px calendar and all 20 languages at 390px in both themes. Desktop populated/mobile screenshots inspected. Final checks include RTL switch geometry and calendar errors exposed inside the active dialog. |
| Localization | Entire original `i18n.js` catalogs; new `translations.js`, all nine `locales/*.json` language catalogs, `locales/messages.json`, shared registry and formatting consumers | Reviewed. Every active catalog has every English key; interpolation checked. Existing English placeholders replaced; equal-text scan leaves only legitimate shared words/technical values. Native/English language search, localized currency names, valid root lang and Arabic direction verified. Native-speaker editorial certification is not claimed. |
| Deployment | `cloudflare/worker.js`, moved `functions/api/[[route]].js`, both Wrangler configs, `Dockerfile`, `docker-compose.yml`, `.dockerignore` | Reviewed. Imports/routing/assets/storage bindings traced. Worker dry-run, Pages Functions bundle, Docker build and disposable production-container API/static/session smoke checks pass. No live deployment performed. |
| Development and release tooling | `start.sh`, `release.sh`, `client/vite.config.js`, `client/postcss.config.cjs`, removed `client/tailwind.config.js`, package scripts | Reviewed. Node floor, process cleanup, proxy origins, source consumers and release guards inspected. Bash syntax and ShellCheck pass; frontend build passes. Release/push/tag operations were not executed. |
| Dependencies and CI | `package.json`, every lockfile entry, `.github/workflows/{check,release,cleanup-ghcr}.yml`, `.github/dependabot.yml`, `.gitignore` | Reviewed. Manifest/lock consistency and registry/integrity metadata checked. Audit findings resolved with compatible updates; unused direct dependencies removed after consumer searches. CI now runs real regression/build checks. Cleanup manifest retention and repository package targeting inspected. Live GitHub permissions/settings are outside the local repository. |
| Documentation and repository guidance | `SPEC.md`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `CHANGELOG.md`, `LICENSE.md`, `.github/{CONTRIBUTING.md,SECURITY.md,FUNDING.yml}`, this ledger | Reviewed. Spec compared with implementation and user intent, stable IDs/counters preserved, superseded one-time findings removed. Paths, supported languages, trust/storage boundaries and available checks reconciled. Spec table structure, unique IDs, counters and references validated. |
| Static assets | `client/public/{favicon.svg,icon.svg,icon-500.png,icon-500.psd}`, `doc/{demo.gif,screenshot.png,screenshotFull.png}` | Reviewed as non-executable assets: SVG contents, binary signatures, references and build consumers inspected; baseline screenshot visually inspected. Original artwork preserved. Pixel-level PSD/GIF editing is not a code-review surface. |

No tracked code/configuration area remains unexamined. Generated bundles were build-checked; vendored `node_modules` was assessed through package metadata/audit, not a line-by-line upstream source audit. Real finance files, external account configuration and deployed infrastructure were not inspected or mutated. No BACKLOG was ingested.

## Findings and disposition

- **Fixed — isolation/rate limits:** Express API routes previously ran without the intended API/demo middleware. Every API request now uses the limiter and validated session storage; Hono receives body/rate controls. Demo loads establish one cookie before concurrent requests; expiry, malformed cookies and cleanup pagination are covered.
- **Fixed — data loss and validation:** read/modify/write races, overwritten IDs/timestamps, invalid fields and silent corrupt-storage defaults are replaced by shared validation, protected metadata, partial settings merges, serialized atomic file replacement and explicit errors. Corrupt source files remain intact.
- **Fixed — forecast behavior:** local dates no longer shift through UTC conversion; out-of-range transactions are excluded; recurring suppression includes transaction type; monthly dates clamp correctly; card payments include the start day and older unpaid gaps. New payments carry stable card IDs.
- **Fixed — misleading save behavior:** committed state and form resets now follow successful responses. Failed requests retain drafts, show errors and allow retries; failed initial loads cannot masquerade as empty accounts. Clear-all applies completed steps even if its later date reset fails.
- **Completed — localization and scalable selection:** all 20 catalog entries are translated and active. Shared searchable comboboxes replace long native lists; currency options use the runtime catalog (162 in this environment), retain codes/symbols/names and use currency-specific precision. Keyboard commit/cancel, search normalization, no-results feedback and bounded scrolling are verified.
- **Fixed — accessibility and consistency:** labeled inputs, keyboard-editable inline values, visible focus, 44px discrete targets, modal calendar navigation/focus restoration, in-dialog save errors and RTL theme-switch geometry. Shared controls and CSS own repeated behavior.
- **Fixed — deployment/tooling:** Worker asset binding and API routing, root Pages discovery/imports, Docker shared modules, Vite same-origin proxy, Node 24 startup/cleanup, Docker metadata flavor syntax and actual CI build/test commands. Removed unused dependencies and inactive/conflicting Tailwind/native-date styles after checking consumers.
- **Completed — durable documentation:** expanded SPEC covers architecture/module ownership, API/data shapes, forecast semantics, UI states/interactions, localization/currency extension gates, storage/trust limits and verification. README/contribution guidance and Unreleased changelog match the final implementation.

## Remaining limits

1. `server/hono-app.js` / `kvStore`: KV remains eventually consistent, rate-limited per key and non-transactional across Worker isolates. Concurrent writers can lose updates; rapid saves can fail. Local serialization cannot solve those platform guarantees. SPEC explicitly records the limitation; a stronger storage architecture remains a separate design decision. File storage similarly assumes one server process per data directory.
2. `client/src/utils.js` / `nextCardDate`: historical payments without `creditCardId` can only match the current card name. Same-name cards and historical renames remain ambiguous; new linked payments are fixed, and no guessed migration rewrites old records.
3. Complete translations and browser behavior are verified; independent native-language editorial review was not performed. Chromium verification does not claim exhaustive browser/assistive-technology coverage.
4. No built-in account authentication exists outside demo mode; this remains a single-account application requiring protected deployment. External authentication settings, distributed edge limits and live Cloudflare/GitHub behavior were not changed or certified by local checks.

## Verification evidence

| Check | Result |
|---|---|
| `npm test` | PASS — 22 Node tests: Express/Hono contract, defaults, validation, sessions, corruption, body/rate limits, local write concurrency, cleanup, Worker routing, date/forecast/card/currency/catalog boundaries. |
| `npm run test:ui` | PASS — 8 Chromium tests, using `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for the installed browser. Includes all 20 languages and both themes; failure/retry, calendar accessibility, selector persistence, precision, inline edits and clear preservation. |
| Development Vite browser smoke | PASS — create/reload through `:5173` proxy, one settings initialization under StrictMode, accessible form labels, no page errors. |
| `npm run build` | PASS — final frontend also built by the browser harness and Docker; 58 modules, about 311 kB JS / 96 kB gzip. |
| `npm run build:worker` | PASS — local Wrangler dry-run, API module bundled, KV/ASSETS bindings recognized; no deployment. |
| `npm run build:pages` | PASS — root Pages Functions bundle compiled. |
| `docker build -t mmmf-review:local .` | PASS — Node 24 Alpine production image. Disposable container smoke passes transaction create/read access, separate demo sessions, root HTML/JS assets and health endpoint; test container removed. |
| `bash -n start.sh release.sh` / `shellcheck start.sh release.sh` | PASS. No release side effects executed. |
| `npm audit` | PASS — 0 vulnerabilities. Initial result was 5 (4 high, 1 moderate) involving `ip-address`, `miniflare`, `sharp`, `undici`, `wrangler`; compatible lock updates resolve them. |
| Manifest/lock metadata and SPEC structural checks | PASS — dependencies/registry URLs/integrities, 112 unique spec rows, monotonic counters and valid references. |
| `git -c core.whitespace=cr-at-eol diff --check` | PASS — original per-file CRLF conventions preserved; plain Git whitespace checking treats those existing line endings as trailing whitespace. |
| JavaScript lint | Unavailable: repository has no separate JS lint configuration/script. Build, behavioral tests and source review provide the recorded checks. |

Environment limits resolved during verification: initial sandbox install DNS (`EAI_AGAIN`) and listener (`EPERM`) restrictions were rerun with approved tool permissions. Browser MCP expected absent `/opt/google/chrome/chrome`; the repository Playwright suite used installed Chromium instead. An ad-hoc Arabic calendar probe used a stale translated label and timed out; the committed calendar regression uses the actual accessible contract and passes. No product failure is inferred from that locator error.

## Research

Primary sources checked 2026-10-03: [WAI-ARIA combobox behavior](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), [Intl currency catalogs](https://tc39.es/ecma402/#sec-intl.supportedvaluesof), [KV writes/expiry](https://developers.cloudflare.com/kv/api/write-key-value-pairs/), [KV consistency](https://developers.cloudflare.com/kv/concepts/how-kv-works/), [Worker asset bindings](https://developers.cloudflare.com/workers/static-assets/binding/), [Pages discovery](https://developers.cloudflare.com/pages/functions/get-started/), [Docker metadata flavor syntax](https://github.com/docker/metadata-action#flavor-input). Dependency security evidence came from npm audit and the upstream advisory records; no demonstrated production exploit is claimed for build-tool dependencies.

## Closure

Entire scoped repository examination complete; implemented fixes and final checks complete. No remaining review section or verification prerequisite. Remaining design/editorial/platform limits are listed above. Final reconciliation caught an invalid-language fallback differing from the retained spec; the shared service and adapter regressions now distinguish invalid stored language (English) from a missing preference (configured default). Both adapter tests and the frontend/Worker/Pages/container builds passed after that correction. Local/container CSS outputs were compared: the container has four additional generic selectors, with no missing application selectors. Temporary review servers and the smoke container were stopped. Next action: none within this review; the containing summary commit closes the requested work. No push, tag or deployment.
