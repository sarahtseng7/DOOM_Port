FINDINGS

I investigated the one finding addressed to me: reviewer_site's "first tic-rate window after load reads low (17/s, 23/s, 23/s)". I could not reproduce a startup rate deficit in the engine or my code. I made no source edits. This is FINDINGS rather than PASS because I ran only a startup probe, not the full `tests/verify.sh`, and hidden-tab timing is still unverified.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix is c9b3c829ca2c5a67, the same as the tester's last full run.
- dist/doom.wasm sha256 prefix is 7afb94fa1ec64b5c. `make -n` reports nothing to be done, so I tested the existing dist/ without rebuilding.
- My sources (sha256 prefixes): platform/render_timing.c af7995156cd24603, platform/render_timing.h 524c31029de67e71, web/render_timing.js e4114e9951ad4ed1. web/render_timing.js is identical to dist/render_timing.js.
- artifacts/specification.md and artifacts/acceptance-criteria.md do not exist.

## Prior findings read
Role prompt, AGENTS.md, README.md, and all of artifacts/reports/ (coder, coder_render_timing, tester, reviewer_gameplay, reviewer_site). My three source files. The only item for my scope is reviewer_site finding 1 (low startup tic rate). The other reports ask for nothing in my files.

## Work and evidence
I wrote `startup_probe.mjs` in this directory. It serves dist/, opens it in headless Chromium at 1000x700, and samples `Module._cap_tic_count()` and `Module._rt.frames` every 250 ms from navigation start. Two runs; raw samples are in `startup/run1.jsonl` and `startup/run2.jsonl`.
- Run 1: tic 2 at 276 ms, then 11, 19, 28, 37 at 250 ms intervals. That is 8-9 tics per 250 ms, i.e. 32-36 tics/s, from the first sample. Presented frames run at about 70/s.
- Run 2: tic 0 at 200 ms, 8 at 454 ms, then 17, 26, 35, 44. That is also about 35 tics/s from the first sample.
- Run 1 tic count stops at 172 after about 5.1 s. I did not investigate why; it looks like the demo/title state, where gametic does not advance. It is not a timing fault in my code, but I have not confirmed it.

## Diagnosis
Once the engine is running it holds 35 tics/s immediately, with no ramp-up. The engine starts producing tics roughly 200-250 ms after navigation. A reviewer window that starts at page load absorbs that fixed latency (wasm compile, 4.2 MB doom.data fetch, WAD init). A 3 s window then reads lower than steady state. In my runs the loss is only about 0.25 s, so it does not account for the reviewer's 17-23/s on its own. The reviewer's lower figures may reflect a slower cold start in the Playwright MCP session. I could not reproduce that, so the cause of the 17-23/s readings is not established. I judge it a measurement artifact of start-up latency, not a rendering or timing defect, but that judgement rests on my two runs.

## Unresolved (owner)
1. Tester/reviewer: if a startup criterion matters, measure tic rate from the first tic, not from page load, and measure cold-cache time-to-first-frame. I did not test a cold cache.
2. Human (H1 in tests/README.md): real hidden-tab timing. Headless Chromium cannot background a tab.
3. Human/tester: Firefox, Safari, physical HiDPI display.
4. Tester: a full `tests/verify.sh` is needed for a non-partial result on this revision. Nothing changed in my files since the last full run, so its results still apply to this wasm hash.
5. Out of my scope: A1 audio by ear, P1 save persistence, G3c level exit, WASD/mouse mapping.

## Assumptions
- Headless Playwright Chromium from tests/node_modules, on this Mac. Criteria are agent-proposed, not student-approved.
- A steady rate of about 35 tics/s (31.5-38.5, matching the tester's T2 band) counts as correct.
- Manual interventions: none. Token usage: not available.
- I wrote only in this directory. I did not edit tests/, loop/, or any other role's files.

## Next action
No change to platform/render_timing.* or web/render_timing.js is needed. A human runs H1. The tester reruns the full `tests/verify.sh` if any source changes.
