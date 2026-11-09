FINDINGS

Startup was observed working on the current dist/ build at http://localhost:8000. The result is FINDINGS rather than PASS only because a few checks were not done (see Not verified) and one minor audio warning remains.

## Work
- Read AGENTS.md, artifacts/README.md, loop/prompts/REVIEWER.md, BUILD.md and the prior artifacts/reports/reviewer_site.md.
- Port 8000 had no listener (curl returned 000). I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (pid in server.pid) and will stop only that process.
- `make -n` says "Nothing to be done", so dist/ is current. web/{index.html,input_audio.js,audio_web.js,render_timing.js} are byte-identical to dist/. doom.wasm sha256 prefix is 7afb94fa1ec64b5c, the same as the prior run. Source is HEAD e500c44 plus uncommitted changes (rev.txt).
- Playwright loaded /?r=site11. All 7 requests returned 200: the page, input_audio.js, audio_web.js, render_timing.js, doom.js, doom.data and doom.wasm (network.txt, server.log).
- Title "DOOM Shareware". Canvas 640x400. `_cap_ready()` returned 1. Module._rt.frames was 57 when sampled right after load, so the loop is running.
- Pixel sample of the canvas had 237 distinct colours, so it is not blank or a single colour.
- early.png (viewed): the DOOM title screen, with correct colours, no corruption, and the canvas centred on black.
- Console: 0 errors, 2 warnings (console.txt).

## Evidence (this directory)
early.png, console.txt, network.txt, server.log, server.pid, rev.txt. Playwright captures are in artifacts/browser/.

## Findings
1. Minor, owner coder_input_audio: AudioContext autoplay warning at audio_web.js:27 and :53 before any user gesture. This is expected under the autoplay policy. I did not verify that audio resumes after a gesture.

No failed-load or console-error fault was found.

## Not verified
- Precise time to first frame. I only saw that the frame counter was at 57 and the title screen was drawn at the first sample.
- Frame rate over time (a single early sample only).
- Clean rebuild, non-Chromium browsers, warm-cache reload, other viewports.
- Audio after a gesture.
- Movement and combat (out of scope, for reviewer_gameplay).

## Assumptions
- Headless Playwright Chromium via MCP. Criteria: the page loads, no required asset fails, the canvas draws with plausible colours, and the loop advances.
- "Fresh" means a new query string (?r=site11). I did not clear the browser cache.
- I wrote nothing outside OUTPUT_DIR apart from the Playwright captures in artifacts/browser/. I modified no source, tests or loop files.
