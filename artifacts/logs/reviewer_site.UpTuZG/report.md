FINDINGS

Startup was observed working on the current dist/ build at http://localhost:8000. FINDINGS rather than PASS only because of unverified items below and one minor audio warning.

## Work
- Read AGENTS.md, artifacts/README.md, loop/prompts/REVIEWER.md and artifacts/reports/ (prior reviewer_site, tester, reviewer_gameplay).
- Port 8000 had no listener (curl 000, lsof empty). I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (pid in server.pid) and stopped it afterward. No unknown service was touched.
- `make -n`: nothing to be done, so dist/ is current. web/{index.html,input_audio.js,audio_web.js,render_timing.js} are byte-identical to dist/. doom.wasm sha256 prefix 7afb94fa1ec64b5c (same as prior runs). Source is HEAD e500c44 plus uncommitted changes (rev.txt).
- Playwright loaded /?r=site12. All 7 requests returned 200 (page, input_audio.js, audio_web.js, render_timing.js, doom.js, doom.data, doom.wasm; server.log). Resource timings: all finished within 21 ms of navigation start (localhost).
- Title "DOOM Shareware". Canvas 640x400. `_cap_ready()` = 1. Module._rt.frames = 505 at first evaluation, so the loop is running.
- Canvas pixel sample: 84 distinct colours (subsampled), not blank.
- early.png (viewed): rendering is correct and uncorrupted, with a status bar, weapon and enemy and natural colours. It shows attract-mode demo gameplay rather than the title screen, so the screenshot came after the title sequence. That is normal for DOOM.
- Console: 0 errors, 2 warnings (console.txt).

## Evidence (this directory)
early.png, console.txt, server.log, server.pid, rev.txt. Playwright captures are in artifacts/browser/.

## Findings
1. Minor, owner coder_input_audio: AudioContext autoplay warning (audio_web.js:27 and :53) before any gesture. Expected under the autoplay policy. I did not verify that audio resumes after a gesture.

No failed-load or console-error fault found.

## Not verified
- Precise time to first frame, and frame rate over time (one sample only; 505 frames at first sample).
- Clean rebuild, warm-cache reload, non-Chromium browsers, other viewports (the tester's playtest covers 4 viewports).
- Audio after a gesture. Movement, combat and audio depth are out of scope (reviewer_gameplay).

## Assumptions
- Headless Playwright Chromium via MCP. Criteria: the page loads, no required asset fails, the canvas draws with plausible colours, and the loop advances. No specification.md or acceptance-criteria.md exists.
- "Fresh" means a new query string (?r=site12); the browser cache was not cleared.
- I wrote nothing outside OUTPUT_DIR apart from Playwright captures in artifacts/browser/. No source, tests or loop files were modified.
