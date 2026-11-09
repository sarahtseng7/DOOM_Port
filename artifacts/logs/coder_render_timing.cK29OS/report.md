FINDINGS

Rebuilt and re-measured rendering and timing. I found no defect and made no source edits. This is FINDINGS rather than PASS because I did not run `tests/verify.sh`, and a real hidden tab and physical HiDPI remain unverified.

## Source identity
HEAD e500c44 plus uncommitted changes. emcc 4.0.18. Built with `make BUILD=$O/build DIST=$O/dist` (make.log, exit 0). web/render_timing.js is byte-identical to the built copy. artifacts/specification.md and acceptance-criteria.md do not exist.

doom.wasm sha256 prefix is 6c93cbf125bd366a (555267 bytes). Earlier runs and repo dist/ show a4c6846627bdcb21 (554840 bytes). The difference comes from other roles' files: platform/capstone_bridge.h and platform/doomgeneric_wasm.c were modified at 21:46, after repo dist/ was built at 21:36. My three files are untracked and unchanged. I did not investigate the diff further. The repo dist/ is stale relative to the source tree and needs a rebuild by coder.

## Prior findings read
All files in artifacts/reports/. No reviewer or tester reported a rendering or timing defect. Open items in my scope: hidden-tab timing (H1) and physical HiDPI.

## Evidence (this dir)
scale.mjs (copied from coder_render_timing.i3pFKE; headless Chromium; not a protected check) -> scale-dpr1.log, scale-dpr2.log:
- Both DPRs: about 34.98 tics/s, about 70 presents/s, 0 non-opaque pixels, 178 distinct colours, no page errors, backing store 640x400.
- DPR 1 CSS sizes: 1920x1080 -> 1728x1080; 1000x700 -> 1000x625. DPR 2: 1920x1080 -> 1600x1000; 1000x700 -> 960x600. Matches earlier rounds, and the 16:10 aspect is kept.
- dpr1.png and dpr2.png were saved but I did not view them this round. Colour correctness is from the earlier visual check and the 178-colour count, not a new look.

## Unresolved (owner)
1. tester (manual protocol): real hidden-tab timing (H1). Headless cannot throttle a background tab.
2. UNVERIFIED: physical Retina/HiDPI, Safari and Firefox. DPR 2 was emulated.
3. tester: no automated canvas-scaling check. Run tests/verify.sh on this revision.
4. coder: repo dist/ is stale relative to the current source (see Source identity).
5. Optional: presents run about 2x the tic rate (duplicate frames). Possible CPU saving, not a defect.

## Assumptions
No spec exists. Criteria I used: opaque correct-colour frames, about 35 tics/s, canvas fits the window at 16:10 with whole-pixel scaling when it fills at least 90% of the window. No speculative edits to passing code. Manual interventions: none. Usage: not available.
