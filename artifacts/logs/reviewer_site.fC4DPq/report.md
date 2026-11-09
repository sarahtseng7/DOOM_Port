PASS

reviewer_site fC4DPq, 2026-11-04 ~11:02 UTC. I loaded the current dist/ build cold at http://localhost:8000 in Playwright MCP Chromium and watched it start. I found no loading or startup defect. Results match the prior reviewer_site PASS on the same binary.

## Source identity (source-identity.txt, dist-hashes.txt, newer-than-dist.txt, make-n.txt)
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 92e25d7245a7dafd…, the same as all the latest reports.
- dist sha256 prefixes: doom.wasm 7afb94fa1ec64b5c, doom.js 0090630eeaf16a87, doom.data 1d7d43be501e67d9, index.html 5905489e041214ce, input_audio.js cc5e94829d3893bf, audio_web.js 09969002dba66a00, render_timing.js e4114e9951ad4ed1. These are unchanged from the prior reports.
- web/*.html|js are byte-identical (cmp) to their dist/ copies. `find platform web Makefile -newer dist/doom.wasm` is empty and `make -n` prints "Nothing to be done". I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Server (server-owner.txt, served-hashes.txt, server.log)
- At the start nothing was listening on :8000 (lsof rc=1).
- I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (PID 38815).
- curl of all 7 files returned 200 with correct MIME types (wasm is `application/wasm`), and each served hash matched dist/.
- server.log has 14 requests, all 200.
- At the end I killed only PID 38815. After that, curl returned 000.

## Browser observations (Playwright MCP Chromium, 1280x720)
1. **Cold load.** I used a CDP `clearBrowserCache` plus `setCacheDisabled`, then sampled about every 95 ms from navigation commit.
   - 31 ms: 640x400 canvas, fully transparent, Module not ready.
   - 188 ms: tic 0, ready 0.
   - 282 ms: tic 3, ready 1, 0 transparent pixels, mean RGB (109,49,30). The title changed from "Doom (WASM)" to "DOOM Shareware".
   - 2967 ms: tic 97.
   - Responses: index, render_timing.js, audio_web.js, input_audio.js, doom.js, doom.data and doom.wasm, all 200 with none from a service worker. 0 failed requests, 0 page errors.
   - The engine log shows Z_Init, W_Init "adding /doom1.wad", R_Init, S_Init, and "startskill 2 … startmap 1".
2. **title-early.png** (viewed): TITLEPIC in correct colours. The sky is red, the logo blue and gold, the armour green, the id logo yellow on blue, and the footer text gold. There is no R/B swap, and it is pillarboxed with black bars.
3. **Steady state** (in-page rAF for 6.01 s, about 10 s after load, past the melt wipe):
   - tic went 1409→1620, which is 35.11 tics/s.
   - The maximum rAF gap was 10.4 ms and the maximum tic stall was 41.7 ms, so the main thread was not blocked.
   - demo.png (viewed): E1M1 demo with correct wall, floor and HUD colours (red numbers, gold ammo table).
4. **Escape menu** (after a canvas click):
   - menu-open.png (viewed): main menu with the skull cursor over the running demo.
   - menu-closed.png (viewed): the menu is gone and the demo continues.
   - tic went 1622→1642→1661, so the demo keeps running behind the menu, as in vanilla.
   - menu-closed.png has a yellow/green tint. It shows the "Picked up the MegaArmor" message and 200% armor, so this is Doom's normal bonus palette flash, not a colour fault.
5. **Geometry:**
   - At 1280x720 the canvas is 1152x720 at x=64 (aspect 1.600). Scroll size equals the viewport.
   - At 800x600 it is 800x500 at y=50 (aspect 1.600), with scroll size 800x600 and no scrollbars. viewport-800x600.png was saved but not viewed.
6. **Console** (console-warnings.log; full log at artifacts/browser/console-2026-11-04T11-02-25-189Z.log): 33 messages, 0 errors, 0 warnings.
   - The prior run reported 2 pre-gesture "AudioContext was not allowed to start" warnings. They did not appear in this session's capture.
   - Either way this is not a fault. The difference is probably due to the browser profile or capture scope, which I did not investigate.

## Unresolved (owner)
1. Cosmetic, coder (carried over, not blocking): the static `<title>` "Doom (WASM)" in web/index.html shows for about 280 ms, until the engine sets "DOOM Shareware".
2. Tester (carried over): stall and tic-rate checks must tolerate the ~1.1 s melt-wipe gametic freeze. I did not re-measure the wipe this run, because I sampled the steady state after it.
3. UNVERIFIED, tester/human (carried over): Firefox and Safari, real HiDPI, non-localhost latency, a real hidden tab, and audio by ear.
4. No loading or startup defect to assign to coders.

## Assumptions
- The PASS criteria are agent-proposed, not student-approved, and unchanged from prior reviewer_site runs:
  - assets 200 on a cold load, with 0 page and console errors
  - a correctly coloured, non-blank frame within 2 s
  - 31.5–38.5 tics/s, excluding the wipe
  - Escape opens and closes the menu
  - 16:10 kept with no scrollbars
- "Cold" means a CDP cache clear plus disable in the MCP profile, not a fresh profile. Sampling is tool-paced (about 95 ms), so the 282 ms first-frame time is an upper bound.
- I judged colours by eye from the screenshots, backed by mean-RGB samples.
- Manual interventions: none. Token usage: not available.
- Writes: only this OUTPUT_DIR, plus the Playwright console capture under artifacts/browser/. No source, test, loop or config edits, and no result.json. I started and stopped only my own server.

## Next action
Nothing for coders on startup. Human: cross-browser, HiDPI, hidden-tab and audio-by-ear checks. If the dist hashes change, rerun this review.
