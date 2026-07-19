# HANDOFF 2026-07-19

branch main | last commit a850b55 fix(ci): bump Cloudflare_Build_Test to Node 22 for Wrangler (B5/V22) | tests n/a (⊥ runner, T12 todo)
baseline green | oracle `python -c "import yaml; yaml.safe_load(open('.github/workflows/<f>.yml'))"` (pyyaml installed this session)
uncommitted: none (HANDOFF.md committed via docs: handoff)

## done this session
F1 (T30): research → dataaxiom/ghcr-cleanup-action@v1 manifest-aware CONFIRMED, config locked → 27533f1
F2 (T31): swap actions/delete-package-versions@v5 → dataaxiom/ghcr-cleanup-action@v1 (delete-untagged+validate) → 2f3a34c
F3 (T32): final verify → V21 HOLD, ⊥ residual orphaning path → 4c1701e
extra (user ask, ⊥ in PLAN): B5/V22 — bump check.yml Cloudflare_Build_Test node-version 20→22 (Wrangler ≥22) → a850b55

## in progress (exact stop point)
none. PLAN.md cycle F1-F3 COMPLETE (T30/T31/T32 all x). NEXT STEP: run /garnish to purge PLAN.md + HANDOFF.md.
mid-edit files: none

## next
/garnish (all plan tasks x, final verify done, tree clean) | preconditions: none

## deviations & decisions
plan said preserve triggers [Release,Check] → user committed da9e8aa "ci: only clean on release" (drop Check + schedule cron) BEFORE F2 (PLAN.md updated: y — F1 findings block)
plan F2 step2 (provenance:false on check.yml) → deferred: manifest-aware action fully covers :test + release; flattening only helps :test (strips attest) → scope creep (PLAN.md updated: y)
user decided: cleanup trigger = workflow_run[Release] + workflow_dispatch only (⊥ Check, ⊥ schedule). fix strategy = manifest-aware action swap.
user asked mid-session: fix Wrangler Node-version CI error → done as B5/V22, separate commit a850b55.

## watchouts
- V21 empirical proof (real `docker pull` post-cleanup) ⊥ runnable pre-merge (no live GHCR mutation from CI); first post-deploy cleanup self-asserts via `validate: true` (fails job if orphaned).
- action swap was MANDATORY independent of trigger change — release build multi-arch (amd64,arm64)+attested → dumb cleaner orphans children even on Release-only trigger.
- node floor = 24 across repo: package.json engines ≥24 (user edit), release.yml + check.yml Cloudflare_Build_Test both pin 24; ⊥ regress below V22.
- uncommitted (user's parallel edit, ⊥ mine): package.json + package-lock.json engines.node 20→24 — left for user to commit.
- secondary (flag only, ⊥ addressed): both workflows push `ghcr.io/${{ github.actor }}/mmmf` (actor≠owner on bot trigger).

## final verification
item|status|evidence|decision
V21|HOLD|dataaxiom action manifest-aware (docs: untagged=images ⊥ packages); hand-trace release cleanup preserves index children; `validate:true` CI guard; sweep = only 1 deletion step, manifest-aware; yaml parses|code (empirical pull deferred to first post-deploy run, guarded by validate)
V22|HOLD|check.yml Cloudflare_Build_Test node-version=22 ≥ Wrangler floor; yaml parses|code
T30/T31/T32|HOLD|SPEC §T all x; commits 27533f1/2f3a34c/4c1701e|-
