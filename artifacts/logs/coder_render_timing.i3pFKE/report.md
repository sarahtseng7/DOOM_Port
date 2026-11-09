FINDINGS

Rendering and timing re-checked on a fresh build. One small change: canvas scaling is now devicePixelRatio-aware. `tests/verify.sh` was not run, and hidden-tab timing and real HiDPI hardware remain unverified.

## Source identity
HEAD e500c44 + uncommitted changes. emcc 4.0.18 (~/Developer/emsdk). Built into this OUTPUT_DIR (`make BUILD=$O/build DIST=$O/dist`, make.log, exit 0). The repo `dist/` was not touched, so it is stale relative to web/render_timing.js. Only `web/render_timing.js` changed.

## Prior findings read
All six reports in artifacts/reports/. The only items in my scope are HiDPI (backing store 640x400), hidden-tab timing (H1), uneven pixel rows at a fractional scale, and duplicate presents. Last round's canvas-scaling fix had already shipped (dist/render_timing.js matches web/ before my edit). No rendering or timing defect was reported by the reviewers or the tester. The tester's one failure (I6.backward-returns) is a flaky input-momentum check, not rendering or timing.

## Change
`fit()` in web/render_timing.js now computes the scale in device pixels (innerWidth/Height x devicePixelRatio) and converts back to CSS px. The 90% integer-preference rule is unchanged. Result: on a DPR 2 display the canvas lands on whole device pixels (whole-pixel doubling) instead of fractional ones. At DPR 1 the behaviour is identical to before. The backing store, the frame contents and the C side are untouched.

## Evidence (this dir)
scale.mjs (last round's script plus a deviceScaleFactor argument) -> scale-dpr1.log, scale-dpr2.log, dpr1.png, dpr2.png. Ad-hoc headless Chromium on the freshly built dist in this dir. Not protected checks.
- DPR 1 CSS sizes (identical to the previous round): 1280x720 -> 1152x720; 1920x1080 -> 1728x1080; 1000x700 -> 1000x625; 500x300 -> 480x300; 640x400 -> 640x400.
- DPR 2 CSS sizes: 1920x1080 -> 1600x1000 (5 device px per source px); 1000x700 -> 960x600 (3 device px per source px). The other sizes are unchanged. Every canvas fits inside its viewport at 16:10.
- Both runs: 34.98 tics/s, 70 presents/s, 0 non-opaque pixels, 178 distinct colours, backing store 640x400, no page errors.

## Unresolved (owner)
1. coder: rebuild the repo `dist/` (`make`) so the DPR change ships.
2. tester: run `tests/verify.sh` on the next build. I did not run it. There is no automated canvas-scaling check; scale.mjs could be adapted.
3. tester (manual protocol): hidden-tab timing (H1). Headless cannot throttle a real background tab. Not mitigated.
4. DPR 2 was emulated in headless Chromium. Physical Retina rendering was not viewed, and the backing store is still 640x400, so it is upscaled by the browser.
5. Optional: presents run at about 2x the tic rate, so duplicate frames are converted. This is a possible CPU saving, not a defect.
6. Not in my scope: the I6 flakiness (owner tester) and the audio autoplay warnings (coder_input_audio).

## Assumptions
No specification.md or acceptance-criteria.md exists. Criteria used: opaque correct-colour frames, about 35 tics/s, and a canvas that fills the window at 16:10 with whole-pixel scaling where it uses at least 90% of the window. The 90% threshold is my choice. Manual interventions: none.
