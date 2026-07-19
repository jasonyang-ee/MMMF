# HANDOFF 2026-07-19

branch main | last commit a9ea837 fix(ci): align Cloudflare_Build_Test to Node 24 | tests n/a (⊥ runner, T12 todo)
baseline green | oracle F2/F3 = `cd client && npm run build` + visual drive (run skill) @ ≥1100px & <1100px
uncommitted: `SPEC.md` (+V23,R13 note,T33,B6 via spec), `PLAN.md` (new layout cycle, replaced done GHCR plan), `HANDOFF.md` (this); ALSO `package.json`+`package-lock.json` (USER edit, engines.node 20→24, ⊥ mine) — cook planning output, ⊥ layout code yet

## done this session
prior GHCR cycle (T30-T32) shipped + CI node fix (B5/V22) earlier this session → 27533f1/2f3a34c/4c1701e/a850b55/a9ea837.
THIS cook run: diagnosed broken core layout (B6), planned v1.1.4 3-col revert. ⊥ layout code shipped.

## in progress (exact stop point)
F1 (T33) NOT started. NEXT STEP: run F1 research per PLAN.md — `git show v1.1.4:client/src/App.jsx` to lock exact `<main>` grid markup; confirm fad7b0d changed ONLY the grid block in App.jsx; verify V18/V19/V20 carriers all in child comps; identify CHANGELOG `[Unreleased]` mobile line to rewrite. ⊥ edit App.jsx until F1 locks scope.
mid-edit files: none

## next
F1 (T33) per PLAN.md → F2 (revert grid @ min-[1100px]) → F3 (drive+verify). | preconditions: none (single-file client change, low blast radius; /review-plan optional)

## deviations & decisions
plan said (v1.1.4 pure) → doing v1.1.4 arrangement BUT breakpoint lowered 1420→1100 (PLAN.md updated: y — user chose "3 columns at more widths")
user decided: (1) restore v1.1.4 3-col layout style (`doc/screenshotFull.png`); (2) 3-col ! appear at ~1100px not 1420; (3) accepts v1.1.4 mobile single-col order (timeline-after-settings) — supersedes T24 reorder/R13. KEEP touch-target(V19)+shared-component(T25/V20) work.

## watchouts
- SURGICAL revert: touch ONLY `App.jsx` `<main>` grid block + 1 CHANGELOG line. ⊥ revert child-comp touch-target/overflow tweaks from fad7b0d (BalanceTimeline/DatePicker/GlobalSettings/RecurringCreditCards/RecurringList) nor a1e4a64 shared comps.
- current ≥1420 3-col placement ALREADY = v1.1.4 arrangement → defect is only `lg:grid-cols-2` tier + 1420 breakpoint.
- @1100px center ≈348px (320+384 sidebars+gaps); Timeline table minWidth 480 scrolls own `overflow-x-auto` (V18 safe, ⊥ body scroll) but center tight — if user's real window <1100 they still stack → may need breakpoint even lower (lg/1024); confirm at F3 drive, note if user reports no 3-col.
- user's exact viewport px unknown (screenshot in lg 1024-1419 tier); 1100 chosen per user-accepted option.
- `package.json`/`package-lock.json` engines 20→24 = user's uncommitted parallel edit; leave for user to commit.
- V18 depends on `BalanceTimeline.jsx:33` overflow container, NOT grid → survives revert.

## final verification
item|status|evidence|decision
V23|UNVERIFIABLE|F3 not run; cycle just planned|-
V18|UNVERIFIABLE|F3 not run|-
V19|UNVERIFIABLE|F3 not run|-
V20|UNVERIFIABLE|F3 not run|-
