FINDINGS

No defect found in rendering or timing, and I made no source edits. This is FINDINGS rather than PASS because I did not run the full `tests/verify.sh`. Real hidden-tab timing, other browsers and HiDPI are also still unverified.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix is c9b3c829ca2c5a67, the same as the tester's last full run and the previous reports.
- dist/doom.wasm prefix is 7afb94fa1ec64b5c. `make -n` reports nothing to be done, so I tested the existing dist/ without rebuilding.
- My sources: platform/render_timing.c af7995156cd24603, platform/render_timing.h 524c31029de67e71, web/render_timing.js e4114e9951ad4ed1. All are unchanged since the previous coder_render_timing report.
- artifacts/specification.md and artifacts/acceptance-criteria.md do not exist.

## Prior findings read
Role prompt, AGENTS.md, README.md, platform/README.md, and artifacts/reports/ (the previous coder_render_timing report, plus the reviewer and tester reports as summarised there and in the heads I read). The only item in my scope is reviewer_site's low first-window tic rate. The previous run could not reproduce it. It left two things open: cold-cache time to first frame, and measuring the rate from the first tic. This run covers both.

## Work and evidence
`cold_probe.mjs` (this directory) launches a fresh headless Chromium for each run, so the cache is empty. It serves dist/ with `cache-control: no-store`, polls `Module._rt.frames` and `_cap_tic_count()` every 20 ms, then measures the tic rate over 3 s starting at the first tic. It also checks that every canvas pixel has alpha 255. Four runs at normal speed (`cold_1x.jsonl`) and four with 4x CPU throttling (`cold_4x.jsonl`).
- Normal CPU: first frame and first tic at 156-161 ms. Tic rate after the first tic is 35.0/s in all four runs.
- 4x CPU throttle: first frame and first tic at 215-220 ms. Rate is 35.0/s in three runs and 34.7/s in one.
- Non-opaque canvas pixels: 0 in all eight runs. Page errors: none.
- Since the engine holds 35 tics/s from its first tic, the 17-23/s first-window readings do not come from a ramp-up in the engine or in my code. The window averages that measured them probably included load latency or a slower cold start in the Playwright MCP session. I could not reproduce that. This confirms the previous diagnosis but does not prove the cause of the reviewer's numbers.
- Colour correctness (B,G,R,0 to R,G,B,255, alpha forced to 255) is covered by the tester's swap-rb fault check, which was caught in the last full run. I did not rerun it.

## Unresolved (owner)
1. Human (H1 in tests/README.md): real hidden-tab timing. Headless Chromium cannot background a tab.
2. Human/tester: Firefox, Safari, physical HiDPI display. I did not test the integer-scale logic in web/render_timing.js on a real HiDPI screen.
3. Tester: a full `tests/verify.sh` on this revision with a timeout over 10 minutes. Nothing in my files has changed since the last full run, so its results still apply to this wasm hash.
4. Reviewer_site: if a startup criterion is wanted, measure the rate from the first tic, not from page load. The load time on the reviewer's machine and network is not covered by my local-server numbers.
5. Out of my scope: audio by ear, save persistence, level exit, WASD/mouse mapping.

## Assumptions
- Headless Playwright Chromium from tests/node_modules, on this Mac, with a local server. Criteria are agent-proposed, not student-approved.
- A steady rate of about 35 tics/s (31.5-38.5, matching the tester's T2 band) counts as correct.
- CPU throttling at 4x only approximates a slow machine.
- Manual interventions: none. Token usage: not available.
- I wrote only in this directory. I did not edit tests/, loop/, or any other role's files.

## Next action
No change to platform/render_timing.* or web/render_timing.js is needed. A human runs H1. The tester reruns the full `tests/verify.sh` if any source changes.
