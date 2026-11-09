PASS

reviewer_site uU7oaT, 2026-11-04 ~15:51 UTC. I loaded the current dist/ build cold at http://localhost:8000 in Playwright MCP Chromium (1280x720) and watched it start. I found no loading or startup defect. The build is byte-identical to the one lFGon0 passed, and this run re-observed startup independently rather than relying on that report.

## Source identity (source-identity.txt, dist-hashes.txt, web-vs-dist.txt, newer-than-dist.txt, make-n.txt)
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 441e441ad5dfcd52…, the same hash as the latest coder, tester and reviewer_gameplay reports.
- The dist/ hashes match reviewer_site.lFGon0 exactly: doom.wasm 7afb94fa…, doom.js 0090630e…, doom.data 1d7d43be…, index.html 43a15c63…, plus the three helper JS files.
- web/* files are byte-identical to their dist/ copies. `find platform web Makefile -newer dist/doom.wasm` is empty, and `make -n` reports "Nothing to be done". I did not rebuild.
- The coder reports written after lFGon0 (07:49–07:50 local) made no source edits, which agrees with the unchanged hashes.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Server (server-owner.txt, served-hashes.txt, server.log, server-stopped.txt)
- At the start nothing was listening on :8000 (lsof output is empty).
- I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (PID 77152, server.pid).
- All 8 curl paths returned 200 with correct MIME types (wasm is `application/wasm`), and every served hash matched dist/.
- server.log has 15 requests, all 200.
- At the end I killed only PID 77152. After that, curl returned 000.

## Browser observations
1. **Cold load** (cold-load.json). I used a CDP cache clear plus cache disable, and a `?fresh=` query on the page URL.
   - Responses: /, render_timing.js, input_audio.js, audio_web.js, doom.js, doom.data and doom.wasm, all 200 and none from a service worker. 0 failed requests, 0 page errors.
   - First sample at 206 ms: cap_ready=1, tic 1, 0/2560 transparent sampled pixels, mean RGB (111,50,30), title "DOOM Shareware", canvas 640x400. This meets the 2 s first-frame criterion.
   - The 206 ms is when the first in-page evaluate returned (I requested 100 ms), so it is an upper bound on time to first frame.
   - Tics: 29 at 1.0 s and 99 at 3.0 s, which is 35.0/s.
   - The engine log shows W_Init "adding /doom1.wad", R_Init and S_Init, all at 55–58 ms.
2. **cold-3s.png** (viewed): TITLEPIC in correct colours. The sky is red, the logo blue and gold, the marine green, and the id logo yellow on blue. There is no R/B swap, and it is pillarboxed.
3. **Steady state** (steady-menu-geometry.json; in-page rAF for 6.0 s, about 7 s after load):
   - tic went 954→1164, which is 34.97 tics/s.
   - rAF ran at 120/s. The maximum rAF gap was 10.4 ms and the maximum tic stall was 34.9 ms, so the main thread was not blocked.
   - steady-demo.png was saved but not viewed.
4. **Escape menu** (after a canvas click):
   - menu-open.png (viewed): main menu with the skull cursor over the E1M1 demo, with correct HUD colours.
   - menu-closed.png (viewed): the menu is gone.
     - The frame has a red tint, but health goes 83%→65% between the two shots. This is vanilla's damage palette in the demo, not a colour fault. The HUD digits and status face are drawn correctly.
   - tic went 1167→1187→1206, so the demo keeps running behind the menu, as in vanilla.
5. **Geometry:**
   - At 1280x720 the canvas is 1152x720 at x=64 (aspect 1.600), with scroll size equal to the viewport.
   - At 800x600 it is 800x500 at y=50, with no scrollbars.
   - viewport-800x600.png (viewed) shows correct colours.
6. **Console** (console-warnings.log; full capture in artifacts/browser/console-2026-11-04T15-51-25-993Z.log, 35 messages): 0 errors.
   - The only warnings are 2 of Chrome's pre-gesture "AudioContext was not allowed to start" (audio_web.js:27 and :530).
   - This is expected autoplay policy before a user gesture, and the count matches lFGon0 (2 per load). Not a fault.

## Unresolved (owner)
1. Tester (carried over): stall and tic-rate checks must tolerate the ~1.1 s melt-wipe freeze. I did not re-measure the wipe this run.
2. Tester (carried over): the faults.sh expectations are overstated (swap-rb B4/B6, drop-use G3a/G3b). I did not re-check them this run.
3. UNVERIFIED, human: Firefox, Safari, real HiDPI, non-localhost latency, a real hidden tab, and audio by ear.
4. No loading or startup defect to assign to coders.

## Assumptions
- The PASS criteria are agent-proposed, not student-approved, and unchanged from prior reviewer_site runs:
  - assets 200 on a cold load, with 0 page and console errors
  - a correct-colour, non-blank frame within 2 s
  - 31.5–38.5 tics/s, excluding the wipe
  - Escape opens and closes the menu
  - 16:10 kept with no scrollbars
- "Cold" means a CDP cache clear plus disable in the shared MCP browser profile, not a fresh profile.
- Colour judgments are by eye from screenshots plus mean-RGB sampling. I did not do a pixel-exact palette comparison.
- The JSON files hold transcribed summaries of the MCP return values. The raw output is in the session transcript.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only, plus the MCP console capture in artifacts/browser/. No source, test, or build files were changed. agent.log in OUTPUT_DIR was written by the loop and was not touched.

## Next action
None for coders on startup. The tester should address the carried-over faults.sh and wipe-tolerance items. A human should check Firefox/Safari/HiDPI.
