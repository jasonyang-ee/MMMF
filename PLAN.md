# PLAN

goal: restore v1.1.4 3-col layout (`doc/screenshotFull.png`) in `App.jsx`; 3-col appears ≥1100px (was 1420), ⊥ 2-col intermediate tier → fix user-reported broken core layout (B6/V23).

## ground rules
- root cause (diagnosed): `fad7b0d` (T24) replaced v1.1.4 `<main>` grid w/ mobile-first flat-children grid + `lg:grid-cols-2` intermediate tier (1024-1419px) + `min-[1420px]` 3-col. user window <1420px → 2-col, ⊥ v1.1.4 3-col.
- user decision: want v1.1.4 3-col arrangement (Left=Balance+Forecast+Global \| Center=Timeline \| Right=Cards+Recurring+Add); 3-col ! appear at narrower widths → breakpoint lowered 1420→1100; <1100 → single-col stack (v1.1.4 DOM order accepted).
- SURGICAL: change ONLY `App.jsx` `<main>` grid block (+ 1 CHANGELOG line). ⊥ touch child components. KEEP fad7b0d touch-target/overflow tweaks (BalanceTimeline/DatePicker/GlobalSettings/RecurringCreditCards/RecurringList) + a1e4a64 (T25) shared components — none live in the grid.
- invariants: V18 overflow container (`BalanceTimeline.jsx:33`) + V19 touch targets + V20 shared classes all in child comps → untouched by grid revert ∴ ⊥ regress. V23 new = codifies restored layout.
- verify-first: oracle = `cd client && npm run build` green + visual drive (run skill) @ ≥1100px → 3-col & <1100px → stack & ⊥ horizontal body scroll.
- ∀ phase ends green + self-reviewed + committed w/ named evidence. ⊥ Claude co-author trailer.
- close: flip §T (T33), update CHANGELOG `[Unreleased]`, refresh HANDOFF.

## existing assets
- v1.1.4 target markup: `git show v1.1.4:client/src/App.jsx` — `<div className="grid grid-cols-1 min-[1420px]:grid-cols-[320px_1fr_384px] gap-4 sm:gap-6">` w/ 3 grouped divs: Left `space-y-6`(BalanceDisplay,ForecastSettings,GlobalSettings) \| Center `min-w-0`(BalanceTimeline) \| Right `space-y-6`(RecurringCreditCards,RecurringList,TransactionForm).
- current broken markup: `App.jsx:362-430` — `grid grid-cols-1 lg:grid-cols-2 min-[1420px]:grid-cols-[320px_1fr_384px] items-start` + flat children w/ `lg:col-start-* min-[1420px]:col-start-*` placement.
- current ≥1420 3-col placement ALREADY = v1.1.4 arrangement (col1=Balance+Settings, col2=Timeline, col3=Forms) → only the `lg` 2-col tier + 1420 breakpoint are the defect.
- fad7b0d scope: `App.jsx` (grid ONLY) + child comps (touch/overflow) + CHANGELOG + SPEC. a1e4a64: shared comps only.
- CHANGELOG `[Unreleased]` line "Mobile layout now surfaces the account balance and forecast timeline first... added an intermediate two-column tier" → now FALSE post-revert, ! fix (unreleased ∴ editable).
- §V23 (new), §R13 supersession note, §B6, §T33 in SPEC.
- breakpoint math @1100: 320+384 sidebars + 2×24px gap = 752 → center ≈348px; Timeline table `minWidth:480px` scrolls inside own `overflow-x-auto` container (V18 safe). tight but functional.

## phase order
id|goal|depends|exit
F1|research: confirm exact v1.1.4 markup + revert scope + breakpoint fit + ⊥ invariant conflict|-|scope locked, F2 markup 1:1, ⊥ open `?`
F2|impl: revert App.jsx `<main>` grid → v1.1.4 grouped 3-col @ min-[1100px]; fix CHANGELOG line|F1|build green, markup = v1.1.4+breakpoint, child comps untouched, self-reviewed
F3|final verify: drive app @≥1100 & <1100; classify V23/V18/V19/V20 HOLD; confirm touch/shared work intact|F2|3-col ≥1100 + stack <1100 + ⊥ body h-scroll; invariants HOLD w/ evidence

## F1 research
task: T33
goal: lock exact revert markup + breakpoint before editing.
inputs: `git show v1.1.4:client/src/App.jsx`, current `App.jsx:349-434`, `git show fad7b0d -- client/src/App.jsx`, `BalanceTimeline.jsx:33-36`, `CHANGELOG.md`.
steps:
1. confirm v1.1.4 `<main>` grid block markup verbatim (grouped 3 divs, class strings) → this is the F2 target minus breakpoint.
2. confirm the ONLY App.jsx delta from fad7b0d = the `<main>` grid; ⊥ other App.jsx logic changed by fad7b0d/a1e4a64 → revert is grid-block-only.
3. confirm breakpoint swap `min-[1420px]`→`min-[1100px]` fits: sidebars 320+384 + gaps < 1100; Timeline center scrolls its own container (V18) ⊥ body scroll. record center px.
4. confirm V18/V19/V20 carriers all in child comps (⊥ `<main>` grid) → revert ⊥ touch them. cite files.
5. identify exact CHANGELOG `[Unreleased]` line(s) to rewrite (the "Mobile layout now surfaces..." + "intermediate two-column tier" claim).
verify: F2 markup maps 1:1 to v1.1.4 block w/ only breakpoint changed; ⊥ open `?`.
exit: scope locked. if v1.1.4 markup ambiguous → record `?` + stop.
next: F2

## F2 implement
task: T33
goal: revert grid to v1.1.4 grouped 3-col, breakpoint 1100, keep everything else.
inputs: F1 findings; `client/src/App.jsx`, `CHANGELOG.md`.
files: `client/src/App.jsx` (`<main>` block only), `CHANGELOG.md`.
steps:
1. replace `App.jsx` `<main>` grid block (`<div className="grid ...">…</div>`) w/ v1.1.4 grouped-3-col structure: container `grid grid-cols-1 min-[1100px]:grid-cols-[320px_1fr_384px] gap-4 sm:gap-6`; Left div `space-y-6` = BalanceDisplay+ForecastSettings+GlobalSettings; Center div `min-w-0` = BalanceTimeline; Right div `space-y-6` = RecurringCreditCards+RecurringList+TransactionForm. remove `lg:grid-cols-2`, `items-start`, ∀ `lg:`/`min-[1420px]:` col/row placement + the reorder comment. keep ∀ component props identical.
2. rewrite `CHANGELOG.md` `[Unreleased]` mobile-layout line → reflect restored v1.1.4 3-col layout w/ lower (1100px) breakpoint; ⊥ leave stale "surfaces balance+timeline first / two-column tier" claim.
3. `cd client && npm run build` → green.
verify: build green; `git diff` shows ONLY `<main>` block + CHANGELOG changed; child comps ⊥ in diff; grid = v1.1.4 + `min-[1100px]`; ∀ 8 components still rendered w/ same props.
exit: grid reverted, CHANGELOG fixed, build green, self-reviewed diff.
next: F3

## F3 final verify
task: T33
goal: prove V23 holds + ⊥ regression of V18/V19/V20.
inputs: touched files, §V23/V18/V19/V20, `doc/screenshotFull.png`.
steps:
1. re-read §V23, §V18, §V19, §V20.
2. `cd client && npm run build` → record.
3. drive app (run skill) @ width ≥1100 → screenshot; confirm 3-col = Left(Balance+Forecast+Global)\|Center(Timeline)\|Right(Cards+Recurring+Add) matching `doc/screenshotFull.png`.
4. drive @ width <1100 (e.g. 900 + ≤390) → confirm single-col stack + ⊥ horizontal body scroll (V18); Timeline table scrolls own container.
5. grep child comps for `min-h-11`/`min-w-11` touch targets (V19) + shared `.btn*`/`.input`/`.card` (V20) still present (⊥ removed by revert).
6. classify V23/V18/V19/V20 = HOLD \| VIOLATE \| UNVERIFIABLE w/ file/screenshot evidence; record table in HANDOFF.
verify: build green + 3-col ≥1100 + stack <1100 + ⊥ body h-scroll + touch/shared intact + V23 HOLD.
exit: cycle done → ready for /garnish.
next: -
