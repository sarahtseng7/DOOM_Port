FINDINGS

# coder_render_timing report (OUTPUT_DIR artifacts/logs/coder_render_timing.y2E5IZ)

Source: commit e500c44 + uncommitted changes. emcc 4.0.18. No artifacts/specification.md or acceptance-criteria.md exist.

## Work
- Prior findings read (artifacts/reports/coder.md, tester.md; run reviewer report). Colour conversion (B,G,R,0 -> opaque RGBA), clock (nonzero, monotonic), ASYNCIFY sleeps all reviewed and found correct; no defect to repair there.
- Reviewer F8 (canvas fixed 640x400, soft/small on large displays): added web/render_timing.js, which sets only the canvas CSS size (integer scale >= 1, fit-shrink below, 16:10 kept). Backing store and framebuffer contract unchanged.
- platform/render_timing.c: comment fix (contract version 2 -> 3). No behaviour change; dist rebuilt with `make`.

## Evidence (this dir)
- measure.mjs (ad-hoc Playwright, headless Chromium, 1280x800 viewport; not a protected check).
- Baseline dist: 34.98 tics/s, 69.96 presents/s, 0 non-opaque pixels, 182 distinct colours, no page errors (before.png).
- dist2/ (copy of dist plus render_timing.js script tag): 34.99 tics/s, 69.98 presents/s, 0 non-opaque, 182 colours, canvas CSS 1280x800, no errors (after.png).

## Unresolved (owner)
1. coder: web/render_timing.js is NOT wired in. Add `<script src="render_timing.js"></script>` to web/index.html and add it to WEB_FILES in Makefile. Verified only on the dist2 copy, not on the real dist.
2. tester: no check for scaling or for hidden-tab timing (H1 stays UNVERIFIED). Background tabs throttle setTimeout, so the ASYNCIFY loop slows; not mitigated here.
3. Presents run at 2x the tic rate (~70/s); duplicate frames are still converted. Not a defect, possible CPU saving only.
4. Not run: tests/verify.sh, headed browser, HiDPI.

## Assumptions
Integer scaling is acceptable for "crisp"; canvas CSS in index.html (image-rendering) is kept. Manual interventions: none.
