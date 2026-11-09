FINDINGS

Re-verified rendering and timing on a fresh build; no defect found and no source edits were needed. FINDINGS (not PASS) because `tests/verify.sh` was not run, and a real hidden tab and physical HiDPI remain unverified.

## Source identity
HEAD e500c44 + uncommitted changes. emcc 4.0.18. Built into this OUTPUT_DIR (`make BUILD=$O/build DIST=$O/dist`, make.log, exit 0). doom.wasm sha256 prefix a4c6846627bdcb21 (same as earlier runs). The repo `dist/render_timing.js` and `index.html` are byte-identical to `web/`, so the previous round's DPR change has shipped. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
All six files in artifacts/reports/. No reviewer or tester reported a rendering or timing defect. Open items in my scope are hidden-tab timing (H1) and physical HiDPI, both unverifiable headless.

## Work and evidence (this dir)
scale.mjs (reused from coder_render_timing.i3pFKE; headless Chromium via tests/node_modules; not a protected check) -> scale-dpr1.log, scale-dpr2.log, dpr1.png, dpr2.png:
- Both DPRs: 34.98 tics/s, 70 presents/s, 0 non-opaque pixels, 178 distinct colours, backing store 640x400, no page errors.
- DPR 1 CSS sizes: 1280x720 -> 1152x720; 1920x1080 -> 1728x1080; 1000x700 -> 1000x625; 500x300 -> 480x300; 640x400 -> 640x400.
- DPR 2: 1920x1080 -> 1600x1000; 1000x700 -> 960x600 (whole device pixels); other sizes unchanged.
- Results match the previous round exactly.

## Unresolved (owner)
1. tester (manual protocol): hidden-tab timing (H1). Headless cannot throttle a real background tab.
2. UNVERIFIED: physical Retina/HiDPI and Safari/Firefox. DPR 2 was emulated; the backing store is 640x400 and upscaled by the browser.
3. tester: run `tests/verify.sh` on this revision; there is no automated canvas-scaling check.
4. Optional: presents run at ~2x the tic rate (duplicate frames); possible CPU saving, not a defect.
5. Not my scope: I6.backward-returns flakiness (tester); audio autoplay warnings (coder_input_audio).

## Assumptions
No spec exists. Criteria used: opaque correct-colour frames, about 35 tics/s, canvas fits the window at 16:10 with whole-pixel scaling when it uses at least 90% of the window (my choice). No speculative edits to code that passes. Manual interventions: none.
