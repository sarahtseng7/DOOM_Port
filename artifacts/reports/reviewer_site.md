PASS

reviewer_site kSPGNA, 2026-11-04 ~19:09–19:13 UTC. I loaded the current dist/ build cold at http://localhost:8000 in Playwright MCP Chromium (1280x720) and watched it start. I found no loading or startup defect. The build is byte-identical to the one RUjcrA passed, and this run observed startup on its own rather than relying on that report.

## Source identity (source-identity.txt, dist-hashes.txt, web-vs-dist.txt, newer-than-dist.txt, make-n.txt)
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 441e441ad5dfcd52…, the same as RUjcrA.
- The dist/ hashes are unchanged: doom.wasm 7afb94fa…, doom.js 0090630e…, doom.data 1d7d43be…, index.html 43a15c63…, plus the three helper JS files.
- web/* matches dist/ byte for byte. `find platform web Makefile -newer dist/doom.wasm` is empty, and `make -n` says "Nothing to be done". I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Server (server-owner.txt, served-hashes.txt, server.log, server.pid, server-stopped.txt)
- At the start nothing was listening on :8000 (checked with lsof).
- I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (PID 1981).
- Curl of / and all 7 files returned 200 with correct MIME types (wasm is `application/wasm`). Every served hash matched dist/.
- server.log has 22 lines, none of them non-200.
- At the end I killed only PID 1981. After that, curl returned 000.

## Browser observations
1. **Cold load** (cold-load.json, transcribed from the MCP return value). I used a CDP cache clear plus cache disable, and a `?fresh=` query on the page URL.
   - Responses: /, input_audio.js, render_timing.js, audio_web.js, doom.js, doom.data and doom.wasm, all 200 and none from a service worker. 0 failed requests, 0 page errors.
   - Samples, timed from just before `goto`:
     - At 24 ms after `goto` returned: cap_ready=1, tic 2, 0/2560 transparent pixels, mean RGB (110,50,30), the TITLEPIC signature, canvas 640x400, title "DOOM Shareware".
     - At 1.0 s: tic 33.
     - At 3.0 s: tic 103, giving 35.0 tics/s.
   - First frame meets the 2 s criterion.
   - Engine log: W_Init (adding /doom1.wad), R_Init, S_Init, then I_InitGraphics (640x400, RGBA 8888, red_off 16, blue_off 0).
2. **cold-3s.png** (viewed): the DOOM TITLEPIC in correct colours (red sky, blue/gold logo, green marine, yellow id logo), pillarboxed at 1152x720, x=64.
3. **Steady state** (steady-menu-geometry.json; in-page rAF for 6.0 s):
   - tic went 711→921, which is 34.98 tics/s.
   - rAF ran at 120.1/s. The maximum rAF gap was 10.4 ms and the maximum tic stall was 35 ms, so the main thread was not blocked.
4. **Escape menu:**
   - menu-open.png (viewed): the main menu with the skull cursor over the E1M1 demo, in correct colours.
   - menu-closed.png (viewed): the menu is gone and the demo view shows normal colours.
   - tic went 944→967→989, so the demo keeps running behind the menu, as in vanilla.
5. **Geometry:**
   - At 1280x720 the canvas is 1152x720 at x=64, and scroll size equals the viewport.
   - At 800x600 it is 800x500 at y=50, with scroll size 800x600 (no scrollbars).
   - viewport-800x600.png (viewed) shows correct colours.
6. **Console** (full capture in artifacts/browser/console-2026-11-04T19-10-27-431Z.log): 0 errors.
   - The only warnings are Chrome's two pre-gesture "AudioContext was not allowed to start" messages (audio_web.js:27 and :53).
   - This is expected autoplay policy and matches RUjcrA.

## Unresolved (owner)
1. Tester (carried over from RUjcrA): stall and tic-rate checks must tolerate the ~1.1 s melt-wipe freeze. I did not re-measure the wipe.
2. Tester (carried over): tidy the faults.sh expected-ID table (swap-rb B6, drop-use G3b).
3. Coder (cosmetic, carried over): the static `<title>` shows briefly. This does not block startup.
4. UNVERIFIED, human: Firefox, Safari, real HiDPI, non-localhost latency, a real hidden tab, and audio by ear.
5. No new loading or startup defect to assign to coders.

## Assumptions
- The PASS criteria are agent-proposed, not student-approved, and unchanged from prior reviewer_site runs:
  - assets 200 on a cold load, with 0 page and console errors
  - a correct-colour, non-blank frame within 2 s
  - 31.5–38.5 tics/s, excluding the wipe
  - Escape opens and closes the menu
  - 16:10 kept with no scrollbars
- "Cold" means a CDP cache clear plus disable in the shared MCP browser profile, not a fresh profile.
- Colour judgments are by eye from screenshots plus downsampled mean-RGB. I did not do a pixel-exact palette comparison.
- The JSON evidence files were transcribed from MCP return values, because the page-side code cannot write files. The screenshots were written directly by Playwright.
- Movement, combat and audio depth are left to reviewer_gameplay.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only, plus the MCP console capture in artifacts/browser/. No source, test or build files were changed. agent.log was written by the loop and was not touched.

## Next action
None for coders on startup. The tester should address the carried-over wipe-tolerance and faults.sh items. A human should check Firefox/Safari/HiDPI and listen to the audio.
