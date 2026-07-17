# HANDOFF

session: 2026-07-17
branch: demo
head: 92d686ac (dirty: AGENTS.md/SPEC.md/CLAUDE.md/PLAN.md/HANDOFF.md/CHANGELOG.md new/modified)
baseline: v1.1.0

## what happened this session

1. `/prep` + `/review-code` → patched B1-B3 (lang cookie, DEFAULT_LANGUAGE, null-guards).
2. `/spec` AGENTS.md cleanup → code detail moved to SPEC.md §I; Layout refined.
3. `/cook` release.sh → analysed current script vs reference; found 11 issues; expanded PLAN.md F5-F6; added §V.15, T17 to SPEC.md.
4. `/cook` CI/CD → found 2 bugs in CI/CD config; expanded PLAN.md F7-F9; added §R.4-R5, §V.16-17, §T.20-22 to SPEC.md.

## stopping point

→ pre-F5 (API harden: F2-F4 not started) & pre-F5 (release.sh: not started) & pre-F8 (CI/CD: F7 research pre-complete).
All three workstreams independent.

## next phase options

- API hardening: `/workonplan F2` (F1 research complete; §R.1-3 recorded)
- release.sh: `/workonplan F5` (research pre-filled in F5 notes; implement directly)
- CI/CD fixes: `/workonplan F8` (F7 research pre-complete; findings in F7 notes; implement directly)

## CI/CD findings (F7 — already researched)

| file                            | issue                                                                             | fix                                     |
| ------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------- |
| `cleanup-ghcr.yml:26`           | `package-name: iclib` stale; targets wrong package; cleanup never fires on `mmmf` | → `${{ github.event.repository.name }}` |
| `dependabot.yml` npm            | `open-pull-requests-limit: 10` → auto-creates weekly PRs                          | → `0`                                   |
| `dependabot.yml` docker         | `open-pull-requests-limit: 5` → auto-creates weekly PRs                           | → `0`                                   |
| `dependabot.yml` github-actions | `open-pull-requests-limit: 5` → auto-creates weekly PRs                           | → `0`                                   |

## release.sh findings (F5 — already researched)

| bug                                 | location                   | issue                                                                          |
| ----------------------------------- | -------------------------- | ------------------------------------------------------------------------------ |
| `set -e` only                       | `release.sh:13`            | unbound vars + pipe failures silent → `set -euo pipefail`                      |
| CHANGELOG awk                       | `release.sh:251-278`       | inserts empty `### Added/Changed/Fixed` back into `[Unreleased]` every release |
| breaking-change detection           | `release.sh:193-200`       | `--oneline` misses `BREAKING CHANGE:` body footer                              |
| `git push --tags`                   | `release.sh:295`           | pushes ALL local tags; must push specific tag only                             |
| `gh` hard dep + `gh release create` | `release.sh:47-53,302-327` | `release.yml` owns GitHub Release → drop entirely                              |
| no tag-exists guard                 | −                          | ambiguous git error if tag exists                                              |
| no empty-changelog guard            | −                          | can release with empty notes                                                   |
| warn+continue dirty tree            | `release.sh:62-70`         | tracked changes tagged silently with y                                         |
| `git push` implicit                 | `release.sh:293`           | must be `git push origin "$CURRENT_BRANCH"`                                    |
| no `--dry-run` flag                 | −                          | reference has it; useful                                                       |
| no CHANGELOG link defs              | −                          | `[Unreleased]:` + `[x.y.z]:` compare URLs never updated                        |

## deviations from spec

- §V.3: rate-limit on SPA fallback only; ⊥ on `/api/*` — tracked F2/F3, not fixed.

## watchouts

- F6 touches only `release.sh`; ⊥ touch `release.yml`.
- F6 removes `gh` CLI req; convenience `gh release view --web` tail line removed (acceptable).
- F8: Dependabot security alerts (GitHub Security tab) are repo-level setting ⊥ controlled by dependabot.yml; verify ON manually after F8.
- CORS F3: research `server/hono-app.js` first (F1) before changing `cors()` config.
