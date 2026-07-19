# HANDOFF 2026-07-18

branch main | last commit be955ea verify(ui): final verify V18-20; toggle 44px + refine V19 (T26) | tests none (no runner, T12 todo)
baseline green (client builds) | oracle `npm run build` in `client/`
uncommitted: none

## done this session

- F3 consistency (T25): completed prior session's partial F3 → dedup RecurringCreditCards 3 slate submit btns → `.btn btn-submit`, header link → `.btn-link`, delete → `DeleteButton`; BalanceTimeline delete → `DeleteButton` (iconSize `w-5 h-5`); removed dead `TransactionList` (App.jsx:11 import + file) + `DarkModeToggle` file; added `.btn-submit`/`.btn-link` to index.css → a1e4a64
- F4 final verify (T26): classified §V.18-20; found V19 gap → user chose fix+refine → added `min-h-11` to shared `TypeToggle` (both variants ≥44px); refined §V.19 scope → be955ea

## in progress (exact stop point)

- (⊥ mid-edit) | NEXT STEP: run `/garnish` — cycle complete, purge PLAN.md + HANDOFF.md, keep SPEC.md
mid-edit files: none

## next

/garnish (cycle done, all §T.23-26 = x) | preconditions: none

## deviations & decisions

- prior interrupted session left uncommitted+undocumented partial F3 (TypeToggle.jsx + DeleteButton.jsx + RecurringList/TransactionForm done) → adopted & completed rather than discard (clean, on-plan). Not in prior HANDOFF.
- EOL trap on App.jsx: mixed-EOL despite `grep -c` showing all-CRLF (git blob differs) → Edit normalized whole file → phantom CRLF hunks. Fixed via byte-level single-line splice (restore HEAD + python binary remove). GlobalSettings.jsx also mixed but untouched.
- F3 step 6 (normalize heading/spacing) = verified NO-OP: §R6-R11 produced no typography finding; headings already coherent. Deliberate deferral-with-reason.
- user decided: V19 gap → fix shared TypeToggle to ≥44px + refine §V.19 scope (⊥ mass-edit click-to-edit rows). §V.19 amended via /spec.

## watchouts

- EOL: future Edit to `App.jsx` | `GlobalSettings.jsx` (mixed-EOL) → byte-level splice | difflib keep-HEAD-EOL to avoid phantom CRLF hunks. Fully-CRLF files unaffected.
- §V.18 runtime `scrollWidth <= innerWidth` @360/390px never run in a real browser (no headless) — only static evidence. Confirm dynamically if browser available.
- T12 (test runner + lint in CI) still todo — no automated tests; build = only oracle.

## final verification

item|status|evidence|decision
V18|HOLD (static)|no fixed-width content added F2-F4; BalanceTimeline table minWidth 480px inside `overflow-x-auto`; DatePicker popup ≤320px; runtime scrollWidth check ⊥ run (no browser)|-
V19|HOLD (refined)|discrete tap controls ≥44px: DeleteButton/DatePicker nav/GlobalSettings toggle `min-h-11 min-w-11`, DatePicker day cell `h-11`, TypeToggle `min-h-11`; inline click-to-edit rows exempt|SPEC (V19 scope refined)
V20|HOLD|single-source greps: trash svg=DeleteButton, active toggle=TypeToggle, `.btn-submit`/`.btn-link`=index.css, `bg-slate-600`=0 in components; dead files removed; dark-toggle single source|-
