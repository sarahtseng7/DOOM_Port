FINDINGS

Startup was observed working on the current dist/ build at http://localhost:8000. FINDINGS rather than PASS only because of one minor audio warning and the unverified items below.

## Work
- Read AGENTS.md, artifacts/README.md, loop/prompts/REVIEWER.md and artifacts/reports/reviewer_site.md (plus the other reports' existence).
- Port 8000 had no listener (curl 000, lsof empty), so I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (pid in server.pid) and stopped it afterward (port closed again). No unknown service was touched.
- `make -n`: nothing to be done, so dist/ is current. web/{index.html,input_audio.js,audio_web.js,render_timing.js} are byte-identical to dist/. doom.wasm sha256 prefix 7afb94fa1ec64b5c. Source is HEAD e500c44 plus uncommitted changes (rev.txt).
- Playwright loaded /?r=site13. Every request returned 200 (page, input_audio.js, audio_web.js, render_timing.js, doom.js, doom.data, doom.wasm; server.log). All finished within 23 ms of navigation start.
- Title "DOOM Shareware". Canvas 640x400. `_cap_ready()` = 1. Module._rt.frames = 345 at first evaluation, so the loop is running.
- Canvas pixel sample: 203 distinct colours (subsampled), not blank.
- early.png (viewed): correct, uncorrupted render with HUD (ammo 50, health 100%), face, and natural colours. It shows an in-game or demo view rather than the title screen, so the shot came after the title sequence.
- Console: 0 errors, 2 warnings (console.txt).

## Evidence (this directory)
early.png, console.txt, server.log, server.pid, rev.txt. Playwright captures are in artifacts/browser/.

## Findings
1. Minor, owner coder_input_audio: AudioContext autoplay warning (audio_web.js:27 and :53) before any gesture. Expected under the autoplay policy. Audio resuming after a gesture was not verified.

No failed-load or console-error fault found. The result matches the previous reviewer_site report.

## Not verified
- Precise time to first frame and frame rate over time (single sample).
- Clean rebuild, cache-cleared load, non-Chromium browsers, other viewports.
- Audio after a gesture. Movement, combat and audio depth are out of scope (reviewer_gameplay).

## Assumptions
- Headless Playwright Chromium via MCP. Criteria: page loads, no required asset fails, the canvas draws with plausible colours, and the loop advances. No specification.md or acceptance-criteria.md exists.
- "Fresh" means a new query string (?r=site13) on a new server process; the browser cache was not cleared.
- I wrote nothing outside OUTPUT_DIR apart from Playwright captures in artifacts/browser/. No source, tests or loop files were modified.
