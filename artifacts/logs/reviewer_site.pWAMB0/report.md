FINDINGS

Startup observed working on the current dist/ build at http://localhost:8000. FINDINGS (not PASS) only because of one minor audio warning and the unverified items below.

## Work
- Read AGENTS.md, README.md, loop/prompts/REVIEWER.md, artifacts/reports/reviewer_site.md (prior review). No specification.md / acceptance-criteria.md exists.
- Port 8000 had no listener (curl and lsof empty). I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (pid in server.pid) and stopped it afterward (port closed again, curl 000). No unknown service touched.
- `make -n`: "Nothing to be done", so dist/ is current. web/{index.html,input_audio.js,audio_web.js,render_timing.js} are byte-identical to dist/. doom.wasm sha256 prefix 7afb94fa1ec64b5c. Source is HEAD e500c44 plus uncommitted changes (rev.txt).
- Playwright loaded /?r=site14. All 7 requests returned 200: page, input_audio.js, audio_web.js, render_timing.js, doom.js, doom.data, doom.wasm (network.txt).
- Title "DOOM Shareware". Canvas 640x400. `_cap_ready()` = 1. Module._rt.frames went 405 -> 545 over a 2 s wait, so the loop is advancing at roughly 70 frames/s (headless).
- Canvas pixel sample: 171 distinct colours, not blank.
- startup.png (viewed): correct, uncorrupted 3D render with HUD (ammo 46, health 98%, armor 99%), face, and natural colours. It shows an in-game/demo view, so the shot came after the title sequence.
- Console: 0 errors, 2 warnings (console.txt).

## Evidence (this directory)
startup.png, console.txt, network.txt, server.log, server.pid, rev.txt. Playwright captures are also in artifacts/browser/.

## Findings
1. Minor, owner coder_input_audio: AudioContext autoplay warning (audio_web.js:27 and :53) before any user gesture. Expected under the autoplay policy. Audio resuming after a gesture was not verified.

No failed-load or console-error fault found. Consistent with the previous reviewer_site report.

## Not verified
- Precise time to first frame; frame rate was a single 2 s sample. The page's own performance.now() read about 8.6 s when sampled, which includes tool latency and isn't a startup time.
- Title screen/first frame image (screenshot was taken after startup had already progressed).
- Clean rebuild, cache-cleared load, non-Chromium browsers, other viewports.
- Audio after a gesture. Movement, combat and audio depth belong to reviewer_gameplay.

## Assumptions
- Headless Playwright Chromium via MCP. Criteria: page loads, no required asset fails, the canvas draws with plausible colours, and the loop advances.
- "Fresh" means a new query string (?r=site14) on a new server process; the browser cache was not cleared.
- I wrote nothing outside OUTPUT_DIR apart from Playwright captures in artifacts/browser/. No source, tests or loop files were modified.
