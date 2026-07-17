# HANDOFF 2026-07-17

branch main | last commit 1d78a26 fix: restrict production cors origins | tests green
baseline green | oracle `npm.cmd run build`; Express + Hono CORS smoke tests
uncommitted: none

## done this session
F2: settings validation + client response guards → 09edad9
F3: production CORS restriction in Express/Hono → 1d78a26

## in progress (exact stop point)
F3 x: steps done 1-3 | NEXT STEP: F4 — read §V.12-14, run final build/smoke evidence, then flip T14/T15/T16/T18 and commit
mid-edit files: none

## next
F4 per PLAN.md recommended sequence | preconditions: F2 + F3 complete

## deviations & decisions
plan said Hono `origin: false` → used exact-origin matcher returning `null`; Hono cors rejects boolean false (`TypeError: optsOrigin.includes is not a function`). PLAN.md updated.
plan said `npm run build` → used `npm.cmd run build` because PowerShell execution policy blocks `npm.ps1`; green.
user decided: -

## watchouts
- `.git` writes require escalated permission in this environment.
- Handoff before this session recorded branch `demo`; current checkout is `main`.
- F4 must verify V14 in both runtimes and preserve §R.1-R3 evidence.

## final verification
item|status|evidence|decision
§V.12|HOLD|`server/index.js` PUT /api/settings; invalid language smoke → 400|code
§V.13|HOLD|`client/src/api.js`; all API methods call `checkOk` before JSON|code
§V.14|HOLD|Express prod omits ACAO; dev reflects origin; Hono rejects mismatched origin|code
F3 oracle|HOLD|`npm.cmd run build` + direct Hono matcher smoke|-
