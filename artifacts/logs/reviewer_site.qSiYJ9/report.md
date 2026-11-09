PASS

reviewer_site qSiYJ9, 2026-11-04 ~13:56 UTC. I loaded the current dist/ build cold at http://localhost:8000 in Playwright MCP Chromium (1280x720) and watched it start. I found no loading or startup defect. This agrees with the prior reviewer_site PASS (0fZGKo) on the same binary.

## Source identity (source-identity.txt, dist-hashes.txt, newer-than-dist.txt, make-n.txt, web-vs-dist.txt)
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 92e25d7245a7dafd…, the same as the prior reports.
- dist sha256 prefixes are unchanged from prior reports:
  - doom.wasm 7afb94fa1ec64b5c
  - doom.js 0090630eeaf16a87
  - doom.data 1d7d43be501e67d9
  - index.html 5905489e041214ce
- web/* files are byte-identical to their dist/ copies.
- `find platform web Makefile -newer dist/doom.wasm` is empty, and `make -n` prints "Nothing to be done". I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Server (server-owner.txt, served-hashes.txt, server.log, server-stopped.txt)
- At the start nothing was listening on :8000 (lsof rc=1).
- I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (PID 60911).
- All 7 files returned 200 with correct MIME types (wasm is `application/wasm`), and each served hash prefix matched dist/.
- server.log has 14 requests, all 200.
- At the end I killed only PID 60911. After that, curl returned 000.

## Browser observations
1. **Cold load** (cold-load.json). I used a CDP cache clear plus cache disable.
   - Responses: /, render_timing.js, input_audio.js, audio_web.js, doom.js, doom.data and doom.wasm, all 200 and none from a service worker. 0 failed requests, 0 page errors.
   - At 170 ms (before engine init) the canvas was blank and the title was the static "Doom (WASM)". This is the first run that has directly observed carry-over item 1.
   - At 279 ms the sample showed cap_ready=1, tic 3, 0 transparent sampled pixels, mean RGB (110,50,30), and title "DOOM Shareware". This meets the 2 s first-frame criterion.
   - The engine log shows W_Init "adding /doom1.wad", R_Init, S_Init, and I_InitGraphics at 640x400 RGBA8888.
2. **title-early.png** (viewed): TITLEPIC in correct colours. The sky is red, the logo blue and gold, the marine green, and the id logo yellow on blue. There is no R/B swap, and it is pillarboxed.
3. **Steady state** (steady-menu-geometry.json; in-page rAF for 6.0 s, about 9 s after load):
   - tic went 555→766, which is 35.14 tics/s.
   - The maximum rAF gap was 10.3 ms and the maximum tic stall was 34.8 ms, so the main thread was not blocked.
   - demo.png (viewed): E1M1 demo with a correct HUD and neutral colours.
4. **Escape menu** (after a canvas click):
   - menu-open.png (viewed): main menu with the skull cursor.
   - menu-closed.png (viewed): the menu is gone.
   - tic went 998→1025→1052, so the demo keeps running behind the menu, as in vanilla.
5. **Geometry:**
   - At 1280x720 the canvas is 1152x720 at x=64 (aspect 1.600), with scroll size equal to the viewport.
   - At 800x600 it is 800x500 at y=50, with no scrollbars.
   - viewport-800x600.png (viewed) shows correct colours.
6. **Console** (console-warnings.log; full capture in artifacts/browser/console-2026-11-04T13-56-53-230Z.log): 34 messages, 0 errors, 1 warning.
   - The warning is Chrome's pre-gesture "AudioContext was not allowed to start" (audio_web.js:271).
   - This is expected autoplay policy before a user gesture, not a fault.

## Unresolved (owner)
1. Cosmetic, coder: the static `<title>` "Doom (WASM)" in web/index.html shows until the engine sets "DOOM Shareware". I observed this at t=170 ms for about 0.1–0.3 s. The canvas is also blank (#111 background) during that time. Not blocking.
2. Tester (carried over): stall and tic-rate checks must tolerate the ~1.1 s melt-wipe freeze. I did not re-measure the wipe this run.
3. Tester (carried over): the faults.sh expectations are off (swap-rb lists B6, drop-use omits G3b). I did not re-check them this run.
4. UNVERIFIED, human: Firefox, Safari, real HiDPI, non-localhost latency, a real hidden tab, and audio by ear.
5. No loading or startup defect to assign to coders.

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
- Writes: this OUTPUT_DIR only, plus the MCP console capture in artifacts/browser/. No source, test, or build files were changed.

## Next action
None for coders on startup, apart from the optional cosmetic title fix. A human should check Firefox/Safari/HiDPI. The tester should fix the faults.sh expectations.
