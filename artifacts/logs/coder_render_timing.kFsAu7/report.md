FINDINGS

Re-verified rendering and timing on a fresh build; no defect found, no source edits. FINDINGS (not PASS) because `tests/verify.sh` was not run by me, and a real hidden tab and physical HiDPI remain unverified.

## Source identity
HEAD e500c44 + uncommitted changes. emcc 4.0.18. Built into this OUTPUT_DIR (`make BUILD=$O/build DIST=$O/dist`, make.log, exit 0). doom.wasm sha256 prefix a4c6846627bdcb21, identical to repo dist/ and earlier runs. web/render_timing.js is byte-identical to the built copy. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
All six files in artifacts/reports/. No reviewer or tester reported a rendering or timing defect. Open items in my scope: hidden-tab timing (H1), physical HiDPI.

## Evidence (this dir)
scale.mjs (reused from coder_render_timing.i3pFKE; headless Chromium via tests/node_modules; not a protected check) -> scale-dpr1.log, scale-dpr2.log, dpr1.png, dpr2.png:
- Both DPRs: 34.99 tics/s, 70 presents/s, 0 non-opaque pixels, 178 distinct colours, backing 640x400, no page errors.
- DPR 1 CSS sizes: 1280x720 -> 1152x720; 1920x1080 -> 1728x1080; 1000x700 -> 1000x625; 500x300 -> 480x300; 640x400 -> 640x400.
- DPR 2: 1920x1080 -> 1600x1000; 1000x700 -> 960x600; others unchanged.
- Matches previous round exactly. Colour correctness not re-inspected visually this run (counts only); earlier tester B4 swap-rb fault check covers it.

## Unresolved (owner)
1. tester (manual protocol): hidden-tab timing (H1); headless cannot throttle a real background tab.
2. UNVERIFIED: physical Retina/HiDPI, Safari/Firefox. DPR 2 was emulated.
3. tester: no automated canvas-scaling check; run tests/verify.sh on this revision.
4. Optional: presents run ~2x tic rate (duplicate frames); possible CPU saving, not a defect.
5. Not my scope: I6.backward-returns marginal (tester); audio autoplay warnings (coder_input_audio).

## Assumptions
No spec exists. Criteria used: opaque correct-colour frames, ~35 tics/s, canvas fits window at 16:10 with whole-pixel scaling when it fills at least 90% of the window (my choice). No speculative edits to passing code. Manual interventions: none. Usage: not available.
