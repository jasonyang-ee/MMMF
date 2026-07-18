# HANDOFF 2026-07-18

branch main | last commit 4e5e15b docs: verify CI/CD fixes (T20-T22 done) | tests green
baseline green | oracle `npm.cmd run build` (✓ 5.49s); `bash -n release.sh` + `./release.sh --dry-run`
uncommitted: none

## done this session
F6: verify release.sh rewrite; T17+T19 → x → 279b8e2
F8: cleanup-ghcr.yml repo-name var + dependabot limits 0 → 0c076dc
F9: verify §V.16-17; T20+T21+T22 → x → 4e5e15b

## in progress (exact stop point)
- (∀ PLAN.md phases F1-F9 complete) | NEXT STEP: `/garnish` to close cycle (purge PLAN.md + HANDOFF.md)
mid-edit files: none

## next
plan cycle complete | preconditions: none | candidate follow-ups live in §T: T12 (test runner CI), T13 (currency expansion)

## deviations & decisions
prev session committed F5 (b5cb854) ⊥ refreshed HANDOFF → resumed at F6 from SPEC §T state
user decided: -

## watchouts
- `${{ github.event.repository.name }}` yields `MMMF` (mixed case); GHCR package is `mmmf` — GitHub package API matches case-insensitively, but if cleanup still no-ops, hardcode `mmmf`.
- Dependabot security alerts = repo Settings → Security toggle; ! verify ON manually (⊥ file-controlled).
- `.git` writes require escalated permission in this environment.
- ⊥ push | tag without explicit ask; 5 local commits ahead of origin/main.

## final verification
item|status|evidence|decision
§V.15|HOLD|⊥ `gh` in release.sh; tag guard :104; empty-Unreleased guard :111; push specific tag :168-169|code
§V.16|HOLD|cleanup-ghcr.yml:28 `package-name: ${{ github.event.repository.name }}`; ⊥ `iclib`|code
§V.17|HOLD|dependabot.yml:13,36,54 `open-pull-requests-limit: 0`; schedule/reviewers kept|code
F6 oracle|HOLD|`bash -n` exit 0; dry-run ×2 exit 0, tree clean; awk scratch + 6 regex cases correct|-
F9 oracle|HOLD|`npm.cmd run build` green; yaml parse ok|-
