# PLAN

goal: fix GHCR cleanup orphaning tagged images — `docker pull ghcr.io/<owner>/mmmf:test` → `manifest unknown` after ∀ push (V21).

## ground rules
- root cause (diagnosed): `cleanup-ghcr.yml` `actions/delete-package-versions@v5` ⊥ manifest-aware → deletes untagged child manifests referenced by tagged index (`:test` is index due to build-push-action default provenance; release tags multi-arch) → tag survives, platform manifest gone → `manifest unknown` (§R17,§R18,§B4).
- fix strategy (user-chosen): manifest-aware cleanup action (`dataaxiom/ghcr-cleanup-action`) — keep untagged pruning, ⊥ orphan tagged-index children (V21).
- smallest codebase-consistent change; scope = `.github/workflows/cleanup-ghcr.yml` + CHANGELOG (+ optional `provenance:false` on check.yml only if F1 recommends).
- ⊥ change build/push logic, triggers, permissions, or namespace unless F1 proves necessary.
- verify-first: oracle = yaml parse valid + hand-trace deletion semantics vs V21 (⊥ live GHCR mutation from CI edits; ⊥ test runner, T12 todo).
- ∀ phase ends green + self-reviewed + committed w/ named evidence. ⊥ Claude co-author trailer.
- close: flip §T (T30/T31/T32), update CHANGELOG `[Unreleased]`, refresh HANDOFF.

## existing assets
- broken cleanup: `.github/workflows/cleanup-ghcr.yml:24-32` — `actions/delete-package-versions@v5`, `delete-only-untagged-versions:'true'`, `min-versions-to-keep:0`, owner=`github.repository_owner`, package-name=`github.event.repository.name`, token fallback `secrets.TOKEN_GITHUB||github.token`.
- triggers to preserve: `workflow_run` [Release,Check] completed (guard: success & event==push), `schedule` cron `17 3 * * *`, `workflow_dispatch`; concurrency group `cleanup-ghcr-untagged`.
- `:test` producer: `check.yml:59-67` build-push-action@v5 (⊥ `platforms:` set → single-arch, but default provenance → index w/ untagged children); images `ghcr.io/${{ github.actor }}/mmmf` + dockerhub.
- release producer: `release.yml:79-88` multi-arch `linux/amd64,linux/arm64` → per-arch untagged children.
- §R17,§R18 (mechanism), §V21 (invariant), §B4 (bug) already in SPEC.
- note (⊥ root cause, flag only): both workflows push to `ghcr.io/${{ github.actor }}/mmmf` (actor ≠ owner on bot/scheduled trigger).

## phase order
id|goal|depends|exit
F1|research: confirm manifest-aware action + exact inputs vs current usage|-|action+config locked, F2 steps 1:1, ⊥ open `?`
F2|impl: swap cleanup action, keep pruning+triggers, CHANGELOG|F1|yaml valid, hand-trace preserves tagged-index children, diff self-reviewed
F3|final verify: classify V21 HOLD/VIOLATE/UNVERIFIABLE + sweep other workflows|F2|yaml valid, V21 HOLD w/ evidence, ⊥ other workflow orphans children

## F1 research
task: T30
goal: lock exact manifest-aware action + config before editing.
inputs: `.github/workflows/cleanup-ghcr.yml`, `check.yml`, `release.yml`, dataaxiom/ghcr-cleanup-action docs (current release), GHCR packages API semantics.
steps:
1. confirm `dataaxiom/ghcr-cleanup-action` current major tag + input names: `packages`/`package`, `token`, `owner`, `delete-untagged`, `keep-n-tagged`/`older-than`, `dry-run`; confirm it is manifest-aware (skips untagged children referenced by tagged index) — cite docs.
2. map current behavior → new inputs 1:1: owner=repo owner, package=`mmmf`, token=`TOKEN_GITHUB||github.token`, keep untagged pruning ON but child-safe. Decide keep-policy (untagged-only, ⊥ delete tagged) matching current intent (`delete-only-untagged`).
3. confirm build-push-action@v5 default provenance makes single-arch `:test` an index (∴ has untagged children) — decide whether F2 also sets `provenance:false`+`sbom:false` on `check.yml` build (belt-and-suspenders) OR leave to cleanup action (release still needs manifest-aware ∴ action swap mandatory regardless).
4. confirm ⊥ permission/trigger changes needed (packages:write already present).
verify: F2 step list maps 1:1 to a real current action release; ⊥ open `?`; ⊥ guessed input names.
exit: config locked; if docs unreachable → record `?` + stop for user.
next: F2

### F1 findings (LOCKED 2026-07-19)
- action = `dataaxiom/ghcr-cleanup-action@v1` (current major; latest v1.2.2 Jun 2026).
- manifest-aware CONFIRMED (docs): "'Untagged' refers to untagged images, not untagged GitHub packages" → untagged child/platform manifests referenced by a tagged index ⊥ counted as untagged ∴ ⊥ orphaned by `delete-untagged`. distinct from `actions/delete-package-versions` (⊥ builds manifest graph). `validate` input post-verifies multi-arch integrity.
- input map 1:1: `owner: ${{ github.repository_owner }}`, `package: ${{ github.event.repository.name }}`, `token: ${{ secrets.TOKEN_GITHUB != '' && secrets.TOKEN_GITHUB || github.token }}`, `delete-untagged: "true"` (= current delete-only-untagged intent), `validate: "true"` (NEW, cheap, strengthens V21 evidence). ⊥ `keep-n-tagged` (keep ∀ tagged, only untagged pruned), ⊥ `dry-run`.
- step3 decision = ⊥ set `provenance:false` on `check.yml`: action covers both `:test` (attest index) & release (multi-arch); flattening only helps `:test` (strips attestations) + release still needs action swap ∴ scope creep. scope stays = `cleanup-ghcr.yml` + `CHANGELOG.md`.
- step4: `permissions.packages: write` already present → ⊥ permission/trigger change needed.
- trigger decision (USER 2026-07-19): `workflow_run.workflows` = `["Release"]` ONLY (dropped `Check`) — user wants cleanup on release push only, ⊥ every Check push. supersedes plan's "preserve [Release,Check]". user ALSO removed `schedule` cron → triggers now `workflow_run[Release]` + `workflow_dispatch` only. F2 KEEPS user's trigger set. NOTE: action swap still MANDATORY — release build is multi-arch (linux/amd64,arm64) + attested ∴ dumb cleaner would still orphan release-tag children even on Release-only trigger; trigger change is complementary defense-in-depth, ⊥ a replacement for manifest-aware action.
- quote normalization in stray edit (single→double) = cosmetic; F2 keeps a single consistent style, minimal semantic diff.

## F2 implement
task: T31
goal: swap to manifest-aware cleanup, preserve pruning + triggers.
inputs: F1 findings; `.github/workflows/cleanup-ghcr.yml`, `CHANGELOG.md`.
files: `.github/workflows/cleanup-ghcr.yml`, `CHANGELOG.md`, (optional per F1) `.github/workflows/check.yml`.
steps:
1. replace `actions/delete-package-versions@v5` step w/ manifest-aware action (pinned tag from F1); set owner/package/token; enable untagged deletion child-safe; preserve `on:` triggers, `if` guard, `concurrency`, `permissions`.
2. (if F1 step3 → yes) add `provenance: false` + `sbom: false` to `check.yml` build-push-action to keep `:test` a plain single manifest.
3. update `CHANGELOG.md` `[Unreleased]` → Fixed: GHCR cleanup no longer orphans tagged multi-arch/attested images (`manifest unknown` on pull).
verify: yaml parses (lint/parse); hand-trace — tagged index children preserved, genuinely-orphaned untagged still pruned; triggers unchanged.
exit: cleanup step swapped, CHANGELOG updated, build/trigger surface unchanged, self-reviewed diff.
next: F3

## F3 final verify
task: T32
goal: prove V21 holds, ⊥ residual orphaning path.
inputs: touched files, §V21, §R17/§R18, `check.yml`, `release.yml`.
steps:
1. re-read §V21, §R17, §R18.
2. yaml parse `cleanup-ghcr.yml` → record result.
3. confirm new action is manifest-aware + untagged pruning still active (cite action docs/inputs).
4. grep all `.github/workflows/*.yml` for other package-deletion steps → confirm none orphan tagged-index children.
5. classify V21 = HOLD | VIOLATE | UNVERIFIABLE w/ file evidence (note: full proof = observe a real pull post-deploy, ⊥ runnable pre-merge → record as UNVERIFIABLE-until-deploy if applicable, w/ hand-trace as strongest available evidence); record table in HANDOFF.
verify: yaml valid + V21 classified w/ cited evidence + ⊥ other orphaning workflow.
exit: cycle done → ready for /garnish.
next: -
