PASS

reviewer_site HSI496, 2026-11-04 ~12:02 UTC. I loaded the current dist/ build cold at http://localhost:8000 in Playwright MCP Chromium (1280x720) and watched it start. I found no loading or startup defect. This matches the prior reviewer_site PASS on the same binary.

## Source identity (source-identity.txt, dist-hashes.txt, newer-than-dist.txt, make-n.txt)
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 92e25d7245a7dafd…, the same as the latest reports.
- dist sha256 prefixes are unchanged from the prior reports:
  - doom.wasm 7afb94fa1ec64b5c
  - doom.js 0090630eeaf16a87
  - doom.data 1d7d43be501e67d9
  - index.html 5905489e041214ce
  - input_audio.js cc5e94829d3893bf
  - audio_web.js 09969002dba66a00
  - render_timing.js e4114e9951ad4ed1
- web/* files are byte-identical (cmp) to their dist/ copies.
- `find platform web Makefile -newer dist/doom.wasm` is empty, and `make -n` prints "Nothing to be done". I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Server (server-owner.txt, served-hashes.txt, server.log)
- At the start nothing was listening on :8000 (lsof rc=1).
- I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (PID 46007).
- curl of all 7 files returned 200 with correct MIME types (wasm is `application/wasm`), and each served hash matched dist/.
- server.log has 21 requests, all 200.
- At the end I killed only PID 46007. After that, curl returned 000.

## Browser observations (cold-load.json, console.log)
1. **Cold load.** I used a CDP `Network.clearBrowserCache` plus `setCacheDisabled`, then sampled about every 100 ms from DOMContentLoaded.
   - 6–12 ms: 640x400 canvas, transparent, Module not ready, title "Doom (WASM)".
   - 116 ms: ready=1, tic 2, 0 transparent sampled pixels, mean RGB (109,50,30), title "DOOM Shareware".
   - 3206 ms: tic 111.
   - Responses: /, input_audio.js, audio_web.js, render_timing.js, doom.js, doom.data and doom.wasm, all 200 and none from a service worker. 0 failed requests, 0 page errors.
   - The engine log shows Z_Init, W_Init "adding /doom1.wad", R_Init, S_Init, "startskill 2 … startmap 1", and I_InitGraphics at 640x400 RGBA8888.
2. **title-early.png** (viewed): TITLEPIC in correct colours. The sky is red, the logo blue and gold, the armour green, the id logo yellow on blue, and the footer gold. There is no R/B swap, and it is pillarboxed with black bars.
3. **Steady state** (in-page rAF for 6.0 s, about 10 s after load):
   - tic went 983→1193, which is 35.0 tics/s.
   - The maximum rAF gap was 10.4 ms and the maximum tic stall was 34.9 ms, so the main thread was not blocked.
   - demo.png (viewed): demo gameplay with a correct HUD layout. The red tint is Doom's damage flash: a sergeant is firing at the player and health is 65%.
4. **Escape menu** (after a canvas click):
   - menu-open.png (viewed): main menu with the skull cursor over the demo. Its yellow tint is the pickup flash from "You got the shotgun".
   - menu-closed.png (viewed): the menu is gone, and the frame has normal neutral grey/brown colours.
   - tic went 1216→1236→1257, so the demo keeps running behind the menu, as in vanilla.
5. **Geometry:**
   - At 1280x720 the canvas is 1152x720 at x=64 (aspect 1.600). Scroll size equals the viewport.
   - At 800x600 it is 800x500 at y=50 (aspect 1.600), with scroll size 800x600 and no scrollbars.
   - viewport-800x600.png (viewed) shows correct colours.
6. **Console** (console.log; full log at artifacts/browser/console-2026-11-04T12-02-22-539Z.log): 35 messages, 0 errors, 2 warnings.
   - Both warnings are Chrome's pre-gesture "AudioContext was not allowed to start" (audio_web.js:27 and :53).
   - This is expected autoplay policy before a user gesture, not a fault. It reappeared this run, though the previous run did not capture it.

## Unresolved (owner)
1. Cosmetic, coder (carried over, not blocking): the static `<title>` "Doom (WASM)" in web/index.html shows for about 110 ms, until the engine sets "DOOM Shareware".
2. Tester (carried over): stall and tic-rate checks must tolerate the ~1.1 s melt-wipe gametic freeze. I did not re-measure the wipe this run, because I sampled the steady state after it.
3. Tester (carried over from the tester report): faults.sh expectations overstate B6's coverage of swap-rb and omit G3b for drop-use.
4. UNVERIFIED, tester/human (carried over): Firefox and Safari, real HiDPI, non-localhost latency, a real hidden tab, and audio by ear.
5. No loading or startup defect to assign to coders.

## Assumptions
- The PASS criteria are agent-proposed, not student-approved, and unchanged from prior reviewer_site runs:
  - assets 200 on a cold load, with 0 page and console errors
  - a correctly coloured, non-blank frame within 2 s
  - 31.5–38.5 tics/s, excluding the wipe
  - Escape opens and closes the menu
  - 16:10 kept with no scrollbars
- "Cold" means a CDP cache clear plus disable in the MCP profile, not a fresh profile.
- My first run_code attempt aborted (`require` is unavailable in the MCP sandbox) after it had registered an init script. That is why cold-load.json has duplicate samples about 15 ms apart. It does not affect the results.
- Colour judgments are by eye from screenshots plus mean-RGB sampling. I did not do a pixel-exact palette comparison.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only, plus the MCP console capture in artifacts/browser/. No source, test, or build files were changed.

## Next action
None for coders on startup. A human should check Firefox/Safari/HiDPI. The tester should fix the faults.sh expectations.
