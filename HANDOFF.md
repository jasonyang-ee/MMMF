# HANDOFF 2026-07-17

branch main | last commit aa12b94 docs: verify API hardening invariants | tests green
baseline green | oracle `npm.cmd run build`; API smoke + Express/Hono CORS checks
uncommitted: none

## done this session
F2: settings validation + client response guards → 09edad9
F3: production CORS restriction in Express/Hono → 1d78a26
F4: API hardening verification, T14/T15/T16/T18 complete → aa12b94

## in progress (exact stop point)
F4 x: all steps complete | NEXT STEP: F5 — rewrite `release.sh` per PLAN.md steps 1-17
mid-edit files: none

## next
F5 per PLAN.md recommended sequence | preconditions: none; research pre-complete in HANDOFF/PLAN notes

## deviations & decisions
Hono `origin: false` plan contradicted runtime → exact-origin matcher returning `null`; PLAN.md updated and smoke-tested.
`npm run build` invoked as `npm.cmd run build` because PowerShell execution policy blocks `npm.ps1`; green.
user decided: -

## watchouts
- `.git` writes require escalated permission in this environment.
- Current checkout branch `main`; older handoff recorded `demo`.
- F5 touches only `release.sh`; do not alter `.github/workflows/release.yml`.

## final verification
item|status|evidence|decision
§V.12|HOLD|invalid settings → 400; `Number.isFinite` + language allowlist|code
§V.13|HOLD|all 15 API methods call `checkOk` before JSON|code
§V.14|HOLD|Express prod omits ACAO; dev reflects; Hono mismatch omitted|code
F4 oracle|HOLD|`npm.cmd run build`; `transactions=[]`; status 400|-
