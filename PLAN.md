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

| id  | goal                                                     | depends | exit                                                     |
| --- | -------------------------------------------------------- | ------- | -------------------------------------------------------- |
| F1  | research CORS strategy for self-hosted + Cloudflare      | −       | cors approach confirmed, sources in §R                   |
| F2  | implement settings validation + api.js error guards      | F1      | server validates settings; client throws on bad response |
| F3  | implement CORS production config (Express + Hono)        | F2      | CORS restricted in prod; both runtimes restricted        |
| F4  | final verify — API harden                                | F3      | all §V.12-14 satisfied; check.yml green                  |
| F5  | rewrite release.sh (research pre-complete, see §R notes) | −       | all bugs fixed; dry-run works; `gh` dep removed          |
| F6  | final verify release.sh                                  | F5      | §V.15 satisfied; dry-run + syntax check pass             |
| F7  | research CI/CD cleanup + dependabot (pre-complete)       | −       | findings logged in §R; F8 steps confirmed                |
| F8  | fix cleanup-ghcr.yml + dependabot.yml                    | F7      | correct package-name; ⊥ auto PRs; CHANGELOG updated      |
| F9  | final verify CI/CD — §V.16-17 compliance                 | F8      | both files correct; §T.20-22 flipped                     |

## F1 research

task: T14
goal: confirm CORS approach for self-hosted Docker SPA + Cloudflare Workers
inputs: `server/index.js`, `server/hono-app.js`, `wrangler.jsonc`

research complete — findings (recorded in §R):

- `server/hono-app.js:16`: `app.use("/api/*", cors())` — wildcard CORS, no config; Cloudflare also needs restriction (§R.1)
- `wrangler.jsonc:17`: `assets.directory: ./client/dist` — frontend co-located; same origin in prod (§R.2)
- `server/index.js:107`: Express serves `client/dist/` in prod — same origin; `cors()` removable in prod (§R.3)
- Conclusion: Express accepts `origin: false`; Hono `cors()` requires string/function/array, so Hono must use an origin matcher returning exact `ALLOWED_ORIGIN` or `null`

steps:

1. Record findings in §R via `/spec` (done in review-plan pass).
2. Confirm F3 steps account for BOTH `server/index.js` AND `server/hono-app.js`.
3. Confirm no `express-rate-limit` change needed for F2 (rate-limit on API routes is HARDEN tracked separately).
   verify: §R rows R1-R3 present in SPEC.md; F3 steps updated
   exit: research complete; move to F2
   next: F2

## F2 implement settings validation + api.js error guards

task: T15
goal: server validates PUT /api/settings; client api.js throws on non-2xx
inputs: `server/index.js` PUT /api/settings route; `client/src/api.js`; `client/src/App.jsx`
steps:

1. `server/index.js` PUT /api/settings: validate `language` ∈ `["en","es","zht","ja"]`, `startingBalance` isFinite; reject 400 on invalid.
2. `client/src/api.js`: add `checkOk(res)` helper (`if (!res.ok) throw new Error(res.statusText + " " + res.status)`); wrap all 14 fetch `.json()` calls with `checkOk` before return.
3. `client/src/App.jsx`: wrap `loadData` and ∀ write handlers in try/catch; `console.error` on catch (⊥ crash, ⊥ silent swallow).
   verify:

- `curl -s -o /dev/null -w "%{http_code}" -X PUT http://localhost:3600/api/settings -H "Content-Type: application/json" -d '{"language":"badlang","startingBalance":0,"currentDate":"2026-01-01","forecastEndDate":"2026-02-01","currencySymbol":"USD","dateFormat":"MMM dd, yyyy"}' → 400`
- `curl -s http://localhost:3600/api/transactions → JSON array` (read-path ⊥ broken by wrapper)
  exit: §V.12 + §V.13 satisfied
  next: F3

## F3 implement CORS production config (Express + Hono)

task: T16
goal: restrict CORS in both runtimes; keep dev permissive for Vite proxy
inputs: `server/index.js`, `server/hono-app.js`; §R.1-R3; `ALLOWED_ORIGIN` env var (optional)
files: `server/index.js`, `server/hono-app.js`, `docker-compose.yml`
steps:

1. `server/index.js`: replace `app.use(cors())` with `cors({ origin: process.env.NODE_ENV === 'production' ? (process.env.ALLOWED_ORIGIN || false) : true })`.
2. `server/hono-app.js:16`: replace `cors()` with `cors({ origin: (origin) => process.env.ALLOWED_ORIGIN === origin ? origin : null })` — Cloudflare always runs in production context; Hono rejects `origin: false`.
3. `docker-compose.yml`: add comment noting optional `ALLOWED_ORIGIN` env var for cross-origin access.
   verify:

- `NODE_ENV=production node server/index.js &`; `curl -s -I -H "Origin: http://evil.example.com" -X OPTIONS http://localhost:3600/api/settings → ⊥ Access-Control-Allow-Origin header in response`
- `NODE_ENV=development`: same test → ACAO header present (dev pass-through OK)
  exit: §V.14 satisfied; Express + Hono both restricted
  next: F4

## F4 final verify API harden

task: T18
goal: confirm §V.12-14 hold; no spec drift; CHANGELOG updated
inputs: `SPEC.md §V`, `PLAN.md`, changed files
steps:

1. Read §V.12-14; verify each invariant holds in current code (cite file:line for each).
2. Run `npm run build` → confirm no build errors.
3. Smoke test (Docker or local): `curl` PUT /api/settings with bad language → 400; `curl` GET /api/transactions → JSON array.
4. Flip §T: T14→x, T15→x, T16→x, T18→x via `/spec amend §T`.
5. Confirm CHANGELOG.md `## [Unreleased]` covers all F2+F3 changes.
6. Commit: single summary commit.
   verify: build green; §V.12-14 all pass with evidence; SPEC §T rows flipped
   exit: gate GO
   next: F5

## F5 rewrite release.sh

task: T17
goal: rewrite addressing all pre-researched bugs (F5 research complete; HANDOFF.md + PLAN notes)
inputs: `release.sh`, `.github/workflows/release.yml`, pre-researched findings below
files: `release.sh`

pre-research confirmed bugs:

- `set -e` only; needs `set -euo pipefail`
- CHANGELOG awk inserts empty `### Added/Changed/Fixed` back into `[Unreleased]` each release
- breaking-change detection: `git log --oneline` (subjects only) → misses `BREAKING CHANGE:` body footer
- `git push --tags` pushes ALL local tags; must push specific tag only
- `gh` CLI hard-required + `gh release create` → `release.yml` owns GitHub Release via `softprops/action-gh-release@v1`; remove entirely
- no duplicate-tag guard; no empty-`[Unreleased]` guard
- uncommitted changes: warns+continues; should hard-fail
- `git push` implicit; `npm version --allow-same-version || true` swallows errors
- no `--dry-run` flag; no CHANGELOG link-definition update; `read -p` without `-r`

steps:

1. Replace shebang `#!/bin/bash` → `#!/usr/bin/env bash`; `set -e` → `set -euo pipefail`.
2. Define `TAG="v${NEW_VERSION}"` var; use throughout (⊥ inline `v$NEW_VERSION`).
3. Fix color vars: use `$'\033[...]'` form; replace all `echo -e` → `echo`.
4. Add `step()` helper function.
5. Add `--dry-run`/`-n` flag; honour in all mutating steps (bump, awk, commit, tag, push).
6. Uncommitted tracked changes: `! git diff-index --quiet HEAD --` → `die` (hard-fail, ⊥ warn+continue). Keep confirm-prompt for non-main branch.
7. Fix breaking-change detection: `git log "${LATEST_TAG}..HEAD" --format=%B` for full bodies; check `BREAKING[ -]CHANGE: ` anchored footer AND `^[a-z]+(\([^)]*\))?!:` subject pattern.
8. Add duplicate-tag guard: `git rev-parse -q --verify "refs/tags/${TAG}" >/dev/null && die "tag ${TAG} already exists"`.
9. Add empty-`[Unreleased]` guard: awk-extract body, `[ -n "$UNRELEASED_BODY" ] || die "CHANGELOG.md [Unreleased] is empty"`.
10. Fix CHANGELOG awk: leave `[Unreleased]` header empty after release (⊥ inject empty bullets); insert new version heading + content directly after.
11. Add CHANGELOG link-definition update block (awk): `[Unreleased]:` compare URL + `[x.y.z]:` release URL.
12. Remove `gh` dependency: drop `command -v gh`, `gh auth status`, `gh release create` blocks.
13. Fix `git push` → `git push origin "$CURRENT_BRANCH"` + `git push origin "$TAG"`.
14. Fix `npm version` → `npm version "$NEW_VERSION" --no-git-tag-version >/dev/null`.
15. Fix all `read` calls: add `-r` flag.
16. Add `node` preflight check: `command -v node >/dev/null || die "node is not installed"`.
17. Update header comment: document flags (`--major`, `--minor`, `--patch`, `--yes`, `--dry-run`); describe CI hand-off; note `gh` no longer required.
    verify:

- `bash -n release.sh` → exit 0
- `./release.sh --dry-run` → prints plan, exits 0, ⊥ files changed (`git diff --stat` clean after)
- `./release.sh --dry-run --patch` → shows correct NEW_VERSION calculation
  exit: §V.15 satisfied; dry-run works; ⊥ `gh` dep
  next: F6

## F6 final verify release.sh

task: T19
goal: confirm §V.15 holds; CHANGELOG + SPEC updated; commit
inputs: rewritten `release.sh`, `SPEC.md §V.15`, `CHANGELOG.md`
steps:

1. `bash -n release.sh` → syntax OK.
2. `./release.sh --dry-run` → exits 0, no files changed.
3. `./release.sh --dry-run --patch` → shows correct version bump.
4. Verify CHANGELOG awk manually: apply awk logic to a scratch copy → `[Unreleased]` empty after; new version section has content.
5. Verify breaking-change regex: echo test strings through patterns (body `BREAKING CHANGE: `, subject `feat!: foo`) → correct detection.
6. Flip §T: T17→x, T19→x via `/spec amend §T`.
7. Confirm `CHANGELOG.md [Unreleased]` notes cover release.sh rewrite.
8. Commit: single summary commit.
   verify: dry-run green; awk correct; §T flipped; CHANGELOG updated
   exit: gate GO
   next: −

## F7 research CI/CD cleanup + dependabot

task: T20
goal: confirm exact fixes for cleanup-ghcr.yml + dependabot.yml
inputs: `.github/workflows/cleanup-ghcr.yml`, `.github/dependabot.yml`, §R.4-R5

research complete — findings:

- `cleanup-ghcr.yml:26` `package-name: iclib` stale → `mmmf` (R4); use `${{ github.event.repository.name }}` to avoid future drift
- `cleanup-ghcr.yml` trigger + `delete-only-untagged-versions: 'true'` + `min-versions-to-keep: 0` logic is otherwise correct; keep as-is
- `dependabot.yml` npm `open-pull-requests-limit: 10`, docker `5`, github-actions `5` → all → `0` (R5)
- Dependabot security alerts (visible at github.com/repo/security/dependabot) are repo-level setting, ⊥ affected by limit; ! must remain ON in repo Settings → Security

steps:

1. Confirm `cleanup-ghcr.yml` package-name mismatch (done above).
2. Confirm `dependabot.yml` open-pull-requests-limit values (done above).
3. Record findings in §R.4-R5 via `/spec` (done).
   verify: §R.4 + §R.5 in SPEC.md; F8 steps unambiguous
   exit: research complete; move to F8
   next: F8

## F8 fix cleanup-ghcr.yml + dependabot.yml

task: T21
goal: correct package-name in cleanup workflow; disable auto PRs in dependabot
inputs: `.github/workflows/cleanup-ghcr.yml`, `.github/dependabot.yml`, §R.4-R5
files: `.github/workflows/cleanup-ghcr.yml`, `.github/dependabot.yml`
steps:

1. `cleanup-ghcr.yml:26`: change `package-name: iclib` → `package-name: ${{ github.event.repository.name }}`.
2. `dependabot.yml` npm block: `open-pull-requests-limit: 10` → `0`.
3. `dependabot.yml` docker block: `open-pull-requests-limit: 5` → `0`.
4. `dependabot.yml` github-actions block: `open-pull-requests-limit: 5` → `0`.
5. CHANGELOG.md `## [Unreleased]` → add entries for both changes.
   verify:

- `cleanup-ghcr.yml` contains `package-name: ${{ github.event.repository.name }}`; ⊥ `iclib`
- `dependabot.yml` ∀ `open-pull-requests-limit` entries = `0`
  exit: §V.16 + §V.17 satisfied in files
  next: F9

## F9 final verify CI/CD

task: T22
goal: confirm §V.16-17 hold; SPEC §T updated; CHANGELOG covers changes; commit
inputs: `SPEC.md §V`, changed files
steps:

1. Read §V.16-17; verify each holds in current files (cite file:line).
2. Confirm §R.4-R5 present in SPEC.md.
3. Check CHANGELOG.md `## [Unreleased]` covers F8 changes.
4. Flip §T: T20→x, T21→x, T22→x via `/spec amend §T`.
5. Note: repo Settings → Security → Dependabot alerts must be ON (manual check; ⊥ file-controlled).
6. Commit: single summary commit.
   verify: §V.16-17 pass with evidence; §T flipped; CHANGELOG updated
   exit: gate GO
   next: −
