# HANDOFF 2026-07-19

branch main | last commit 1f1836d verify(hono): final verify — V9/V12/V14 HOLD (T29) | tests n/a (⊥ runner, T12 todo)
baseline green | oracle `npm run build` (client-only) + `node --check server/hono-app.js` + Hono `app.request()` smoke (scratchpad, 19/19)
uncommitted: none (all phases committed; HANDOFF this = own docs commit)

## done this session
F1 (T27): research confirmed vs installed hono@4.11.4 → b641efd.
F2 (T28): Hono parity fixes → 00e8801. `PUT /api/settings` validates `{ language, startingBalance } = body||{}` (1:1 Express mirror, 400 `{error:"Invalid settings"}`); CORS origin `(origin,c)=>c.env.ALLOWED_ORIGIN===origin?origin:null`. AGENTS.md list refreshed. CHANGELOG Fixed entry.
F3 (T29): final verify → 1f1836d. build green, node --check OK, smoke 19/19, routes 15/15 identical, 0 process.env in hono-app.js. V9/V12/V14 = HOLD.

## in progress (exact stop point)
- : cycle COMPLETE. T27,T28,T29 all `x`. ⊥ open phase.
mid-edit files: none

## next
CYCLE DONE → run `/garnish` (verifies all PLAN tasks done + tests green + tree clean, then purges PLAN.md + HANDOFF.md). No further /workonplan phase.
preconditions: none

## deviations & decisions
plan F2 step1 wrote `body.language`/`body.startingBalance` → used exact Express destructuring `const { language, startingBalance } = body || {}` for true 1:1 parity + null-body safety (null→400 not 500). Verified by smoke "null body -> 400". (PLAN.md updated: n — refinement toward stated goal)
plan oracle `npm run build` builds CLIENT only → added `node --check` + Hono `app.request()` smoke as real server oracle. (PLAN.md updated: n)
CHANGELOG: added Cloudflare-parity Fixed line (existing generic lines 21/23 stay accurate post-fix).
user decided: -

## watchouts
- `ALLOWED_ORIGIN` ⊥ in wrangler.jsonc `vars` (only `DEMO:"false"`) + ⊥ `nodejs_compat` flag → post-fix `c.env.ALLOWED_ORIGIN` undefined in prod → cross-origin blocked, same-origin (no Origin hdr → origin `""`) unaffected. Safe fail-closed, matches Express prod (`process.env.ALLOWED_ORIGIN||false`). ⊥ add ALLOWED_ORIGIN to vars unless a real cross-origin client appears.
- `npm run build` green ≠ server verified (client-only). ALWAYS `node --check server/hono-app.js` after editing it.
- Hono `PUT /api/settings` has ⊥ explicit 500-on-write-failure branch (Express has one for file write). Pre-existing Hono/KV pattern, ⊥ regression from F2, out of scope. Note if a future phase hardens KV write errors.
- smoke test = scratchpad throwaway (⊥ in repo).

## final verification
item|status|evidence|decision
V9 same REST surface + parity|HOLD|routes 15/15 identical (index.js vs hono-app.js); PUT /api/settings + CORS mirror Express|code
V12 PUT /api/settings validated (lang∈V7 set & startingBalance numeric)|HOLD|hono-app.js:214-220 predicate=Express index.js:371-374; smoke bad lang/string/missing/Infinity/null→400, valid+4 langs+0→200|code
V14 CORS restrict origins, Hono c.env ⊥ process.env, parity|HOLD|hono-app.js:19-20 c.env.ALLOWED_ORIGIN; grep process.env hono-app.js=0; Express index.js:109 process.env.ALLOWED_ORIGIN\|\|false; both fail-closed; smoke match→ACAO, mismatch/unset→none|code
