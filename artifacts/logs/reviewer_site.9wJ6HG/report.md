FINDINGS

Startup was observed working on the current dist/ build. Page, canvas, JS/WASM/WAD loading and the frame loop all behaved. The result is FINDINGS rather than PASS because several checks were not done (see Not verified), plus one minor audio warning.

## Work
- Read AGENTS.md, artifacts/README.md, loop/prompts/REVIEWER.md, BUILD.md, Makefile and artifacts/reports/reviewer_site.md (prior review).
- Port 8000 had no listener at the start (curl returned 000). I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (pid in server.pid) and stopped it afterwards. The port was free again.
- `make -n` says "Nothing to be done", so dist/ is current. web/{index.html,input_audio.js,audio_web.js,render_timing.js} are byte-identical to dist/. dist/doom.wasm sha256 prefix is 7afb94fa1ec64b5c, the same as the prior run. Source is HEAD e500c44 plus uncommitted changes (rev.txt: first line is the commit, second is the count of changed/untracked entries).
- Playwright loaded /?r=site10. Resources: input_audio.js, audio_web.js, render_timing.js, doom.js, doom.data, doom.wasm. All returned 200 and all finished within 25 ms of navigation (local server).
- Title "DOOM Shareware". Canvas 640x400. `_cap_ready()` returned 1.
- Module._rt.frames went 356 -> 400 in 1 s (about 44 frames/s, lower than the prior run's 65/s). The loop advances. The tic count was 184.
- A pixel sample of the canvas had 82 distinct colours, so it is not blank or a single colour.
- early.png (viewed): a first-person E1M1 view with the status bar (50 ammo, 100% health, 0% armor) and a green armor item. Colours look correct and nothing is corrupted. The shot is not of the title screen, probably because the capture came several seconds after load. The prior report saw the title screen.
- Console: 0 errors, 2 warnings (console.txt).

## Evidence (this directory)
early.png, console.txt, server.log, server.pid, rev.txt. Playwright captures are in artifacts/browser/.

## Findings
1. Minor, owner coder_input_audio: the AudioContext autoplay warning appears at audio_web.js:27 and :53 before a user gesture. This is expected under the autoplay policy. I did not verify that audio resumes after the first gesture.
2. Observation, no owner: frame rate was about 44/s here against about 65/s in the prior run. This is one 1 s sample on headless Chromium, so I do not call it a regression. coder_render_timing could confirm it.

No failed-load or console-error fault was found.

## Not verified
- Precise time to first frame, and what the very first frame looks like. This run's screenshot was taken after the title/demo had started.
- Whether the in-game view in early.png is attract-mode demo playback or a started game. I did not check.
- Clean rebuild, non-Chromium browsers, warm-cache reload, other viewports.
- Audio after a gesture.
- Movement and combat (out of scope).

## Assumptions
- Headless Playwright Chromium via MCP. Criteria: the page loads, no required asset fails, the canvas draws with plausible colours, and the loop advances.
- "Fresh" means a new query string (?r=site10). I did not clear the browser cache. server.log shows the requests.
- I wrote nothing outside OUTPUT_DIR apart from the Playwright captures in artifacts/browser/. I modified no source, tests or loop files.
