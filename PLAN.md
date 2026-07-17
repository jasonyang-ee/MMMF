# PLAN

goal: harden API security surface — settings validation, client error handling, CORS production config

## ground rules

- ⊥ break existing API contract (§I)
- ⊥ touch Cloudflare Hono unless CORS change requires mirror update
- ! update §T status + §B via `/spec` after each phase
- ∀ code change → CHANGELOG.md `## [Unreleased]`
- no test runner → verify via Docker integration test in check.yml smoke steps

## existing assets

- `server/index.js` — Express REST; all write routes now null-guarded (B1-B3 patched)
- `client/src/api.js` — raw fetch, no res.ok guards
- `client/src/App.jsx` — lang cookie fix applied; DEFAULT_LANGUAGE expanded
- `server/demo-session.js` — demo KV session; file-based demo cleanup ⊥ implemented
- `.github/workflows/check.yml` — Docker integration tests; CI double-build noted

## phase order

| id  | goal                                                | depends | exit                                                     |
| --- | --------------------------------------------------- | ------- | -------------------------------------------------------- |
| F1  | research CORS strategy for self-hosted + Cloudflare | −       | cors approach confirmed, sources in §R                   |
| F2  | implement settings validation + api.js error guards | F1      | server validates settings; client throws on bad response |
| F3  | implement CORS production config                    | F2      | CORS restricted in prod; Cloudflare unaffected           |
| F4  | final verify — code vs §V, smoke test, SPEC drift   | F3      | all §V.12-14 satisfied; check.yml green                  |

## F1 research

task: T14
goal: confirm CORS approach for a self-hosted Docker SPA served from same origin
inputs:

- `server/index.js` cors() call (line ~103)
- `server/hono-app.js` — check if Hono sets CORS headers
- `wrangler.jsonc` — Cloudflare routes
- express-rate-limit docs for API route protection
  steps:

1. Read `server/hono-app.js` CORS handling; check if Cloudflare deployment uses separate CORS config.
2. Confirm: in production, frontend and API share same Express origin → `cors()` not needed at all for same-origin; only needed for dev proxy scenario.
3. Research `express-rate-limit` applying to `/api/*` routes (currently only on SPA fallback).
4. Confirm safe CORS options: restrict to `ALLOWED_ORIGIN` env var in production; passthrough in dev.
5. Record findings in §R via `/spec`.
   verify: §R rows added; F2/F3 steps confirmed or corrected
   exit: cors + rate-limit approach documented; move to F2
   next: F2

## F2 implement settings validation + api.js error guards

task: T14
goal: server validates PUT /api/settings; client api.js throws on non-2xx
inputs: `server/index.js` PUT /api/settings route; `client/src/api.js`
steps:

1. `server/index.js` PUT /api/settings: validate language ∈ ["en","es","zht","ja"], startingBalance isFinite; reject 400 on invalid.
2. `client/src/api.js`: wrap each fetch in helper that checks res.ok; throw with status text on failure; update all callers.
3. `client/src/App.jsx`: add try/catch on loadData and write handlers; show console.error (⊥ crash).
   verify: POST invalid language to /api/settings → 400; client api error logged not silently ignored
   exit: §V.12 + §V.13 satisfied
   next: F3

## F3 implement CORS production config

task: T16
goal: restrict CORS in production; keep dev permissive for Vite proxy
inputs: `server/index.js`; research from F1; `ALLOWED_ORIGIN` env var (optional)
steps:

1. Replace `cors()` with config: `NODE_ENV=production` → origin = `ALLOWED_ORIGIN` env (default `false`/same-origin); dev → `true`.
2. Update `docker-compose.yml` docs/comments noting `ALLOWED_ORIGIN` env if cross-origin needed.
3. Check `server/hono-app.js` — if Cloudflare deployment already handles CORS separately, no change needed there.
   verify: production mode CORS rejects cross-origin preflight; dev mode allows Vite proxy
   exit: §V.14 satisfied; Cloudflare unaffected
   next: F4

## F4 final verify

task: T12
goal: confirm §V.11-14 hold; no spec drift; CHANGELOG updated
inputs: `SPEC.md §V`, `PLAN.md`, changed files
steps:

1. Read §V.11-14; verify each invariant holds in current code.
2. Run `npm run build` → confirm no build errors.
3. Spot-check Docker integration: start server, hit PUT /api/settings with bad language → 400.
4. Update §T status: T14→x, T15→x, T16→x via `/spec amend §T`.
5. Confirm CHANGELOG.md `## [Unreleased]` covers all changes.
6. Commit: single summary commit.
   verify: build green; §V.11-14 all pass; SPEC §T rows flipped
   exit: gate GO
   next: −
