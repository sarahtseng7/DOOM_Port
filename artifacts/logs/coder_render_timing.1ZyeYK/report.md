FINDINGS

Fixed one real defect (canvas under-scaled at common viewports); the fix is verified by an ad-hoc browser run only. `tests/verify.sh` was not run, and hidden-tab timing and HiDPI remain unverified.

## Source identity
HEAD e500c44 + uncommitted changes. emcc 4.0.18 (~/Developer/emsdk). Built into this OUTPUT_DIR (`make BUILD=$O/build DIST=$O/dist`), so the repo `dist/` was not touched and is now stale relative to web/render_timing.js. Only `web/render_timing.js` changed.

## Prior findings read
artifacts/reports/: coder_render_timing, reviewer_site, reviewer_gameplay, tester, coder, coder_input_audio.
- reviewer_site #3 (canvas not scaled to viewport) was marked handled in earlier coder_render_timing reports, but it was still reproducible. Root cause: `fit()` in web/render_timing.js applied `Math.floor` to any scale >= 1. At 1280x720 the fit scale is 1.8, floored to 1, so the canvas stayed 640x400 with large black borders.

## Change
web/render_timing.js `fit()`: keep the integer scale only when it is >= 90% of the fractional fit scale; otherwise use the fractional scale. Aspect (16:10) is kept and the 640x400 backing store and frame contents are untouched.

## Evidence (this dir)
scale.mjs -> scale.log, dist-1280x720.png (ad-hoc headless Chromium, built dist in this dir; not a protected check).
- Canvas CSS size by viewport: 1280x720 -> 1152x720 (was 640x400); 1280x800 -> 1280x800; 1920x1080 -> 1728x1080; 1000x700 -> 1000x625; 500x300 -> 480x300; 640x400 -> 640x400. All keep 16:10 and fit inside the viewport.
- Rendering and timing unchanged: 34.98 tics/s, 70.07 presents/s, 0 non-opaque pixels, 178 distinct colours, backing store 640x400, no page errors.

## Unresolved (owner)
1. tester: run `tests/verify.sh` on the next build. I did not run it. There is still no automated canvas-scaling check; scale.mjs could be adapted.
2. coder: the repo `dist/` must be rebuilt (`make`) for the fix to ship.
3. tester (manual protocol): hidden-tab timing (H1). Headless cannot throttle a real background tab. Not mitigated.
4. HiDPI: the backing store is 640x400, so a devicePixelRatio > 1 display upscales it. Not verified, not changed.
5. Non-integer scale with `image-rendering: pixelated` can make pixel rows uneven by 1 px. Cosmetic; nothing was measured visually beyond the screenshot.
6. Optional: presents run at ~2x the tic rate, so duplicate frames are converted. A possible CPU saving, not a defect.

## Assumptions
No specification.md or acceptance-criteria.md exists. Criteria used: opaque correct-colour frames, ~35 tics/s, and a canvas that fills the window at 16:10. A 90% threshold for the integer-scale preference is my choice. Manual interventions: none.
