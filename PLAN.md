# PLAN

goal: Hono runtime = Express parity — validate `PUT /api/settings` + fix inert CORS allowlist (V9/V12/V14).

## ground rules
- smallest codebase-consistent change; ⊥ scope creep beyond `server/hono-app.js` + AGENTS.md doc.
- verify-first: oracle = `npm run build` green (⊥ test runner, T12 todo). Reason edge cases by hand.
- mirror Express semantics exactly ∴ ⊥ drift between runtimes (V9).
- ∀ phase ends green + self-reviewed + committed w/ named evidence. ⊥ Claude co-author trailer.
- close: flip §T, update CHANGELOG `[Unreleased]`, refresh HANDOFF.

## existing assets
- Express `PUT /api/settings` validation = truth to mirror: `server/index.js:369-383` (`!["en","es","zht","ja"].includes(language) || !Number.isFinite(startingBalance)` → 400 `{error:"Invalid settings"}`).
- Hono handler to fix: `server/hono-app.js:212-216` (⊥ validation) + `:16-22` CORS (`process.env.ALLOWED_ORIGIN`, inert in Workers per R15).
- Hono cors origin callback = `(origin, c)` → read `c.env.ALLOWED_ORIGIN` (R15).
- Worker passes env: `cloudflare/worker.js:15` `app.fetch(request, env, ctx)` → `c.env`.
- client always sends valid full settings ∴ fix ⊥ breaks live UI (App.jsx handlers, BalanceDisplay.jsx:27 `parseFloat||0`).
- AGENTS.md:20,22 stale — lists removed `DarkModeToggle` + `TransactionList`.

## phase order
id|goal|depends|exit
F1|research: confirm Hono cors callback sig + c.env binding + Express validation semantics|-|R15/R16 confirmed, F2 steps locked
F2|impl Hono parity fixes + AGENTS.md doc|F1|build green, both fixes in, diff self-reviewed
F3|final verify code vs §V9/V12/V14|F2|build green, invariants classified HOLD w/ evidence, CHANGELOG updated

## F1 research
task: T27
goal: lock exact fix shape before editing Hono.
inputs: `server/hono-app.js`, `server/index.js:369-383`, `cloudflare/worker.js`, Hono cors docs, §R15/R16.
steps:
1. confirm Hono `cors({origin})` callback signature receives `(origin, c)` & returning `null` blocks, returning `origin` string allows (Hono version `^4.11.4` per package.json).
2. confirm `c.env.ALLOWED_ORIGIN` is the correct binding path (wrangler.jsonc `vars` — note ALLOWED_ORIGIN ⊥ currently defined; fix ! still safe when unset → block cross-origin, same-origin unaffected).
3. transcribe Express validation predicate verbatim as the mirror target.
verify: F2 step list matches Express semantics 1:1; ⊥ open `?`.
exit: research logged (already in §R15/R16); proceed.
next: F2

## F2 implement
task: T28
goal: bring Hono to parity + fix stale doc.
inputs: F1 findings; `server/hono-app.js`, `AGENTS.md`.
files: `server/hono-app.js`, `AGENTS.md`, `CHANGELOG.md`.
steps:
1. `hono-app.js` `PUT /api/settings`: after `const body = await c.req.json()`, validate `!["en","es","zht","ja"].includes(body.language) || !Number.isFinite(body.startingBalance)` → `return c.json({ error: "Invalid settings" }, 400)` before save. Match Express msg+status exactly (V9,V12).
2. `hono-app.js` CORS `:16-22`: change origin callback to `(origin, c) => (c.env.ALLOWED_ORIGIN === origin ? origin : null)` (V14). Keep block-when-unset behavior.
3. `AGENTS.md:20,22`: drop `DarkModeToggle` + `TransactionList` from component list; add `DeleteButton`, `TypeToggle` (real current components).
4. update `CHANGELOG.md` `[Unreleased]` → Fixed: Hono settings validation parity + CORS env binding.
verify: `npm run build` green; manual trace — valid settings body passes, invalid language/NaN balance → 400; same-origin request unaffected by CORS change.
exit: both fixes + doc landed, build green, self-reviewed diff.
next: F3

## F3 final verify
task: T29
goal: prove parity, ⊥ drift.
inputs: touched files, §V9/V12/V14, §I Data Shapes.
steps:
1. re-read §V9, §V12, §V14 + §R15/R16.
2. run `npm run build` → record result.
3. diff Hono vs Express `PUT /api/settings` — confirm identical predicate + status + body.
4. confirm CORS origin now reads `c.env`; ⊥ residual `process.env` in Hono request path.
5. classify V9/V12/V14 = HOLD | VIOLATE | UNVERIFIABLE w/ file evidence; record table in HANDOFF.
verify: build green + all three invariants HOLD w/ cited evidence.
exit: cycle done → ready for /garnish.
next: -
