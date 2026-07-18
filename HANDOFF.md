# HANDOFF 2026-07-18

branch main | last commit 279b8e2 docs: verify release.sh rewrite (T17/T19 done) | tests green
baseline green | oracle `bash -n release.sh` + `./release.sh --dry-run [--patch]`
uncommitted: none

## done this session
F6: verify release.sh rewrite; T17+T19 → x → 279b8e2

## in progress (exact stop point)
F6 x: all steps complete | NEXT STEP: F8 — edit `.github/workflows/cleanup-ghcr.yml` + `.github/dependabot.yml` per PLAN.md F8 steps 1-5
mid-edit files: none

## next
F8 per PLAN.md (F7 research pre-complete, findings in §R.4-R5) | preconditions: none

## deviations & decisions
prev session committed F5 (b5cb854) but ⊥ refreshed HANDOFF → this session resumed at F6 from SPEC §T state, ⊥ HANDOFF pointer
`./release.sh --dry-run` hard-fails on dirty tree (guard by design) → verified via `git stash` of SPEC.md edit
user decided: -

## watchouts
- `.git` writes require escalated permission in this environment.
- awk emits `warning: escape sequence \[` on Git Bash gawk for link-def block; harmless, output correct.
- F8 files: only `cleanup-ghcr.yml` + `dependabot.yml`; ⊥ touch other workflows.
- Dependabot alerts = repo Settings toggle, ⊥ file-controlled; F9 step 5 notes manual check.

## final verification
item|status|evidence|decision
§V.15|HOLD|⊥ `gh` in release.sh; tag guard :104; empty-Unreleased guard :111; push specific tag :168-169|code
F6 oracle|HOLD|`bash -n` exit 0; dry-run + dry-run --patch exit 0, tree clean; awk scratch + 6 regex cases correct|-
