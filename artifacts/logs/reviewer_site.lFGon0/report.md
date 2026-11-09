PASS

reviewer_site lFGon0, 2026-11-04 ~15:03 UTC. I loaded the current dist/ build cold at http://localhost:8000 in Playwright MCP Chromium (1280x720) and watched it start. I found no loading or startup defect. The cosmetic title item from the prior PASS (qSiYJ9) is now fixed.

## Source identity (source-identity.txt, dist-hashes.txt, web-vs-dist.txt, newer-than-dist.txt, make-n.txt, index-html.diff)
- HEAD e500c44 plus uncommitted changes. The full `git status` and the diff hash are in source-identity.txt.
- The only change since qSiYJ9 is index.html:
  - Its hash went from 5905489e… to 43a15c63….
  - The static `<title>` is now "DOOM Shareware" (index-html.diff).
- doom.wasm 7afb94fa…, doom.js 0090630e…, doom.data 1d7d43be…, and the three helper JS files all have the same hashes as qSiYJ9.
- web/* files are byte-identical to their dist/ copies.
- `find -newer dist/doom.wasm` lists only web/ and web/index.html. These are JS/HTML edits that are already copied into dist/. `make -n` reports "Nothing to be done". I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Server (server-owner.txt, served-hashes.txt, server.log, server-stopped.txt)
- At the start nothing was listening on :8000 (lsof output is empty).
- I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (PID 69702).
- All 8 paths returned 200 with correct MIME types (wasm is `application/wasm`), and every served hash matched dist/.
- server.log has 22 requests, all 200.
- At the end I killed only PID 69702. After that, curl returned 000.

## Browser observations
1. **Cold load** (cold-load.json). I used a CDP cache clear plus cache disable.
   - Responses: /, render_timing.js, input_audio.js, audio_web.js, doom.js, doom.data and doom.wasm, all 200 and none from a service worker. 0 failed requests, 0 page errors.
   - At 101 ms: cap_ready=1, tic 1, 0/2560 transparent sampled pixels, mean RGB (111,50,30), title "DOOM Shareware". This meets the 2 s first-frame criterion.
   - The title is now correct from the first sample, so there is no "Doom (WASM)" flash.
   - Tics: 29 at 1.0 s and 64 at 2.0 s, which is 35/s.
   - The engine log shows W_Init "adding /doom1.wad", R_Init and S_Init.
2. **title-actual.png** (viewed; taken 300 ms after cap_ready on reload): TITLEPIC in correct colours. The sky is red, the logo blue and gold, the marine green, and the id logo yellow on blue. There is no R/B swap, and it is pillarboxed.
   - demo-after-load.png (viewed; taken a few seconds after the cold load): E1M1 demo with correct HUD colours and skin tones.
   - I renamed this file from title-early.png because it shows the demo, not the title.
3. **Steady state** (steady-menu-geometry.json; in-page rAF for 6.0 s, about 9 s after load):
   - tic went 809→1019, which is 35.0 tics/s.
   - The maximum rAF gap was 10.3 ms and the maximum tic stall was 34.8 ms, so the main thread was not blocked.
   - demo.png was saved but not viewed. demo-after-load.png covers the same view.
4. **Escape menu** (after a reload and a canvas click):
   - menu-open.png (viewed): main menu with the skull cursor.
   - menu-closed.png (viewed): the menu is gone.
   - tic went 203→233→250, so the demo keeps running behind the menu, as in vanilla.
5. **Geometry:**
   - At 1280x720 the canvas is 1152x720 at x=64 (aspect 1.600), with scroll size equal to the viewport.
   - At 800x600 it is 800x500 at y=50, with no scrollbars.
   - viewport-800x600.png (viewed) shows correct colours.
6. **Console** (console-warnings.log; full capture in artifacts/browser/console-2026-11-04T15-03-13-332Z.log, 70 lines for 2 loads): 0 errors.
   - The only warnings are Chrome's pre-gesture "AudioContext was not allowed to start" (audio_web.js), 2 per load.
   - This is expected autoplay policy before a user gesture, not a fault.
   - qSiYJ9 reported 1 such warning, but audio_web.js is byte-identical. The difference is probably in how the warnings were counted. Not a fault.

## Unresolved (owner)
1. Tester (carried over): stall and tic-rate checks must tolerate the ~1.1 s melt-wipe freeze. I did not re-measure the wipe this run.
2. Tester (carried over): the faults.sh expectations are off (swap-rb lists B6, drop-use omits G3b). I did not re-check them this run.
3. UNVERIFIED, human: Firefox, Safari, real HiDPI, non-localhost latency, a real hidden tab, and audio by ear.
4. No loading or startup defect to assign to coders.

## Assumptions
- The PASS criteria are agent-proposed, not student-approved, and unchanged from prior reviewer_site runs:
  - assets 200 on a cold load, with 0 page and console errors
  - a correct-colour, non-blank frame within 2 s
  - 31.5–38.5 tics/s, excluding the wipe
  - Escape opens and closes the menu
  - 16:10 kept with no scrollbars
- "Cold" means a CDP cache clear plus disable in the MCP profile, not a fresh profile.
- Colour judgments are by eye from screenshots plus mean-RGB sampling. I did not do a pixel-exact palette comparison.
- The JSON files hold transcribed summaries of the MCP return values. The raw output is in the session transcript.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only, plus the MCP console capture in artifacts/browser/. No source, test, or build files were changed. agent.log in OUTPUT_DIR was written by the loop and was not touched.

## Next action
None for coders on startup. A human should check Firefox/Safari/HiDPI. The tester should address the carried-over faults.sh and wipe-tolerance items.
