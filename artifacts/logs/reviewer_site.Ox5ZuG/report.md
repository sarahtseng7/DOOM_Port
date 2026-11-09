PASS

reviewer_site Ox5ZuG, 2026-11-04 ~17:05–17:10 UTC. I loaded the current dist/ build cold at http://localhost:8000 in Playwright MCP Chromium (1280x720) and watched it start. I found no loading or startup defect. The build is byte-identical to the one uU7oaT and lFGon0 passed, and this run re-observed startup independently rather than relying on those reports.

## Source identity (source-identity.txt, dist-hashes.txt, web-vs-dist.txt, newer-than-dist.txt, make-n.txt)
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 441e441ad5dfcd52…, the same hash as uU7oaT and the latest coder, tester and reviewer_gameplay reports.
- That hash covers tracked files only. Untracked platform/ and web/ files are covered by the next two checks instead.
- The dist/ hashes match uU7oaT exactly: doom.wasm 7afb94fa…, doom.js 0090630e…, doom.data 1d7d43be…, index.html 43a15c63…, plus the three helper JS files.
- web/* files are byte-identical to their dist/ copies. `find platform web Makefile -newer dist/doom.wasm` is empty, and `make -n` reports "Nothing to be done". I did not rebuild.
- The coder reports from 09:03–09:04 local, written after uU7oaT, all say "no source edits". That agrees with the unchanged hashes.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Server (server-owner.txt, served-hashes.txt, server.log, server.pid, server-stopped.txt)
- At the start nothing was listening on :8000 (the first lsof call printed nothing).
- I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (PID 85243).
- Curl of / and the 7 files returned 200 with correct MIME types (wasm is `application/wasm`). Every served hash matched dist/.
- server.log has 15 lines, with no non-200 responses.
- At the end I killed only PID 85243. After that, curl returned 000.

## Browser observations
1. **Cold load** (cold-load.json). I used a CDP cache clear plus cache disable, and a `?fresh=` query on the page URL.
   - Responses: /, render_timing.js, input_audio.js, audio_web.js, doom.js, doom.data and doom.wasm, all 200 and none from a service worker. 0 failed requests, 0 page errors.
   - First sample at 414 ms: cap_ready=1, tic 3, 0/2560 transparent sampled pixels, mean RGB (111,50,30) (the TITLEPIC signature, same as uU7oaT), canvas 640x400, title "DOOM Shareware". This meets the 2 s first-frame criterion.
   - 414 ms is when the first evaluate returned after `goto` resolved, so it is an upper bound on time to first frame.
   - Tics: 24 at 1.0 s and 94 at 3.0 s, which is 35.0/s.
   - The engine log runs W_Init "adding /doom1.wad", then R_Init, S_Init and I_InitGraphics (640x400, RGBA 8888).
2. **cold-3s.png** (viewed). It was captured a few seconds after the 3 s sample, so it shows the E1M1 demo rather than the title.
   - Colours are correct: brown imps, grey and brown walls, red HUD digits, yellow ammo counts. There is no R/B swap, and it is pillarboxed.
3. **Steady state** (steady-geometry.json; in-page rAF for 6.0 s):
   - tic went 785→995, which is 34.96 tics/s.
   - rAF ran at 120.4/s. The maximum rAF gap was 10.3 ms and the maximum tic stall was 41.6 ms, so the main thread was not blocked.
4. **Escape menu** (menu-geometry.json; after a canvas click):
   - menu-open.png (viewed): the main menu (New Game … Quit Game) with the skull cursor, in correct colours.
   - menu-closed.png (viewed): the menu is gone.
   - tic went 1307→1328→1351, so the demo keeps running behind the menu, as in vanilla.
5. **Geometry:**
   - At 1280x720 the canvas is 1152x720 at x=64 (aspect 1.600), with scroll size equal to the viewport.
   - At 800x600 it is 800x500 at y=50, with scroll size 800x600 (no scrollbars).
   - viewport-800x600.png (viewed) shows correct colours.
6. **Console** (console-warnings.log; full capture in artifacts/browser/console-2026-11-04T17-06-56-689Z.log, 35 messages): 0 errors.
   - The only warnings are 2 of Chrome's pre-gesture "AudioContext was not allowed to start" (audio_web.js:27 and :53).
   - This is expected autoplay policy, and the count matches prior runs.
   - uU7oaT cited ":530" for the second warning. This run sees ":53" on the same audio_web.js hash, so that was probably a transcription slip. Not a fault.

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
- The JSON files cold-load.json and menu-geometry.json hold transcribed MCP return values. steady-geometry.json was written directly by the MCP tool.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only, plus the MCP console capture in artifacts/browser/. No source, test, or build files were changed. agent.log in OUTPUT_DIR was written by the loop and was not touched.

## Next action
None for coders on startup. The tester should address the carried-over wipe-tolerance and faults.sh items. A human should check Firefox/Safari/HiDPI and listen to the audio.
