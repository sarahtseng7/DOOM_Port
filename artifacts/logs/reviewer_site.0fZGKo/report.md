PASS

reviewer_site 0fZGKo, 2026-11-04 ~12:56 UTC. I loaded the current dist/ build cold at http://localhost:8000 in Playwright MCP Chromium (1280x720) and watched it start. I found no loading or startup defect. This agrees with the prior reviewer_site PASS (HSI496) on the same binary.

## Source identity (source-identity.txt, dist-hashes.txt, newer-than-dist.txt, make-n.txt, web-vs-dist.txt)
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 92e25d7245a7dafd…, the same as all current reports.
- That hash covers tracked files only. I also hashed the untracked platform/web/tests/Makefile files: d8e996e443958db1… (new this run, so there is nothing to compare it with).
- dist sha256 prefixes are unchanged from prior reports:
  - doom.wasm 7afb94fa1ec64b5c
  - doom.js 0090630eeaf16a87
  - doom.data 1d7d43be501e67d9
  - index.html 5905489e041214ce
- web/* files are byte-identical to their dist/ copies.
- `find platform web Makefile -newer dist/doom.wasm` is empty, and `make -n` prints "Nothing to be done". I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Server (server-owner.txt, served-hashes.txt, server.log)
- At the start nothing was listening on :8000 (lsof rc=1).
- I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (PID 53659).
- All 7 files returned 200 with correct MIME types (wasm is `application/wasm`), and each served hash matched dist/.
- server.log has 21 requests, all 200.
- At the end I killed only PID 53659. After that, curl returned 000.

## Browser observations
1. **Cold load** (cold-load.json). I used a CDP cache clear plus cache disable.
   - Responses: /, input_audio.js, audio_web.js, render_timing.js, doom.js, doom.data and doom.wasm, all 200 and none from a service worker. 0 failed requests, 0 page errors.
   - The first sample, at 24 ms, already showed cap_ready=1, tic 1, a 640x400 canvas with 0 transparent sampled pixels, mean RGB (110,50,31), and title "DOOM Shareware".
   - The engine log shows W_Init "adding /doom1.wad", R_Init, S_Init, and I_InitGraphics at 640x400 RGBA8888.
2. **title-early.png** (viewed): TITLEPIC in correct colours. The sky is red, the logo blue and gold, the marine green, and the id logo yellow on blue. There is no R/B swap, and it is pillarboxed.
3. **Steady state** (steady-menu-geometry.json; in-page rAF for 6.0 s, about 10 s after load):
   - tic went 859→1069, which is 34.97 tics/s.
   - The maximum rAF gap was 10.3 ms and the maximum tic stall was 35.1 ms, so the main thread was not blocked.
   - demo.png (viewed): E1M1 demo with a correct HUD and neutral colours.
4. **Escape menu** (after a canvas click):
   - menu-open.png (viewed): main menu with the skull cursor.
   - menu-closed.png (viewed): the menu is gone.
   - tic went 1085→1109→1125, so the demo keeps running behind the menu, as in vanilla.
5. **Geometry:**
   - At 1280x720 the canvas is 1152x720 at x=64 (aspect 1.600), with scroll size equal to the viewport.
   - At 800x600 it is 800x500 at y=50 (aspect 1.600), with no scrollbars.
   - viewport-800x600.png (viewed) shows correct colours.
6. **Console** (console.log): 35 messages, 0 errors, 2 warnings.
   - Both warnings are Chrome's pre-gesture "AudioContext was not allowed to start".
   - This is expected autoplay policy before a user gesture, not a fault.

## Unresolved (owner), all carried over
1. Cosmetic, coder: the static `<title>` "Doom (WASM)" in web/index.html shows until the engine sets "DOOM Shareware". I did not observe it this run because the first sample came after the engine set the title. Not blocking.
2. Tester: stall and tic-rate checks must tolerate the ~1.1 s melt-wipe freeze. I did not re-measure the wipe this run.
3. Tester: the faults.sh expectations are off (swap-rb lists B6, drop-use omits G3b).
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
- The first run_code snippet contained a stray no-op statement (`require = undefined`), which ran without error and did not affect the results.
- The JSON files hold transcribed summaries of the MCP return values. The full raw output is in the session transcript, not in this folder.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only, plus the MCP console capture in artifacts/browser/. No source, test, or build files were changed.

## Next action
None for coders on startup. A human should check Firefox/Safari/HiDPI. The tester should fix the faults.sh expectations.
