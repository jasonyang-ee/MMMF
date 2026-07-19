# HANDOFF 2026-07-19

branch main | last commit b641efd research(hono): F1 confirm ... (T27) | tests n/a (⊥ runner, T12 todo)
baseline green | oracle `npm run build` (+ `node --check server/hono-app.js` — build ⊥ covers server)
uncommitted: none (F1 committed; HANDOFF this = own docs commit)

## done this session
F1 (T27): research confirmed vs installed hono@4.11.4 → b641efd. cors origin cb `(origin,c)`; truthy str→ACAO set, null→omit (`node_modules/hono/dist/middleware/cors/index.js:42-45`). `c.env.ALLOWED_ORIGIN`=correct Workers binding. Express predicate transcribed.

## in progress (exact stop point)
- : F1 done, F2 ⊥ started
mid-edit files: none

## next
F2 (T28) | preconditions: none — resume w/ /workonplan
NEXT STEP (F2, edit `server/hono-app.js`):
1. `PUT /api/settings` (:212-216): after `const body = await c.req.json()`, add `if (!["en","es","zht","ja"].includes(body.language) || !Number.isFinite(body.startingBalance)) return c.json({ error: "Invalid settings" }, 400);` BEFORE `saveData`. Match Express msg+status EXACTLY (V9,V12).
2. CORS (:19-20): origin cb `(origin) => process.env.ALLOWED_ORIGIN...` → `(origin, c) => (c.env.ALLOWED_ORIGIN === origin ? origin : null)` (V14). Keep block-when-unset.
3. `AGENTS.md`: component list — verify current stale lines; drop removed `DarkModeToggle`+`TransactionList`, add `DeleteButton`+`TypeToggle`.
4. `CHANGELOG.md` [Unreleased] ### Fixed: Hono runtime settings validation + CORS `c.env` binding parity. NOTE existing line "...Express and Hono..." (CORS) was half-true (Hono inert) — F2 makes it true.
5. verify: `npm run build` green + `node --check server/hono-app.js` + manual trace (valid passes, bad lang/NaN→400, same-origin unaffected). Flip T28→x via /spec.
then F3 (T29): final verify — classify V9/V12/V14 HOLD/VIOLATE/UNVERIFIABLE + evidence table.

## deviations & decisions
plan oracle `npm run build` builds CLIENT only → ⊥ catches server errors ∴ add `node --check server/hono-app.js` as real server oracle (PLAN.md updated: n — recorded here + F3 verify)
user decided: -

## watchouts
- mirror Express predicate EXACTLY (same 400 + `{error:"Invalid settings"}`) — V9 parity. Express reads `req.body||{}` (both fields undefined if empty body → fails validation → 400); Hono `c.req.json()` throws on empty body (⊥ concern, client always sends JSON).
- ALLOWED_ORIGIN ⊥ in wrangler.jsonc vars → unset → same-origin (no Origin hdr → origin `""`) unaffected; cross-origin blocked. Safe.
- client always sends valid full settings (App.jsx handlers, BalanceDisplay.jsx:27 `parseFloat||0`) ∴ fix ⊥ breaks live UI
- `npm run build` green ≠ server verified. ALWAYS `node --check server/hono-app.js` after editing it.

## final verification
item|status|evidence|decision
-|-|-|-
