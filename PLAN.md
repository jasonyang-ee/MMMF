# PLAN

goal: mobile-friendly UI + component consistency sweep across ∀ 11 client components

## ground rules

- quality contract: ∀ phase → evidence named, ⊥ "looks good" as done criteria
- verify-first: `npm run build` (client) green ∀ phase; manual viewport check @ 390px & 360px via browser devtools
- smallest codebase-consistent change; Tailwind v4 utilities + shared classes in `client/src/index.css`; ⊥ new UI framework (§C)
- ⊥ touch server code; scope = `client/src/` only
- SPEC §V.18-20 = acceptance bar; drift → update spec via /spec, ⊥ silent
- commit per phase, single summary commit style, ⊥ co-author trailer
- ORDERING COUPLING: F2 step 2 (touch targets on delete btns) & F3 step 4 (extract delete-btn → shared) overlap @ same sites (R11) → F3 ! centralize/preserve the ≥44px F2 set (⊥ regress); prefer sizing shared component once
- dark mode: ∀ new style ! carry `dark:` variant matching `#1f1f1f/#2a2a2a/#333333` palette; i18n: ∀ new visible string ! via `t()` (4 langs), prefer zero new strings

## review-plan status (2026-07-18)

F1 audit RESOLVED by /review-plan research gate → findings sourced in SPEC §R6-R14. F1 = removal candidate on next /cook. F2/F3 below carry exact file:line targets from that audit. workonplan may start @ F2.

## existing assets

- viewport meta present (`client/index.html:6`); iOS zoom guard + `.mobile-compact-table` + tap-highlight reset in `client/src/index.css:151-176`
- shared classes exist: `.btn .btn-primary .btn-secondary .btn-danger .card .input .label .transaction-item` (`client/src/index.css:24-63`)
- App layout: `grid-cols-1 min-[1420px]:grid-cols-[320px_1fr_384px]` (`client/src/App.jsx:357`) — single breakpoint; <1420px ∀ stacks 1-col, order = settings sidebar → timeline → forms ∴ timeline (primary content) buried mid-page on mobile (§R13)
- BalanceTimeline table: `minWidth: 480px` + `overflow-x-auto` wrapper — h-scroll contained OK (§R14)
- DatePicker popup `w-[calc(100vw-2rem)] sm:w-80 max-w-80` — fits 360px OK (§R14)

## phase order

id|goal|depends|exit
F1|audit ∀ components mobile+consistency (DONE by /review-plan → §R6-R14)|-|RESOLVED; removal candidate next /cook
F2|mobile responsive fixes|F1|§V.18-19 hold @ 360/390px, build green
F3|consistency unification|F2|§V.20 holds, build green, zero visual regression desktop
F4|final verify UI vs spec|F3|§V.18-20 classified HOLD w/ evidence, HANDOFF.md updated

## F1 audit — RESOLVED

task: T23
status: audit complete via /review-plan static read of `client/src`; catalog → SPEC §R6-R14. ⊥ unknowns left `?`.
key findings:
- dead code: `TransactionList` import+file (§R6); `DarkModeToggle.jsx` dead + dark-toggle logic dup inline in GlobalSettings (§R7) — NEW, ⊥ in original plan
- clones: submit-btn slate @ 5 sites (§R8); debit/credit toggle pair (§R9); add/cancel header link (§R10); delete-icon-btn + trash svg @ 4 sites (§R11)
- touch <44px: dark-toggle switch, delete btns, DatePicker nav + day cells (§R12)
- layout: single breakpoint → timeline buried mobile (§R13); body-h-scroll risk LOW ∴ main V18 work = order + breakpoint (§R14)
next: F2

## F2 mobile fixes

task: T24
goal: §V.18-19 hold — sane 1-col order, ≥44px targets, ⊥ body h-scroll
inputs: SPEC §R11-R14
steps:
1. App.jsx grid (`App.jsx:357-427`): add intermediate 2-col tier (e.g. `lg:`) between 1-col & `min-[1420px]` 3-col; fix mobile source order so BalanceDisplay → BalanceTimeline → forms → settings. NOTE: current left-sidebar div groups BalanceDisplay+ForecastSettings+GlobalSettings (`App.jsx:359-387`) ∴ pure `order-*` can't split BalanceDisplay from settings — restructure grouping | use `order` on flattened children. pick smallest-diff approach
2. touch targets → ≥44px via `min-h-11 min-w-11` (§V.19), keep visual icon size: delete btns `RecurringList.jsx:144`, `RecurringCreditCards.jsx:202`, `BalanceTimeline.jsx:71`; dark-toggle switch `GlobalSettings.jsx:98-105`; DatePicker nav `DatePicker.jsx:139-142,163-166`; DatePicker day cell `DatePicker.jsx:205` (`h-10`→≥`h-11`). coordinate w/ F3 step 4 (delete btn → shared)
3. fixed-width sweep ≤390px — §R14 says risk LOW; confirm ⊥ new overflow; keep table h-scroll inside container only
4. DatePicker popup — §R14 says fits 360px; verify @ 360px, adjust only if clipped
5. build + devtools verify @ 360/390/768/1420px
verify: `npm run build` green; devtools console `document.documentElement.scrollWidth <= window.innerWidth` = true @ 360px (screenshot); grep touched controls carry `min-h-11`/`min-w-11` | ≥44px padding
exit: §V.18-19 HOLD w/ evidence
next: F3

## F3 consistency

task: T25
goal: §V.20 holds — one source of truth per UI pattern
inputs: SPEC §R6-R11
steps:
1. extract debit/credit type-toggle pair (§R9) → shared component | class, parametrized size (`py-2 px-3 text-sm` vs `py-2.5 px-4`); replace `RecurringList.jsx:272-295` & `TransactionForm.jsx:81-104`
2. replace inline submit-btn slate clones (§R8) w/ `.btn` variant (add `.btn-submit` to `index.css` if needed): `RecurringList.jsx:299`, `TransactionForm.jsx:118`, `RecurringCreditCards.jsx:230,256,367`
3. dedup add/cancel header toggle-link (§R10) → shared class: `RecurringList.jsx:223-228`, `RecurringCreditCards.jsx:331-336`
4. dedup delete-icon-btn + trash svg (§R11) → shared component baking ≥44px hit area (carries F2 step 2 sizing, single source): `RecurringList.jsx:144`, `RecurringCreditCards.jsx:202`, `BalanceTimeline.jsx:71`
5. remove dead code: TransactionList import `App.jsx:11` + file `client/src/components/TransactionList.jsx` (§R6); file `client/src/components/DarkModeToggle.jsx` (§R7, dead — live dark-toggle stays inline in GlobalSettings as single source)
6. normalize heading/spacing/text-size scale across cards per catalog
7. build + visual diff desktop + mobile — zero unintended regression
verify: grep shows ⊥ `bg-slate-600` in `client/src/components`; ⊥ `TransactionList`/`DarkModeToggle` refs remain; `npm run build` green
exit: §V.20 HOLD w/ evidence
next: F4

## F4 final verify

task: T26
goal: prove work vs SPEC + PLAN, close cycle
inputs: SPEC §V.18-20 §R6-R14 §T.23-26, this file, full diff since cycle start
steps:
1. re-read §V.18-20 (V19/V20 sharpened 2026-07-18), touched phases; run `npm run build`
2. classify §V.18, §V.19, §V.20 → HOLD | VIOLATE | UNVERIFIABLE w/ file/devtools/grep evidence
3. sweep full diff: logic correctness, unneeded complexity, missed reuse, incoherence — cite ∀ finding
4. drift found → decide code | spec change, execute
5. update `CHANGELOG.md` `[Unreleased]`; flip §T.23-26 → x via /spec; record result table in HANDOFF.md
verify: result table complete, ∀ §V classified, build green
exit: cycle done, ready for /garnish
next: -
