FINDINGS

No source edits. No reproducible rendering or timing defect exists in artifacts/reports/, and a fresh browser run on the unchanged build found none. The result stays FINDINGS because a hidden tab, other browsers and HiDPI are still unverified.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` prefix 92e25d7245a7dafd (identity.txt), the same as every prior report.
- render_timing.c af7995156cd24603, render_timing.h 524c31029de67e71, render_timing.js e4114e9951ad4ed1, dist/doom.wasm 7afb94fa1ec64b5c. All unchanged.
- `find platform web Makefile -newer dist/doom.wasm` is empty, so dist/ is current and I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md do not exist.

## Work
- Read AGENTS.md, the READMEs, my role prompt and all reports in artifacts/reports/ (coder_render_timing, tester, reviewer_gameplay, reviewer_site).
- Ran `QUICK=1 OUT_DIR=<this dir>/playtest node tests/playtest.mjs` (playtest-console.log, playtest/). The run exits 3 by design, because QUICK is partial. It reports failed=0.
  - B2: first frame at 222 ms.
  - B3: 0 transparent pixels.
  - B4: mean R 109.8, mean B 30.7, so no R/B swap.
  - B6: E1M1 view is not blue-biased.
  - T1: 60 rAF/s.
  - T2: 34.93 tics/s.
  - S1: 16:10 held at four viewport sizes.
  - E2a, E2b, E3: keys released on hide and pagehide, and a repeat after blur is a fresh press.
- Changed nothing. An edit would invalidate the evidence for wasm 7afb94fa1ec64b5c, and there is no defect to justify one.

## Unresolved (owner)
1. UNVERIFIED, human: timing in a really hidden tab (H1, protocol in tests/README.md).
2. UNVERIFIED, human/tester: Firefox, Safari, physical HiDPI.
3. Cosmetic, owner coder: static `<title>` "Doom (WASM)" in web/index.html shows briefly before the engine sets it. I don't own that file.
4. Owner tester: B6 does not detect an R/B swap (only B4 does), so the faults.sh expectation overstates coverage.
5. Out of my scope: A1 audio by ear, P1 persistence, G3c level exit.

## Assumptions
- A steady 35 tics/s (tester band 31.5-38.5) is correct, and 16:10 letterboxing is intended.
- Criteria are agent-proposed, not student-approved.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only.

## Next action
A human runs H1 and a HiDPI check. If either shows a defect, reopen this role with the reproduction.
