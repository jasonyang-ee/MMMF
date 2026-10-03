<!-- PLAN FORMAT (baked by /encode-docs — keep; makes this file self-describing)
One cycle. Update in place during execution; replace wholesale only for an authorized new/superseding cycle. Durable truth → SPEC.md.
Order: goal | ground rules | existing assets (prior research) | phase order | phase sections.
Prior research: scope/questions | findings/decisions | local paths + relevant revisions/dirty inputs | external URLs/check dates when applicable | unknowns + gate.
Phase ids F1..Fn; numbered research optional when current evidence covers scope. Research precedes dependent coding; final verification last. Failed verification reopens affected work before recheck.
Each phase: goal | inputs | files | dependencies/gates | §T tasks (≥1) | verify | exit | next.
Tasks: T<n> unique/monotonic within phase. Status: . todo | ~ in progress | x verified done. Preserve ids and valid F<n>.T<n> pointers within cycle.
Remove redundant research only when unstarted with no execution/assignment evidence; retain other ids (gaps valid), history, and statuses; repair all references. Planning never marks execution tasks done.
Execution state: prep writes new; cook/cater validate relevant research before new→work-in-progress, direct work, or dispatch. Missing/stale evidence → main-agent review-plan first; consequential unknowns block dependent coding.
Recheck affected assumptions; refresh research only when findings/decisions no longer support selected work. Unrelated changes and verified planned edits preserving that support do not stale research.
handoff requests done only when all tasks x and nonempty final evidence covers goal/contracts with HOLD.
Reopened work → work-in-progress. garnish resets header-only new. Empty new → /prep; done → /garnish. prep queues requests during active execution unless user supersedes cycle.
Symbols: → leads to | ∴ therefore | ∀ every | ∃ exists | ! required | ? unknown/optional | ⊥ forbidden/absent | ≠ differs | ∈ member | ∉ not member | ≤ at most | ≥ at least | & and | § section.
Preserve literals, conditions, negation, uncertainty, quantities, and requirement strength. Tables need delimiter rows.
Executable without chat history. Full rules: /encode-docs.
planning status: done
-->

# PLAN

goal: resolve review findings RC1 (legacy-name account lockout) and RC2 (Express proxy identity/TLS handling), preserve data/security contracts, and replace the implementation NO-GO with evidenced verification.

## ground rules

- User authorized the full remediation cycle via `/cook`. No cycle reset or inherited completion ticks; execute all phases in order and make one reviewed summary commit per repository policy.
- Scope: stored names >200, their ordinary edits/deletes and linked card payments; explicit Express proxy trust; meaningful regressions; deployment guidance and review/changelog reconciliation. No storage redesign, new dependency, UI redesign or generalized repair of other invalid historical fields.
- Preserve stored names verbatim unless the user changes/deletes them; no automatic truncation or data migration. New/changed names retain the current 200-character validation semantics except verified inheritance under SPEC §I.58. All other field/metadata validation and the 100 KiB request limit remain active.
- Preserve `Date.now().toString()` IDs, protected metadata, atomic serialized file writes, demo isolation and KV limitations (SPEC §V.1–2, §V.9–11, §V.32–34). A card lookup is scoped to the same store; no cross-file transaction or stronger KV consistency claim.
- Proxy trust is opt-in through SPEC §I.61, configured before limiters/session middleware. Keep both limiters and their validation enabled. Preserve raw Host/Origin checks; proxy must overwrite forwarded IP/protocol headers. Deployment-specific proxy addresses are operator configuration, not a blocker to implementation.
- F1 and F2 are behaviorally independent but share `tests/api.test.js` and CHANGELOG.md; execute sequentially in listed order. No agent assignments. Final verification remains F3; failures reopen the owning task before affected checks repeat.
- Use disposable fixtures/directories/containers only. No real `data/` reads or writes, deployment, push or tag. Update `[Unreleased]` when fixes land; follow repository commit policy. Encoded writes use encode-docs.

## existing assets

review record: `REVIEW.md` → “Follow-up code review — 2026-10-03” retains accepted findings, reproduction steps, verification limits and original gate outside cycle-reset files.

local evidence: release baseline `v1.1.5` = `b45a74c6f33ae2631aa5a67d3356350f10c04c4a`; reviewed implementation HEAD `61205993ddfcdcf245a7eb0fbf4c51e0d37154a9`, branch `main`, clean before planning. Only planning/spec/review documents change during prep; runtime/test evidence remains current for this source revision.

execution evidence: 2026-10-03 `/cook` checked clean `main` at `984d4ba`; diff from the researched runtime revision contains only planning/spec/review documents. F1 research and gates remain valid. Phase batons kept current; one final summary commit follows repository policy. F1: eight new adapter cases first reproduced six expected failures, then full `npm test` passed 30/30. The new Chromium case first reproduced untouched-name save failure, then full `npm run test:ui` passed 9/9 after both editor fixes. F2 selection: F1 changes preserve all proxy research assumptions; installed Express/limiter sources and current primary documentation rechecked; no new unknowns. F2: five proxy cases first reproduced four expected failures, then full `npm test` passed 35/35; scoped matching/startup/cookies/quota/spoof assertions inspected. `docker compose config --quiet` passed; docs match parser tests and leave trust commented out. F3: final Chromium 9/9, frontend/Worker/Pages builds, Docker build/real-entrypoint smoke, Bash/ShellCheck/Compose, audit (0), manifest/lock and diff checks passed. Full owned diff/callers reviewed; all five tasks complete. Contract evidence and verification limits are in HANDOFF.md and REVIEW.md; no remaining gate.

prior research:

id|covered question & evidence|decision / consequence
|---|---|---|
RC1|`server/dataService.js:14–15,77–80,113–136,153–180`: every stored item passes new-write name validation before read/update/delete. Baseline `server/index.js` accepted descriptions without this cap; baseline UI had no `maxLength`. Disposable 201-character recurring-name fixture → Express/Hono GET 500, Express DELETE 500, App startup “Could not load your data.”|Separate stored-name compatibility from new/changed-name validation. Relax only the stored length cap; keep nonblank string and every other validation. Preserve omitted/identical names during PUT; validate a changed name strictly. Cover all three collections, other-record mutations and clear-all. F1.T1.
RC1-card|`client/src/components/RecurringCreditCards.jsx:83–88` copies the card name into a new debit; shared create validates before looking up any card. Planning probe on unchanged HEAD → `400 Invalid name` for an existing long-name card payment.|Read compatibility alone leaves Add Payment broken. Only a debit with a valid decimal card ID and exact existing long card name in the same account/session may inherit the name. No general bypass based on caller-supplied `creditCardId`; no new requirement for short-name/orphaned historical links. F1.T1–T2.
RC1-editor|`RecurringList.jsx:52–61` and `RecurringCreditCards.jsx:44–53` trim drafts before comparing with stored names. An untouched legacy name with surrounding whitespace would therefore be sent as a changed name on blur.|Compare raw draft to stored name before trimming; unchanged draft closes without a write. Keep strict validation for actual renames, Enter/blur deduplication and Escape cancellation. Cover both editors in F1.T2.
RC2|`server/app.js:19–33,56–61,119–125`, `server/index.js:11`: default proxy trust false; plain HTTP listener. Disposable forwarded HTTPS probe → no Secure attribute. 300 requests from forwarded client A → client B's first request 429; log `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`.|Add scoped opt-in `TRUST_PROXY`, applied before middleware; retain existing req.ip/req.secure consumers and limiters. Test trusted, untrusted, direct and chained forwarding behavior. F2.T1.
API/test reuse|`createDataService` already serves Express/Hono; adapters supply scoped stores and mutation queues. `tests/api.test.js` has disposable file/KV fixtures and parity, corruption, metadata, concurrency, session and limiter cases. `tests/browser/app.spec.js` has actual startup/inline/payment flows.|Keep policy in shared data service. Seed pre-existing records directly into disposable fixtures; creating them through the newly restricted POST would not test upgrades. Browser case owns an ephemeral Express server with fixed settings, seeded fixture files and teardown; no change to production/demo seeding APIs or Playwright global config.
Proxy API research|Installed Express `lib/request.js`/`lib/utils.js`, `proxy-addr/index.js`; official sources below. In-memory Express allowlist `127.0.0.1/32,::1/128` matches IPv4, mapped loopback and IPv6 loopback, excludes `203.0.113.1`. Node 24 `net.isIP` recognizes literal IPv4/IPv6 and rejects `true`, `1`, `*`.|Use `node:net` in an Express-only helper, Express's existing trust compiler for matching, and explicit decimal CIDR prefix checks (1–32 IPv4, 1–128 IPv6). No new dependency, numeric-hop shorthand or named subnet aliases. Fail startup on bad configuration; do not silently fall back to permissive trust.

external evidence (checked 2026-10-03): [Express behind proxies](https://expressjs.com/en/guide/behind-proxies/) documents scoped addresses/subnets, nearest untrusted client selection and forwarded protocol; [express-rate-limit error codes](https://express-rate-limit.mintlify.app/reference/error-codes#err-erl-unexpected-x-forwarded-for) documents shared quotas with trust disabled and spoofing risk from blanket trust. Original planning Node documentation fetch failed; execution rechecked https://nodejs.org/api/net.html#netisipinput on 2026-10-03 successfully. Installed Node 24 `net.isIP`/Express prototypes above directly verify the selected API behavior.

baseline verification (fresh in preceding review, reused at identical runtime HEAD): `npm test` 22/22; `npm run test:ui` 8/8 Chromium; `npm run build`, `npm run build:worker`, `npm run build:pages`; Docker build + real-entrypoint static/API/demo smoke; `bash -n start.sh release.sh`, `shellcheck start.sh release.sh`; `npm audit` 0 vulnerabilities; manifest/lock alignment and CRLF-aware diff check pass. Focused RC1/RC2 probes fail the required behavior despite these green suites. Browser/editorial/live-infrastructure limits remain in REVIEW.md. No JS lint script. No claim that baseline checks prove the proposed fixes.

environment: Node 24.21.0 at `/home/sami/.nvm/versions/node/v24.21.0/bin`; prepend that directory to PATH when needed. Chromium at `/home/sami/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome` via `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. Sandbox listener `EPERM`, audit DNS `EAI_AGAIN` and Docker socket restrictions were resolved by tool-approved execution in the review; use equivalent approved execution when required. Wrangler can use `XDG_CONFIG_HOME=/tmp/mmmf-remediation-config` and `WRANGLER_SEND_METRICS=false`.

spec decisions: §I.16 now explicitly distinguishes legacy stored text from new names; §I.58 permits verified inheritance needed by the existing card workflow; new §I.61 defines the proxy setting, referenced by §I.54. Existing security/corruption/rate requirements are retained. F1/F2 now implement these prepared contracts; F3 verified them without another spec change.

unknowns & gate: consequential research resolved; planning review GO (2026-10-03), zero open planning BLOCK/DIVERGENCE/blocking UNKNOWN. Review covered scope, ordering, references, verification, ownership, migration safety, trust boundaries and feasibility. It added the card-inheritance path, untouched-editor handling and explicit fixture/Host-header strategies to avoid incomplete fixes. F3 completed: implementation gate GO; RC1/RC2 resolved with original failure evidence retained in REVIEW.md and current HOLD rows in HANDOFF.md. No deferred research phase needed. A later change to named evidence/requirements requires targeted reassessment.

## phase order

id|goal|depends|exit
|---|---|---|---|
F1|Restore long-name compatibility and payment workflow|RC1 research, SPEC §I.16–18, §I.58|Adapter and browser regressions pass; stored data preserved
F2|Configure scoped Express proxy trust|RC2 research, SPEC §I.53–54, §I.61; execution follows F1 for shared-file ownership|Trusted/untrusted proxy and limiter regressions pass; deployment instructions actionable
F3|Final verification and review closure|F1 and F2|All tasks verified; goal/contracts HOLD with current evidence; RC1/RC2 resolved

## F1 restore legacy-name compatibility

goal: existing long-name accounts load and remain usable without destructive migration or an unrestricted new-write bypass.
inputs: RC1/RC1-card evidence; SPEC §I.16–18, §I.44, §I.46–47, §I.58; existing adapter/browser test patterns.
files: `server/dataService.js`, `client/src/components/RecurringList.jsx`, `client/src/components/RecurringCreditCards.jsx`, `tests/api.test.js`, `tests/fixtures/legacy-collections.json` (new), `tests/browser/app.spec.js`, `CHANGELOG.md`.
depends: prior research covers scope; planning review GO before execution.

### §T tasks

id|status|description|cites
|---|---|---|---|
T1|x|Implement length-only stored compatibility, strict changed names and verified card-name inheritance with adapter regressions|SPEC §V.1–2, §V.9–11, §V.31–34
T2|x|Preserve untouched inline names; verify legacy loading, edits and payments in Chromium|SPEC §V.13, §V.18, §V.28–29, §V.31, §V.34

task: T1
touch: `server/dataService.js`, `tests/api.test.js`, `tests/fixtures/legacy-collections.json`, `CHANGELOG.md`.
details: distinguish stored record validation from new-name/changed-name validation without cloning whole entity validators. Existing nonblank names >200 pass reads and collection mutation checks; preserve their exact text/metadata during unrelated changes. PUT with omitted or byte-identical name retains it; changed long/blank/nonstring names remain 400. New records keep strict names except a new transaction debit whose decimal `creditCardId` and exact long name match a stored card read through this service's account/session store. No card lookup across accounts; absence/mismatch never qualifies. Existing linked payments remain editable after card deletion. Keep all other validation, storage queues, response shapes and ID protection. Add fixtures with >200-character names for each collection, including whitespace-preservation coverage and fixed in-range settings; no automatic rewrite on GET. Update `[Unreleased]` with the delivered fix.
verify: named adapter cases in `tests/api.test.js`, run for both Express and Hono: “legacy names preserve CRUD and unchanged patches”, “new and changed names retain validation”, “legacy card names require a matching same-session debit link”, “other corrupt fields still fail without storage changes”. Assert GET exact text and no write; unrelated POST and PUT work beside legacy records; omitted/identical-name PUT works; valid short rename works; invalid changed names/new ordinary 201-character names fail 400; delete/clear succeed with their existing scope. Assert inherited card name/ID preserved, wrong/missing ID, name mismatch, credit type and another demo session cannot qualify. Confirm amount/date/type/day/metadata corruption still gives 500 with original bytes/KV values intact. Run `npm test` and inspect named assertions actually executed.
exit: both adapters satisfy the new compatibility contract and retain corruption/isolation/metadata checks; fixtures available for T2.
next: F1.T2.

task: T2
touch: `client/src/components/RecurringList.jsx`, `client/src/components/RecurringCreditCards.jsx`, `tests/browser/app.spec.js`; reuse `tests/fixtures/legacy-collections.json` and update `CHANGELOG.md` if the F1 fix entry needs clarification.
details: in both inline name editors, close an unchanged raw draft without a write before trimming for an actual rename; preserve pending/deduplication, focus and Escape behavior. Add “legacy account loads, edits and pays without truncation”. Own an ephemeral `createApp` server using `fs.mkdtemp`, fixture files and fixed forecast settings; point this test's page to its dynamic loopback port. Teardown server/browser data on every outcome. Seed disk directly before startup; do not weaken POST validation or expose a fixture endpoint. Load all three legacy collections; open/blur untouched long recurring/card names with surrounding whitespace; edit a recurring amount without renaming; create a payment from the legacy card; rename an existing item to a short valid name; delete a legacy transaction. Check persisted values via the disposable API and mobile containment at 390px. No visual redesign or new localization strings.
verify: `npm run test:ui` with installed Chromium; new case passes actual UI flows, zero PUTs for untouched name editors, no startup/save alert or page error, exact API text retained until explicit rename, correct card ID/name on payment and no horizontal body overflow. Existing Enter/blur-once, failed-draft and Escape cases still pass. Inspect assertions and retain relevant failure artifacts if it fails.
exit: complete legacy workflow covered end to end; all existing browser cases still pass.
next: F2.T1.

## F2 honor scoped proxy trust

goal: HTTPS demo cookies and per-client limits work behind configured proxies; untrusted headers cannot alter identity/protocol.
inputs: RC2 research; SPEC §I.53–54, §I.61; Express/limiter primary sources; existing app factory and tests.
files: `server/proxyService.js` (new), `server/app.js`, `server/index.js`, `tests/api.test.js`, `README.md`, `docker-compose.yml`, `CHANGELOG.md`.
depends: prior research covers scope; no behavioral F1 prerequisite, but execute after F1 to serialize shared-file edits.

### §T tasks

id|status|description|cites
|---|---|---|---|
T1|x|Add explicit proxy allowlist and verify cookies, client quotas and spoof resistance|SPEC §V.2–4, §V.14, §V.32–34
T2|x|Document opt-in deployment configuration and update the changelog|SPEC §I.53–54, §I.61; §V.3–4, §V.14

task: T1
touch: `server/proxyService.js`, `server/app.js`, `server/index.js`, `tests/api.test.js`.
details: parse `env.TRUST_PROXY` using the exact §I.61 contract. Unset/whitespace-only means false; otherwise trim comma-separated literal IP/CIDR entries, reject empty tokens/boolean strings/numeric hops/aliases/wildcards/invalid addresses or decimal prefix lengths outside 1–32/1–128. Use `node:net.isIP` and Express's existing compiler; helper stays out of Hono/shared/browser imports. Configure before API/static limiters and sessions. Report invalid startup configuration with an ASCII `[ERROR] [Server]` message, exit nonzero before listening. Existing `req.secure`, `req.ip`, cookie builder, same-origin Host checks and active limiters remain the behavior owners; no direct trust in raw client headers or disabled validations.
verify: named cases “TRUST_PROXY accepts only scoped address lists”, “trusted HTTPS proxy receives Secure demo cookies”, “untrusted forwarding cannot change protocol or quotas”, “trusted clients have independent API and static quotas”. Cover IPv4, IPv6 and mapped loopback matching; malformed configuration and real entrypoint startup rejection; trusted HTTPS vs HTTP cookie flags while retaining HttpOnly/SameSite/Path/expiry and session isolation; no-trust and explicitly nonmatching peer with forged headers; nearest-untrusted-hop selection with spoofed leftmost IP. For API, A requests 1–300 → 200, A 301 → 429, B first → 200 behind a trusted proxy; untrusted changing X-Forwarded-For never resets its quota. For static routes, forwarded nonloopback A request 51 in a controlled one-second window → 429, B first → 200; direct loopback health checks remain exempt only from static limits. Assert hostile Origin still 403 and full `npm test` passes. Use `node:http` when asserting custom Host headers; the earlier Node fetch probe did not preserve its overridden Host.
exit: trusted deployment works; spoofing/direct modes retain boundaries; invalid configuration cannot silently start.
next: F2.T2.

task: T2
touch: `README.md`, `docker-compose.yml`, `CHANGELOG.md`.
details: document opt-in `TRUST_PROXY`, exact accepted/rejected syntax and disabled default. Give a commented deployment example with addresses/CIDRs marked for replacement; do not enable trust in the shipped Compose defaults. Explain using only actual proxy peers, overwriting forwarded IP/protocol headers, preserving Host or explicit ALLOWED_ORIGIN, and keeping the backend behind its trusted access boundary. Clarify Express-only setting; Cloudflare uses its existing runtime identity/protocol. Record delivered cookie/rate behavior in `[Unreleased]`.
verify: compare prose/examples with parser tests and §I.61; rendered Compose example remains valid via `docker compose config --quiet`; no trust-all example or claim of distributed edge enforcement; diff review preserves storage/access guidance.
exit: operator can configure the feature without guessing proxy-header assumptions or weakening default access.
next: F3.T1.

## F3 final verification and review closure

goal: prove both findings resolved against the final implementation and reconcile durable/cycle/review records.
inputs: all F1/F2 changes and assertions; RC1/RC2 reproduction contracts; SPEC §I.16–18, §I.44, §I.46–47, §I.53–54, §I.58, §I.61; listed invariants.
files: review all touched surfaces; write `REVIEW.md`, `PLAN.md`, `HANDOFF.md` and reconcile `SPEC.md`/`CHANGELOG.md` only on evidence.
depends: F1.T1–T2 and F2.T1–T2 complete.

### §T tasks

id|status|description|cites
|---|---|---|---|
T1|x|Run final checks and self-review; close RC1/RC2 only on fresh regression evidence|SPEC §V.1–4, §V.9–11, §V.13–14, §V.18, §V.28–29, §V.31–34

task: T1
touch: `REVIEW.md`, `PLAN.md`, `HANDOFF.md`; affected implementation/tests/docs if verification reopens their owning tasks.
details: inspect final diff and relevant callers for bypasses, implicit data changes, duplicate validators, proxy trust widening, Hono parity and test quality. Reproduce both original failures with the committed regression cases and inspect actual assertions/results. Update the persistent review addendum with resolved findings and exact verification/revision limits; retain original NO-GO evidence. Reconcile changelog/spec with delivered behavior; no closure claim while an accepted defect remains. Use handoff/encode-docs for task evidence and final table; final acceptance covers the goal and every cycle task.
verify: run `npm test`, `npm run test:ui`, `npm run build`, `npm run build:worker`, `npm run build:pages`, `bash -n start.sh release.sh`, `shellcheck start.sh release.sh`, `npm audit`, `docker compose config --quiet`, `git -c core.whitespace=cr-at-eol diff --check`. Build the Docker image locally and smoke its real entrypoint with temporary data: static/JS assets, CRUD, isolated demo sessions, trusted forwarded HTTPS cookie and distinct-client quotas; no deployment. No JS lint script exists; state that explicitly. Reuse successful task checks only if subsequent edits leave their evidence valid; record final-source relevance and rerun affected suites. Inspect new regression case counts/assertions, not exit status alone.
exit: HANDOFF final table contains current HOLD evidence for the goal, F1.T1–T2, F2.T1–T2, F3.T1 and cited contract groups; RC1/RC2 resolved, no open BLOCK/DIVERGENCE/blocking UNKNOWN. Failed checks return to the owning task; environment-blocked required checks stay UNVERIFIABLE and prevent closure. Set all tasks x and planning status done only after these conditions, then commit according to repository policy.
next: none — cycle complete only after exit criteria.
