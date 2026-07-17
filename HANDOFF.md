# HANDOFF

session: 2026-07-16
branch: demo
head: 92d686ac (dirty: AGENTS.md modified, SPEC.md + CLAUDE.md + PLAN.md new)
baseline: v1.1.0

## what happened this session

1. `/prep` → updated `AGENTS.md` (added §AI File Purpose, all 7 skills, Caveman symbols, Rules, Checklist); created `CLAUDE.md` + `SPEC.md` (distilled from code).
2. `/review-code` v1.1.0→HEAD → found 3 BLOCK + 4 HARDEN + 3 NOTE.
3. Patched ∀ 3 BLOCKs directly:
   - B1: `App.jsx:72` `"jp"` → `"ja"` in lang cookie allowlist
   - B2: `server/index.js:39` `DEFAULT_LANGUAGE` expanded to `["en","es","zht","ja"]`
   - B3: `server/index.js` 6 write routes: null-guard after `readJsonFile` ⊥ TypeError
4. Updated `SPEC.md`: §V +4 invariants (V11-V14), §T +3 tasks (T14-T16), §B +3 rows (B1-B3); fixed §I `DEFAULT_LANGUAGE` constraint.
5. Created `PLAN.md` (F1-F4) for HARDEN work.

## stopping point

→ pre-F1. ∀ 3 BLOCK patches applied + committed (! user to commit — ⊥ auto-commit).
HARDEN work not started. F1 = next phase.

## next phase: F1 research

start: `/workonplan F1`
key question: does `server/hono-app.js` set CORS independently? → determines F3 scope.
secondary: confirm `express-rate-limit` can be applied to `/api/*` without breaking loopback exempt.

## deviations from spec

- §V.3 says rate-limit active on ∀ routes; `staticFsLimiter` only on SPA fallback, NOT `/api/*`. Deliberate gap → tracked as HARDEN in PLAN F3. ⊥ patched yet.

## watchouts

- `cors()` with no config allows all origins; F3 changes this — may break local dev if Vite proxy misconfigured. Research F1 first.
- `PUT /api/settings` has no validation yet (F2 work). Until F2 ships, settings can be corrupted by malformed PUT.
- `client/src/api.js` has no res.ok guard (F2 work). Silent failures still possible.
- i18n.js has 20 languages in `supportedLanguages` but UI only exposes 4 — dead code, tracked as NOTE.
- check.yml double-build CI issue: noted, not in current plan scope.
