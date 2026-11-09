# coder_render_timing 3-render attempt-1 (run 20261103T002748Z-51080)
Status: FINDINGS (owned change made and checked; project-level items remain open outside my scope).
Source: commit e500c44 + uncommitted changes (source-commit.txt, source-status.txt, source-files-sha256.txt). Criteria and contract are AGENT-PROPOSED; no student-approved ones exist in artifacts/.

## Work done
- Read earlier reports (render 1/2, reviewer 2-review R2-8, tester 2-test, coder 3-build). No finding targets the BGR->RGBA conversion or timing.
- Edit: `platform/render_timing.c` `rt_js_put` (reviewer R2-8). It used to allocate a `Uint8ClampedArray` and `ImageData` every frame. It now reuses the `ImageData` and rebuilds it only when `HEAPU8.buffer` or the pixel pointer changes (ALLOW_MEMORY_GROWTH replaces the buffer, so the cache check is required). Conversion, timing and sleep code are unchanged. `web/render_timing.js` still does not exist; the logic stays in EM_JS (I do not own index.html/Makefile).
- No edits to tests/, loop/, assets/, third_party/, Makefile or HTML.

## Verification (observations, not a gameplay claim)
- emcc 4.0.18. `make BUILD=build/<RUN>/coder_render_timing DIST=dist/<RUN>/coder_render_timing all`: exit 0 (build.log). Role-owned dirs only.
- Built doom.js contains the new `rt.img` code and no `cap_js_present` fallback symbol, so render_timing.c is the active renderer.
- `tests/playtest.mjs`, SOAK_SECONDS=60, two runs on this dist: both exit 0, `failed=0`, 3 UNVERIFIED (A1, P1, G3). T2 34.98 tics/s, R2 rAF/s 60.4, I3.turn-left passed (213px) in run 2. Evidence: playtest-1(.log), playtest-2(.log), dist-sha256.txt.

## Limits
- The checks passed before the change too, so they show no regression. They do not show the allocation saving; I did not measure GC or frame time. Not measured on slow hardware.
- A cached ImageData is only exercised across memory growth if growth happens during play; I did not force it. Risk: if the buffer is detached without `buffer` identity changing (not expected), frames would go stale; R4 (frames change) would catch a frozen view.
- Hidden-tab timing (setTimeout throttling) untested; headless Chromium only; full tests/verify.sh not run by me (tester owns it, it cleans shared dirs).
- A1 audio, P1 persistence, G3 door/exit remain UNVERIFIED. I3 flake is a tester-owned item (two passes here do not clear it).

## Findings / owners
- Tester: hidden-tab/visibilitychange timing check; `Module._rt` implementation-identity check; a memory-growth rendering check.
- Coder (index.html): canvas `image-rendering: pixelated` (F8) still open.
- Student: approve criteria; scope audio/persistence.

## Next action
Tester runs full verify.sh on the current tree; reviewer re-checks the R2-8 change. Usage: not available. Manual interventions: none.
