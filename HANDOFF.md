# HANDOFF 2026-07-17

branch main | last commit 09edad9 fix: harden settings API and client errors | tests green
baseline green | oracle `npm.cmd run build`; isolated Express smoke on `PORT=3610`
uncommitted: none

## done this session
F2: settings validation + client response guards → 09edad9

## in progress (exact stop point)
F2 x: steps done 1-3 | NEXT STEP: F3 — update `server/index.js`, `server/hono-app.js`, and `docker-compose.yml` CORS configuration per PLAN.md
mid-edit files: none

## next
F3 per PLAN.md recommended sequence | preconditions: F2 complete; F1 research in SPEC §R.1-R3

## deviations & decisions
plan said run `npm run build` → used `npm.cmd run build` because PowerShell execution policy blocks `npm.ps1`; same project script, green.
plan said `curl` on port 3600 → used isolated `PORT=3610` because an existing listener made port 3600 ambiguous; required requests returned 400 and JSON array.
user decided: -

## watchouts
- `.git` writes require escalated permission in this environment; F2 commit succeeded after approval.
- Handoff before this session recorded branch `demo`; current checkout is `main`.
- F3 must keep Vite-proxy development CORS permissive and restrict production in both runtimes.

## final verification
item|status|evidence|decision
§V.12|HOLD|`server/index.js` PUT /api/settings; invalid language smoke → 400|code
§V.13|HOLD|`client/src/api.js`; all API methods call `checkOk` before JSON|code
F2 oracle|HOLD|`npm.cmd run build` + isolated smoke: `transactions=[]`|-
