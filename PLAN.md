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
| F5  | research release.sh bugs & reference gaps           | −       | all findings catalogued, approach confirmed              |
| F6  | rewrite release.sh                                  | F5      | all bugs fixed; dry-run works; `gh` dep removed          |
| F7  | final verify release.sh                             | F6      | §V.15 satisfied; manual dry-run + real-tag smoke pass    |

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
   next: F5

## F5 research release.sh

task: T17
goal: catalogue all bugs + gaps vs reference; confirm release.yml ownership of GitHub Release
inputs: `release.sh` (current), `.github/workflows/release.yml`, reference script (user-provided)
findings already confirmed (research complete):

- `set -e` only → needs `set -euo pipefail` (unbound vars, pipe failures silent)
- breaking-change detection: `git log --oneline` subject-only → misses `BREAKING CHANGE:` body footer; regex `'^[a-f0-9]* feat'` fragile
- CHANGELOG awk: inserts blank `### Added/Changed/Fixed` bullets back into `[Unreleased]` on every release → `[Unreleased]` accumulates noise; correct: leave header empty, move content to new version section only
- `git push --tags` → pushes ALL local tags; must push specific tag only: `git push origin "$TAG"`
- no duplicate-tag guard (tag already exists → confusing git error)
- no empty-`[Unreleased]` guard (release with no notes possible)
- `gh` CLI hard-required; `release.yml` owns GitHub Release creation via `softprops/action-gh-release@v1` → script creating a draft release duplicates/conflicts; remove `gh release create`
- uncommitted tracked changes: warns + continues (y/n) → release tagged from dirty tree; ref hard-fails
- `npm version --allow-same-version ... || true` swallows errors
- `git push` (implicit) → should name branch: `git push origin "$CURRENT_BRANCH"`
- no `--dry-run` flag
- no CHANGELOG link-definition update (`[Unreleased]:`, `[x.y.z]:`)
- missing `TAG` var; `v$NEW_VERSION` repeated inline
- `read -p` without `-r` → backslash interpreted
  steps:

1. Findings above already sourced. ∀ confirmed against current file.
2. Record findings block in §B + §V via `/spec` if new invariants warranted (V15 already added).
   verify: findings match code; no open unknowns
   exit: approach confirmed; move to F6
   next: F6

## F6 rewrite release.sh

task: T17
goal: full rewrite addressing all F5 findings
inputs: `release.sh`, reference script, `release.yml` (CI owns GitHub Release)
files: `release.sh`
steps:

1. Replace shebang `#!/bin/bash` → `#!/usr/bin/env bash`; replace `set -e` → `set -euo pipefail`.
2. Define `TAG="v${NEW_VERSION}"` var; use throughout.
3. Fix color vars: use `$'\033[...]'` so no `echo -e` needed; replace all `echo -e` → `echo`.
4. Add `--dry-run`/`-n` flag; honour it in all mutating steps.
5. Add `step()` helper (like reference).
6. Uncommitted changes: hard-fail on `! git diff-index --quiet HEAD --` (⊥ warn+continue). Keep warning+confirm for non-main branch.
7. Fix breaking-change detection: use `git log --format=%B` for full bodies; check `BREAKING[ -]CHANGE: ` anchored footer AND `!:` subject pattern.
8. Add duplicate-tag guard: `git rev-parse -q --verify "refs/tags/${TAG}"` → `die "tag ${TAG} already exists"`.
9. Add empty-`[Unreleased]` guard: awk to extract body, `[ -n "$UNRELEASED_BODY" ] || die`.
10. Fix CHANGELOG awk: leave `[Unreleased]` header empty; insert new version heading + content BELOW it (no empty bullet injection).
11. Add CHANGELOG link-definition update (`[Unreleased]:` compare URL, `[x.y.z]:` release URL).
12. Remove `gh` dependency entirely — drop `gh auth status` check, drop `gh release create`.
13. Fix `git push` → `git push origin "$CURRENT_BRANCH"` + `git push origin "$TAG"`.
14. Fix `npm version` call: `npm version "$NEW_VERSION" --no-git-tag-version >/dev/null` (⊥ `--allow-same-version || true`).
15. Fix `read` calls: add `-r` flag everywhere.
16. Add `node` check to preflight (ref: `command -v node >/dev/null || die "node is not installed"`).
17. Update header comment: document flags, describe CI hand-off, note `gh` no longer required.
    verify: `./release.sh --dry-run` runs to completion, prints plan, touches nothing; `bash -n release.sh` passes
    exit: §V.15 satisfied; dry-run works; no `gh` dep
    next: F7

## F7 final verify release.sh

task: T17
goal: confirm §V.15 holds; no regression; CHANGELOG + SPEC updated
inputs: rewritten `release.sh`, `SPEC.md §V.15`, CHANGELOG.md
steps:

1. `bash -n release.sh` → syntax OK.
2. `./release.sh --dry-run` → prints plan, exits 0, no files changed.
3. `./release.sh --dry-run --patch` → confirms patch bump calculation.
4. Verify CHANGELOG awk: create a scratch copy with `[Unreleased]` content; run awk logic manually → `[Unreleased]` empty, new version section correct.
5. Verify breaking-change regex: test `BREAKING CHANGE: ` body & `feat!:` subject patterns.
6. Flip T17→x via `/spec amend §T`.
7. Confirm `CHANGELOG.md [Unreleased]` notes cover this change.
8. Commit: single summary commit.
   verify: dry-run green; awk correct; T17 x; CHANGELOG updated
   exit: gate GO
   next: −
