# PLAN

goal: mobile-friendly UI + component consistency sweep across ∀ 11 client components

## ground rules

- quality contract: ∀ phase → evidence named, ⊥ "looks good" as done criteria
- verify-first: `npm run build` (client) green ∀ phase; manual viewport check @ 390px & 360px via browser devtools
- smallest codebase-consistent change; Tailwind v4 utilities + shared classes in `client/src/index.css`; ⊥ new UI framework (§C)
- ⊥ touch server code; scope = `client/src/` only
- SPEC §V.18-20 = acceptance bar; drift → update spec via /spec, ⊥ silent
- commit per phase, single summary commit style, ⊥ co-author trailer

## existing assets

- viewport meta present (`client/index.html:6`); iOS zoom guard + `.mobile-compact-table` + tap-highlight reset in `client/src/index.css:151-176`
- shared classes exist: `.btn .btn-primary .btn-secondary .btn-danger .card .input .label .transaction-item` (`client/src/index.css:24-63`)
- App layout: `grid-cols-1 min-[1420px]:grid-cols-[320px_1fr_384px]` (`client/src/App.jsx:357`) — single breakpoint; <1420px ∀ stacks 1-col, order = settings sidebar → timeline → forms ∴ timeline (primary content) buried mid-page on mobile
- BalanceTimeline table: `minWidth: 480px` + `overflow-x-auto` wrapper — h-scroll contained OK
- known smells: submit buttons in `RecurringList.jsx:299` & `TransactionForm.jsx:118` duplicate slate inline styles ∉ `.btn*`; debit/credit type-toggle button pair duplicated `RecurringList.jsx:272-295` & `TransactionForm.jsx:81-104`; delete buttons `p-0.5`/`p-1` + `w-4 h-4` icons < 44px targets; `alert()`/`window.confirm()` for validation/confirm; `TransactionList` imported `App.jsx:11` but ⊥ rendered — dead?
- no test runner in repo (T12 todo) ∴ verification = build + lint (if present) + manual viewport evidence

## phase order

id|goal|depends|exit
F1|audit ∀ components mobile+consistency, finalize fix list|-|findings → §R via /spec, F2/F3 steps refined
F2|mobile responsive fixes|F1|§V.18-19 hold @ 360/390px, build green
F3|consistency unification|F2|§V.20 holds, build green, zero visual regression desktop
F4|final verify UI vs spec|F3|§V.18-20 classified HOLD w/ evidence, HANDOFF.md updated

## F1 audit

task: T23
goal: full catalog of mobile + consistency defects, ∀ 11 components
inputs: `client/src/components/*.jsx`, `client/src/App.jsx`, `client/src/index.css`, SPEC §V.18-20
steps:
1. read remaining unaudited components: `Header.jsx`, `BalanceDisplay.jsx`, `ForecastSettings.jsx`, `GlobalSettings.jsx`, `DatePicker.jsx`, `RecurringCreditCards.jsx`, `TransactionList.jsx`, `DarkModeToggle.jsx`
2. run app (`./start.sh` | `npm run dev` in client), devtools 360px/390px/768px: catalog ∀ h-scroll, clipped text, cramped controls, sub-44px targets per component
3. confirm `TransactionList` dead-import status; if dead → mark for removal in F3
4. catalog ∀ inline style clones vs shared classes (buttons, inputs, cards, headings, spacing scale)
5. decide mobile section order for 1-col layout (recommend: BalanceDisplay → BalanceTimeline → forms → settings)
6. log findings → §R rows via /spec; refine F2/F3 step lists w/ exact file:line targets
verify: §R rows cite file:line ∀ claim; F2/F3 updated in this file
exit: fix list complete & sourced; ⊥ unknowns left `?`
next: F2

## F2 mobile fixes

task: T24
goal: §V.18-19 hold — sane 1-col order, ≥44px targets, ⊥ body h-scroll
inputs: F1 fix list
steps:
1. App.jsx grid: add intermediate breakpoint (2-col `md:`/`lg:` tier) + mobile source-order fix (CSS `order-*` | JSX reorder) so timeline ranks high on mobile
2. enlarge touch targets: delete/edit/toggle buttons → min 44px hit area (padding | `min-h-11 min-w-11`), keep visual size via icon sizing
3. sweep ∀ fixed widths / `min-w` causing overflow ≤390px; keep table h-scroll inside container only
4. DatePicker: verify calendar popup fits 360px viewport, adjust positioning if clipped
5. build + devtools verify @ 360/390/768/1420px
verify: `npm run build` green; screenshot/devtools evidence ⊥ body h-scroll @ 360px; targets measured ≥44px
exit: §V.18-19 HOLD w/ evidence
next: F3

## F3 consistency

task: T25
goal: §V.20 holds — one source of truth per UI pattern
inputs: F1 clone catalog
steps:
1. extract debit/credit type-toggle pair → shared component | shared class; replace both call sites
2. replace inline submit-button slate clones w/ `.btn` variant (add `.btn-submit` to index.css if needed)
3. normalize heading/spacing/text-size scale across cards per F1 catalog
4. remove dead `TransactionList` import (+ component file if confirmed unused)
5. build + visual diff desktop + mobile — zero unintended regression
verify: grep shows ⊥ remaining inline clones of shared patterns; build green
exit: §V.20 HOLD w/ evidence
next: F4

## F4 final verify

task: T26
goal: prove work vs SPEC + PLAN, close cycle
inputs: SPEC §V.18-20 §T.23-26, this file, full diff since cycle start
steps:
1. re-read §V.18-20, touched phases; run `npm run build`
2. classify §V.18, §V.19, §V.20 → HOLD | VIOLATE | UNVERIFIABLE w/ file/devtools evidence
3. sweep full diff: logic correctness, unneeded complexity, missed reuse, incoherence — cite ∀ finding
4. drift found → decide code | spec change, execute
5. update `CHANGELOG.md` `[Unreleased]`; flip §T.23-26 → x via /spec; record result table in HANDOFF.md
verify: result table complete, ∀ §V classified, build green
exit: cycle done, ready for /garnish
next: -
