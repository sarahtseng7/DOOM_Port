FINDINGS

Startup was observed working on the current dist/ build. The result is FINDINGS rather than PASS because several checks were not done (see Not verified), plus one minor audio warning carried over from the prior review.

## Work
- Read AGENTS.md, loop/prompts/REVIEWER.md and artifacts/reports/*. No specification.md or acceptance-criteria.md exists.
- Port 8000 had no listener. I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (pid in server.pid) and stopped it afterwards. The port is confirmed free.
- `make -n` reports "Nothing to be done", so dist/ is current. web/{index.html,input_audio.js,audio_web.js,render_timing.js} are identical to dist/. doom.wasm sha256 starts 6c93cbf125bd366a, the same as every prior report. Source is HEAD e500c44 plus uncommitted changes (diff sha256 8a0736f5784ff838, in rev.txt).
- Playwright loaded /?r=site6. There were 6 resources, all HTTP 200: input_audio.js, audio_web.js, render_timing.js, doom.js, doom.data (~4.2 MB) and doom.wasm (~555 KB). server.log shows every asset requested, plus the document, with 8 responses at 200 and none failed.
- Title is "DOOM Shareware". The canvas is 640x400, shown at 1152x720 CSS (1.6 aspect).
- 89 distinct colours in a sparse sample. Module._rt.frames went 269 -> 339 in 1 s, so the render loop advances (headless Chromium).
- startup.png (viewed): in-game E1M1-style view with HUD (ammo 50, health 100%, armor 0%) and a dark green/brown scene. Colours look correct (no red/blue swap), there is no corruption, and the image is letterboxed.
- Console: 0 errors, 2 warnings (console.txt).

## Evidence (this directory)
startup.png, console.txt, server.log, server.pid, rev.txt. Playwright captures are in artifacts/browser/.

## Findings
1. Minor, owner coder_input_audio: the AudioContext "not allowed to start" warning appears twice (audio_web.js:27 and :538) before a user gesture. This is expected under the autoplay policy. I did not verify that audio resumes after the first gesture. Same as the prior reviewer_site report.

No actionable startup fault was found.

## Not verified
- Precise time to first frame.
- Whether the first frame is the title screen, a demo or gameplay. The screenshot was taken a few seconds after load.
- Clean rebuild.
- Non-Chromium browsers.
- Warm-cache reload.
- Other viewports.
- Audio after a gesture.
- Movement and combat (out of scope).

## Assumptions
- Headless Playwright Chromium via MCP. Criteria were: the page loads, no required asset fails, the canvas draws with plausible colours, and the loop advances.
- "Fresh" means a new query string (?r=site6). I did not clear the browser cache, but server.log shows every asset requested.
- I wrote nothing outside OUTPUT_DIR apart from the Playwright captures in artifacts/browser/. I modified no source, tests or loop files.
