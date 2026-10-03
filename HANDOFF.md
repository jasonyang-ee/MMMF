<!-- HANDOFF FORMAT (baked by /encode-docs — keep; makes this file self-describing)
Current baton. Replace with current state; preserve valid evidence. Intent → PLAN.md, durable truth → SPEC.md.
Sections: header | done this session | in progress (exact stop point) | next | deviations & decisions | watchouts | final verification. Empty section = -.
Header: branch | HEAD before baton write | check commands/methods + exact results or not-run reasons | uncommitted files + ownership/reasons.
Current/next pointers: F<n>.T<n>, or none + reason. Name precise action, file, function/section; list mid-edit files or none.
Name failing file/case and unavailable checks exactly. Never invent test counts or future commit ids.
Only final verification creates result rows; preserve valid rows on refresh. Stale evidence → UNVERIFIABLE until rechecked.
Final table: item|status|evidence|decision, with delimiter row. Status: HOLD | VIOLATE | UNVERIFIABLE. Empty table ≠ completion.
Symbols: → leads to | ∴ therefore | ∀ every | ∃ exists | ! required | ? unknown/optional | ⊥ forbidden/absent | ≠ differs | ∈ member | ∉ not member | ≤ at most | ≥ at least | & and | § section.
Preserve literals, conditions, negation, uncertainty, quantities, and requirement strength.
Full rules: /encode-docs.
-->

# HANDOFF 2026-10-03

branch main | last commit 61205993ddfcdcf245a7eb0fbf4c51e0d37154a9
checks: baseline review at this implementation SHA passed 22 Node tests, 8 Chromium tests, frontend/Worker/Pages builds, Docker build/entrypoint smoke, Bash syntax, ShellCheck and audit (0 vulnerabilities). Reused, not rerun for planning-only edits. RC1/RC2 focused probes reproduced the defects despite those passes. Planning-only Node prototype confirmed scoped Express IPv4/IPv6/mapped matching and long-card payment currently fails `400 Invalid name`. Review-plan GO: zero open planning blockers. Document checks passed for baked headers, five todo tasks, cross-file pointers, table widths, SPEC counters and empty final table; CRLF-aware diff check passed. No JS lint script.
uncommitted: owned, complete planning edits `PLAN.md`, `HANDOFF.md`, `SPEC.md`, `REVIEW.md`, ready for the planning summary commit. No pre-existing dirty work or implementation changes.

## done this session

- Prepared fresh remediation cycle; no retained cycle/backlog to replace. Research and intended contracts recorded in PLAN existing assets and SPEC §I.16, §I.54, §I.58, §I.61.
- Preserved RC1/RC2 reproductions, verification limits and follow-up obligations in REVIEW.md. Review-plan resolved card-payment inheritance, untouched-editor handling, fixture ownership and proxy test/configuration details; planning gate GO with zero open BLOCK/DIVERGENCE/blocking UNKNOWN.
- No F1–F3 execution task completed. Original implementation gate remains NO-GO: RC1 BLOCK and RC2 DIVERGENCE.

## in progress (exact stop point)

none — planning complete and implementation unstarted; ready for F1.T1.
mid-edit files: none.

## next

F1.T1 | preconditions: planning GO; `/cook` validates relevant recorded research and starts the shared-service compatibility changes in `server/dataService.js`. No unresolved decision or research blocker; reassess affected evidence if relevant sources/requirements change.

## deviations & decisions

- Existing long names preserved; new/changed names remain capped. Card Add Payment needs an exact same-store legacy-name inheritance exception; caller-supplied linkage alone never qualifies. Untouched inline drafts must close before trimming without a PUT. No destructive migration.
- Express proxy trust defaults off; explicit IP/CIDR allowlist uses existing Express matching. Keep Host-origin handling, demo isolation and both active limiters. Deployment addresses are configured by the operator when enabling the feature.
- F1 and F2 are independent in behavior but executed sequentially because their tests/changelog share files. No agents assigned. F3 remains last.

## watchouts

- Tests/implementation are unchanged and RC1/RC2 remain open. Historical REVIEW.md closure does not prove these cases; planning GO establishes readiness only. Implementation acceptance waits for F3.
- Runtime paths, approved-execution history and baseline verification limits are in PLAN existing assets. Browser fixture server must use its own temporary directory and teardown; never seed real finance data.
- Node fetch did not preserve custom Host in the initial proxy smoke probe; use node:http for those assertions. A corrected probe and real-entrypoint container smoke passed; the missing Secure flag and shared quota were independently reproduced.
- No outstanding worker, user decision or external deployment prerequisite. No final verification rows until F3.

## final verification

item|status|evidence|decision
|---|---|---|---|
