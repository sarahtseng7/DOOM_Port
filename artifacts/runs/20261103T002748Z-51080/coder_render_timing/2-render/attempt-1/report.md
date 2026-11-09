# coder_render_timing 2-render attempt-1 (run 20261103T002748Z-51080)
Status: FINDINGS (owned code re-verified; nothing new to repair; open items remain outside my scope).
Source: commit e500c44 + uncommitted changes (source-commit.txt, source-status.txt, source-diff-sha256.txt). Criteria/contract are AGENT-PROPOSED; no student-approved spec exists.

## Work done
- Re-read the 1-render report, reviewer 1-review, tester 1-test, coder 2-build. None of their findings targets platform/render_timing.{c,h}; the reviewer confirmed the BGR(0)->RGBA conversion and the nonzero first `cap_time_ms`.
- No source edits this attempt. platform/render_timing.c/.h are unchanged. web/render_timing.js is still not created (all logic is in EM_JS; index.html/Makefile are not mine).
- Corrected the process deviation from 1-render: built into role-owned dirs only (`make BUILD=build/<RUN>/coder_render_timing DIST=dist/<RUN>/coder_render_timing all`), not the shared build/ or dist/.

## Verification (observations, not a gameplay claim)
- emcc 4.0.18. Build exit 0 with the current Makefile (ASYNCIFY_STACK_SIZE=65536, -MMD). build.log.
- Override check: `rt_js_put` appears in the built doom.js, `cap_js_present` (fallback) does not.
- `tests/playtest.mjs` against that dist, SOAK_SECONDS=60: exit 0, `failed=0`, 3 UNVERIFIED (A1, P1, G3). Includes T2 35.21 tics/s, R2 rAF/s 60.4, R3 no long task, R4 frames change. Evidence: playtest.log, playtest/, dist-sha256.txt.
- Not run: full tests/verify.sh (it runs `make clean` on the shared dirs; the tester owns it). Coder 2-build already ran it with exit 0 on the same render code.

## Limits
- The fallback renderer also passed these checks, so they show no regression, not that the wasm-side conversion is better or faster; speed was not measured.
- Hidden-tab behavior (setTimeout throttling slows the ASYNCIFY loop and tic catch-up) is untested. Headless Chromium only; one 60 s run.
- A1 audio, P1 persistence, G3 door/exit remain UNVERIFIED.

## Findings / owners
- Coder (web/index.html): reviewer F8 `canvas { image-rendering: pixelated; }` and scaling is still not done. It is a request, not a blocker.
- Tester: add a hidden-tab/visibilitychange timing check and an implementation-identity check (`Module._rt` exists, i.e. render_timing active), which also supports the regression-injection evaluation.
- Student: approve criteria; decide audio/persistence scope.

## Next action
Tester runs full verify.sh on the current tree; reviewer re-checks. Usage: not available. Manual interventions: none.
