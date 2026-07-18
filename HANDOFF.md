# HANDOFF 2026-07-18

branch main | last commit fad7b0d feat(mobile): reorder layout + 44px touch targets (T24) | tests none (no runner, T12 todo)
baseline green (client builds) | oracle `npm run build` in `client/`
uncommitted: none

## done this session

- docs: apply review-plan findings (R6-R14, sharpen V19/V20); T23 audit done → 3505425
- F2 mobile fixes (T24): App grid flat children → mobile order balance→timeline→forms→settings + lg 2-col tier, desktop 3-col preserved via explicit col/row placement; delete btns + dark-toggle + DatePicker nav/day-cells/today ≥44px via min-h-11/min-w-11 → fad7b0d

## in progress (exact stop point)

- (⊥ mid-edit) | NEXT STEP: run F3 consistency (T25) — start step 1: extract debit/credit type-toggle pair (§R9) shared, replace `RecurringList.jsx:272-295` & `TransactionForm.jsx:81-104`

## next

F3 consistency (T25) | preconditions: none (F2 done). §V.20 acceptance bar. then F4 final verify (T26)

## deviations & decisions

- review-plan docs (R6-R14, V19/V20) were uncommitted at session start → committed as 3505425 baseline before F2 (PLAN.md updated: y, prior)
- EOL trap: HEAD App.jsx + GlobalSettings.jsx had MIXED line endings (few bare-LF among CRLF); Edit tool normalizes whole file → CRLF ∴ spurious EOL-only hunks. Fixed via scratchpad `fix_eol.py` (difflib: keep HEAD EOL on unchanged lines). F2 diff clean.

## watchouts

- EOL: ∀ future Edit to a mixed-EOL file → re-run scratchpad `fix_eol.py <path>` before commit to strip phantom EOL hunks. Fully-CRLF files (BalanceTimeline/DatePicker/RecurringList/RecurringCreditCards) ⊥ affected.
- F3 step 4 delete-btn extract → shared component ! bake ≥44px (F2 already set min-h-11/min-w-11 @ 3 delete sites: RecurringList:144, RecurringCreditCards:202 (+flex-shrink-0), BalanceTimeline:71); ⊥ regress the 44px
- F3 step 5 removes dead files: `TransactionList.jsx` (+App.jsx:11 import) (§R6), `DarkModeToggle.jsx` (§R7); live dark-toggle stays inline in GlobalSettings
- F3 submit-btn slate clone @ 5 sites (§R8): RecurringList:299, TransactionForm:118, RecurringCreditCards:230,256,367
- dark mode ∀ new style ! carry `dark:` variant (#1f1f1f/#2a2a2a/#333333); i18n ∀ visible string ! via `t()`, prefer zero new strings
- V18 verified statically (no headless browser): only fixed widths ≥360px = BalanceTimeline table minWidth 480px (in overflow-x-auto) + DatePicker popup max-w-80=320px; both contained. scrollWidth check ⊥ run in browser.

## final verification

item|status|evidence|decision
-|-|-|-
