# HANDOFF 2026-07-19

branch main | last commit 00e8801 fix(hono): mirror Express settings validation + CORS c.env (T28) | tests n/a (⊥ runner, T12 todo)
baseline green | oracle `npm run build` (client-only) + `node --check server/hono-app.js` + Hono `app.request()` smoke (scratchpad, 19/19)
uncommitted: none (F2 committed; HANDOFF this = own docs commit)

## done this session
F1 (T27): research confirmed vs installed hono@4.11.4 → b641efd.
F2 (T28): Hono parity fixes → 00e8801. `PUT /api/settings` validates `{ language, startingBalance } = body||{}` (1:1 Express mirror, 400 `{error:"Invalid settings"}`); CORS origin `(origin,c)=>c.env.ALLOWED_ORIGIN===origin?origin:null`. AGENTS.md list refreshed. CHANGELOG Fixed entry. Smoke 19/19.

## in progress (exact stop point)
- : F2 done, F3 ⊥ started
mid-edit files: none

## next
F3 (T29) final verify | preconditions: none — resume w/ /workonplan
NEXT STEP (F3, no code — verification + classify):
1. re-read §V9, §V12, §V14 + §R15/R16 (SPEC.md).
2. run `npm run build` → green; `node --check server/hono-app.js` → OK.
3. diff Hono `PUT /api/settings` (hono-app.js:212-223) vs Express (index.js:369-383): confirm identical predicate + 400 + `{error:"Invalid settings"}`.
4. confirm CORS origin reads `c.env` (hono-app.js:19-20); grep `process.env` in hono-app.js → expect 0 hits.
5. (optional strong) re-run scratchpad smoke `node "<scratchpad>/smoke.mjs"` → 19/19.
6. classify V9/V12/V14 = HOLD|VIOLATE|UNVERIFIABLE + file evidence → fill final-verification table in HANDOFF.
7. flip T29 → x via /spec. commit `verify(hono): ...`. Then cycle done → ready for /garnish.

## deviations & decisions
plan F2 step1 wrote `body.language`/`body.startingBalance` → used exact Express destructuring `const { language, startingBalance } = body || {}` for true 1:1 parity + null-body safety (null→400 not 500). Verified by smoke "null body -> 400". (PLAN.md updated: n — refinement toward stated goal, recorded here)
plan oracle `npm run build` builds CLIENT only → added `node --check` + Hono `app.request()` smoke as real server oracle. (PLAN.md updated: n — recorded here)
CHANGELOG: added Cloudflare-parity Fixed line rather than editing existing generic lines 21/23 (they stay accurate post-fix).
user decided: -

## watchouts
- `ALLOWED_ORIGIN` ⊥ in wrangler.jsonc `vars` (only `DEMO:"false"`) + ⊥ `nodejs_compat` flag → post-fix `c.env.ALLOWED_ORIGIN` undefined in prod → cross-origin blocked, same-origin (no Origin hdr → origin `""`) unaffected. Safe fail-closed, matches Express prod. ⊥ add ALLOWED_ORIGIN to vars (not asked).
- `npm run build` green ≠ server verified (client-only). ALWAYS `node --check server/hono-app.js` after editing it.
- smoke test = scratchpad throwaway (⊥ in repo), NODE runtime (process.env defined there, but code now uses c.env ∴ old process.env path irrelevant).

## final verification
item|status|evidence|decision
-|-|-|-
