FINDINGS

Startup was observed working on the current dist/ build at http://localhost:8000. No failed loads and no console errors. This is FINDINGS rather than PASS because time-to-first-frame and the title screen, post-gesture audio, a cold-cache load and other browsers or viewports were not verified (see Not verified). One minor audio warning also remains.

## Work
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/REVIEWER.md, artifacts/reports/reviewer_site.md and artifacts/reports/tester.md. I did not read platform/README.md, and artifacts/specification.md and acceptance-criteria.md do not exist.
- Port 8000 had no listener. I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (pid in server.pid), then stopped it and confirmed the port is closed.
- Build currency: `make -n` printed "Nothing to be done". web/{index.html,input_audio.js,audio_web.js,render_timing.js} are byte-identical to dist/ (cmp). rev.txt has the doom.wasm sha256 prefix (7afb94fa1ec64b5c) and HEAD e500c44 plus uncommitted changes.
- Loaded `/?r=site_sLn6b5` in headless Playwright Chromium.
  - Title "DOOM Shareware". Canvas 640x400, shown at 1152x720 CSS. `_cap_ready()` = 1.
  - 6 subresources, all HTTP 200: audio_web.js, input_audio.js, render_timing.js, doom.js, doom.data (4.2 MB), doom.wasm (556 KB). Everything was fetched by 23 ms; DOMContentLoaded and load both fired at 23 ms. server.log shows only 200 responses (doom.wasm fetched twice, which looks like the normal compile/instantiate fetch).
  - Tic rate over 3 x 3 s windows: 35.0, 34.9, 35.0 tics/s, matching Doom's 35/s. A first 2 s sample read about 17/s, so it was low. I did not investigate why, and the three later windows were normal. It is probably timing noise from the evaluate call, but I can't confirm that.
  - Sampled canvas pixels: 77 distinct colours, so it is not blank.
  - startup.png (viewed): uncorrupted render with HUD (ammo 50, health 100%, armor 100%, face, arms panel, ammo table) and the message "PICKED UP THE ARMOR." The scene is a close-up of a wall texture, with a weapon sprite at the bottom, which suggests the attract demo is running. Colours look natural, with no red/blue swap. The 3D view is very blocky, which is consistent with the wall being very close, but I did not compare it against a reference.
- Console: 35 messages, 0 errors, 2 warnings.

## Evidence (this directory)
startup.png, console.txt, server.log, server.pid, rev.txt. Playwright captures are also in artifacts/browser/.

## Findings
1. Minor, owner coder_input_audio: the AudioContext autoplay warning at audio_web.js:27 and :53, before any user gesture. This is expected under browser policy. Whether audio resumes after a gesture is not verified, and tester.md lists audio correctness as UNVERIFIED.
2. Low, owner coder (web/index.html and the runtime title code): the static title is "Doom (WASM)" per the prior report but the runtime title is "DOOM Shareware". I did not recheck the static file. It is cosmetic, and I can't tell whether it is intended.
3. No blocking defects found in loading or startup.

## Not verified
- Time to first frame and the title screen. I evaluated about 4 s after navigation, once the demo was already running.
- Cache-cleared load. The query string only busts the HTML URL, and the subresources may have come from the browser cache. The `transferSize` values are nonzero, which suggests network transfers, but I did not prove it.
- Clean rebuild (the tester ran one), non-Chromium browsers, other viewports and HiDPI.
- Audio after a gesture. Movement, combat and audio depth belong to reviewer_gameplay.

## Assumptions
- Headless Playwright Chromium via MCP. Pass criteria: the page loads, no required asset fails, the canvas draws with plausible colours, and the tic counter advances at about 35/s.
- Port 8000 was free, so I served dist/ myself. No unknown service was touched.
- I wrote nothing outside OUTPUT_DIR apart from Playwright captures in artifacts/browser/. No source, tests, loop or config files were modified, and I created no result.json.
- Manual interventions: none.
