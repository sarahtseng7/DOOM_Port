FINDINGS

Startup was observed working on the current dist/ build at http://localhost:8000. This is FINDINGS rather than PASS because of one minor audio warning and the unverified items below. No failed loads or console errors.

## Work
- Read AGENTS.md, loop/prompts/REVIEWER.md and the prior artifacts/reports/reviewer_site.md. No specification.md or acceptance-criteria.md exists.
- Port 8000 had no listener, so I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (pid in server.pid). I stopped it afterward and confirmed the port is closed. No unknown service was touched.
- `make -n` reports "Nothing to be done", so dist/ is current. web/{index.html,input_audio.js,audio_web.js,render_timing.js} are byte-identical to dist/ (cmp). rev.txt has the doom.wasm sha256 prefix and the HEAD revision (e500c44 plus uncommitted changes).
- First Playwright attempt (?r=site15): the navigate succeeded and the server served all 7 files with 200. The follow-up evaluate failed with "Connection closed", and the screenshot taken after it was a blank about:blank page. I discarded that screenshot and it is not evidence.
- Retry (?r=site16, new tab):
  - All 6 subresources returned 200 (input_audio.js, render_timing.js, audio_web.js, doom.js, doom.data, doom.wasm), plus the page itself. This is from the Resource Timing API and server.log.
  - Title "DOOM Shareware" (set at runtime; the static index.html says "Doom (WASM)"). Canvas 640x400. `_cap_ready()` = 1.
  - `_cap_tic_count` went 172 -> 232 over 2 s, about 30 tics/s. That is the expected Doom rate of 35 tics/s, within sampling error.
  - Canvas pixel sample: 108 distinct colours, not blank.
  - startup.png (viewed): correct, uncorrupted 3D render with HUD (ammo 48, health 100%, armor 100%, face, arms panel), natural colours, and the message "PICKED UP THE ARMOR". It shows in-game or demo play, not the title screen.
- Console: 35 messages, 0 errors, 2 warnings (console.txt, console-browser.log). The rest is engine init logs.

## Evidence (this directory)
startup.png, console.txt, console-browser.log, server.log, server.pid, rev.txt. network.txt is empty because the tool was called against a page whose state had reset. Use server.log and the resource timing results above instead. Playwright captures are also in artifacts/browser/.

## Findings
1. Minor, owner coder_input_audio: AudioContext autoplay warning (audio_web.js:27 and :53) before any user gesture. This is expected under the autoplay policy. Audio resuming after a gesture was not verified.
2. Tooling, no owner: the Playwright MCP connection dropped once during evaluate. The retry worked, and I don't think it is a site fault. I didn't investigate further.

## Not verified
- Time to first frame and the title screen. The screenshot was taken about 4 s after load, once the demo was already running.
- Clean rebuild, cache-cleared load, non-Chromium browsers, other viewports.
- Audio after a gesture. Movement, combat and audio depth belong to reviewer_gameplay.
- The page title differs between the static HTML and the runtime. I don't know whether this is intended.

## Assumptions
- Headless Playwright Chromium via MCP. Pass criteria: page loads, no required asset fails, the canvas draws with plausible colours, and the loop advances.
- "Fresh" means a new query string on a new server process. The browser cache was not cleared.
- I wrote nothing outside OUTPUT_DIR apart from Playwright captures in artifacts/browser/. No source, tests or loop files were modified.
