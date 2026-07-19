# HANDOFF 2026-07-19

branch main | last commit 9402e62 verify(layout): F3 confirms V23 | tests n/a (⊥ runner, T12 todo)
baseline green | oracle `cd client && npm run build` + CDP drive @ 390/900/1100/1280px (Edge headless `--remote-debugging-port` + Node global WebSocket)
uncommitted: none (tree clean; F2=5fb59c1, F3=9402e62)

## done this session
F1 (research): locked v1.1.4 grid markup verbatim + fad7b0d scope (grid-only) + breakpoint fit → no commit (research)
F2 (impl): App.jsx `<main>` grid → v1.1.4 grouped 3-col @ `min-[1100px]`; CHANGELOG mobile line fixed → 5fb59c1
F3 (verify): CDP-measured V23/V18 HOLD; V19/V20 grep HOLD; T33 → x → 9402e62

## in progress (exact stop point)
none — T33 (whole B6/V23 layout cycle) COMPLETE. all PLAN.md phases done.
mid-edit files: none

## next
CYCLE DONE → ready for /garnish (purge PLAN.md + HANDOFF.md; SPEC.md/history preserved). | preconditions: none

## deviations & decisions
plan said center ≈348px @1100 → measured 269px @1100 (scrollbar/padding); still functional, timeline scrolls own overflow container, ⊥ body scroll (PLAN.md updated: n — estimate note only, ⊥ material)
diff-slide artifact: App.jsx lines 289-303 show as -/+ in `git diff` but byte-identical to HEAD (verified `diff`+`od`); cosmetic git alignment around moved grid block, ⊥ real change
user decided (prior session, unchanged): restore v1.1.4 3-col style; 3-col @1100 not 1420; accept v1.1.4 mobile single-col order; keep V19 touch-targets + V20 shared comps

## watchouts
- no browser driver installed (no chromium-cli/playwright); used Windows Edge headless + CDP via Node 24 global WebSocket. re-usable pattern if future visual verify needed.
- dev server: `npm run dev` logs a spurious `[0] npm run server exited with code 0` but Express :3600 + Vite :5173 both serve 200 (API proxy works). ⊥ a real failure.
- center col @ exactly 1100px = 269px (tight); Timeline table minWidth 480 scrolls own `overflow-x-auto` (BalanceTimeline.jsx:33), body ⊥ scroll (sw=1085 ≤ 1100 confirmed).

## final verification
item|status|evidence|decision
V23|HOLD|CDP grid cols: 374px single <1100, "320px 269px 384px" @1100, "320px 449px 384px" @1280; screenshots match doc/screenshotFull.png|-
V18|HOLD|CDP @390px: scrollWidth=390=innerWidth (⊥ h-scroll); timeline overflow container BalanceTimeline.jsx:33 untouched|-
V19|HOLD|git grep min-h-11/min-w-11 in DatePicker/DeleteButton/GlobalSettings/TypeToggle; ⊥ in App.jsx diff|-
V20|HOLD|DeleteButton.jsx + TypeToggle.jsx exist; ⊥ in App.jsx grid diff|-
