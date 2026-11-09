FINDINGS

Startup was observed working on the current dist/ build (fresh load, 0 failed requests, 0 console errors, canvas drawing, loop advancing). The result is FINDINGS rather than PASS because several checks were not done (see Not verified), plus one minor audio warning carried over from earlier reviews.

## Work
- Read AGENTS.md, loop/prompts/REVIEWER.md and artifacts/reports/* (including the prior reviewer_site.md). No specification.md or acceptance-criteria.md exists.
- Port 8000 had no listener. I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (pid in server.pid) and stopped it afterwards. Port confirmed free.
- `make -n` reports "Nothing to be done", so dist/ is current. web/{index.html,input_audio.js,audio_web.js,render_timing.js} are byte-identical to dist/ (cmp). Source is HEAD e500c44 plus uncommitted changes (rev.txt).
- Playwright loaded /?r=site7. Six resources, all HTTP 200: input_audio.js, audio_web.js, render_timing.js, doom.js (~77 KB), doom.data (~4.2 MB), doom.wasm (~556 KB). server.log: 8 responses at 200, none other.
- Title "DOOM Shareware". Canvas 640x400, shown at 1152x720 CSS (16:10).
- 101 distinct colours in a sparse sample. Module._rt.frames went 749 -> 819 in 1 s, so the render loop advances (headless Chromium).
- startup.png (viewed): in-game 3D view with HUD, a monster and a corpse, and "Picked up an armor bonus." HUD shows ammo 1, health 92%, armor 98%. Colours look correct, there is no corruption, and the image is letterboxed.
- Console: 0 errors, 2 warnings (console.txt).

## Evidence (this directory)
startup.png, console.txt, server.log, server.pid, rev.txt. Playwright captures are in artifacts/browser/.

## Findings
1. Minor, owner coder_input_audio: the AudioContext "not allowed to start" warning appears twice (audio_web.js:27 and :53) before a user gesture. This is expected under the autoplay policy. I did not verify that audio resumes after the first gesture. Same as prior reviews.
2. Informational, for the tester/coordinator: dist/doom.wasm sha256 prefix is 7afb94fa1ec64b5c. The prior reviewer_site and tester reports record 6c93cbf125bd366a, and the git diff hash also differs. The build has changed since those reports, so their evidence does not cover this build. I did not investigate why.
3. Unexplained, needs checking: the first screenshot (a few seconds after load) shows mid-gameplay state (damaged player, killed monster, armor pickup), not a title screen or fresh E1M1 start. This is probably the attract demo, but I did not confirm that. Owner: coder_render_timing / coordinator, to confirm intended startup behaviour.

No failed-load or console-error fault was found.

## Not verified
- Precise time to first frame; first frame content (see finding 3).
- Clean rebuild; non-Chromium browsers; warm-cache reload; other viewports.
- Audio after a gesture.
- Movement and combat (out of scope).

## Assumptions
- Headless Playwright Chromium via MCP. Criteria were: the page loads, no required asset fails, the canvas draws with plausible colours, and the loop advances.
- "Fresh" means a new query string (?r=site7). I did not clear the browser cache, but server.log shows every asset requested.
- I wrote nothing outside OUTPUT_DIR apart from the Playwright captures in artifacts/browser/. I modified no source, tests or loop files.
- Same OUTPUT_DIR as the prior run's layout; the older reviewer_site.md in artifacts/reports/ was left untouched.
