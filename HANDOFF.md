# HANDOFF

session: 2026-07-17
branch: demo
head: 92d686ac (dirty: AGENTS.md/SPEC.md/CLAUDE.md/PLAN.md/HANDOFF.md/CHANGELOG.md new/modified)
baseline: v1.1.0

## what happened this session
1. `/prep` + `/review-code` → patched B1-B3 (lang cookie, DEFAULT_LANGUAGE, null-guards).
2. `/spec` AGENTS.md cleanup → code detail moved to SPEC.md §I; Layout refined.
3. `/cook` release.sh → analysed current script vs reference; found 11 issues; expanded PLAN.md F5-F7; added §V.15, T17 to SPEC.md.

## stopping point
→ pre-F5 (research complete; findings in PLAN F5 notes; can jump to F6).
→ pre-F1 (API harden: CORS + settings validation; not started).
Both workstreams independent.

## next phase options
- release.sh: `/workonplan F6` (F5 research pre-filled; skip to implement)
- API hardening: `/workonplan F1`

## release.sh findings (F5 — already researched)
|bug|location|issue|
|---|---|---|
|`set -e` only|`release.sh:13`|unbound vars + pipe failures silent → `set -euo pipefail`|
|CHANGELOG awk|`release.sh:251-278`|inserts empty `### Added/Changed/Fixed` back into `[Unreleased]` every release|
|breaking-change detection|`release.sh:193-200`|`--oneline` misses `BREAKING CHANGE:` body footer|
|`git push --tags`|`release.sh:295`|pushes ALL local tags; must push specific tag only|
|`gh` hard dep + `gh release create`|`release.sh:47-53,302-327`|`release.yml` owns GitHub Release → drop entirely|
|no tag-exists guard|−|ambiguous git error if tag exists|
|no empty-changelog guard|−|can release with empty notes|
|warn+continue dirty tree|`release.sh:62-70`|tracked changes tagged silently with y|
|`git push` implicit|`release.sh:293`|must be `git push origin "$CURRENT_BRANCH"`|
|no `--dry-run` flag|−|reference has it; useful|
|no CHANGELOG link defs|−|`[Unreleased]:` + `[x.y.z]:` compare URLs never updated|

## deviations from spec
- §V.3: rate-limit on SPA fallback only; ⊥ on `/api/*` — tracked F2/F3, not fixed.

## watchouts
- F6 touches only `release.sh`; ⊥ touch `release.yml`.
- F6 removes `gh` CLI req; convenience `gh release view --web` tail line removed (acceptable).
- `npm test` not defined → skip test step or add `if npm test 2>/dev/null` guard.
- CORS F3: research `server/hono-app.js` first (F1) before changing `cors()` config.
