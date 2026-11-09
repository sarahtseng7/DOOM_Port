PASS

reviewer_site, 2026-11-04 ~10:03 UTC. I loaded the current dist/ build cold at http://localhost:8000 in Playwright MCP Chromium and watched it start.

- All 7 assets returned HTTP 200, with 0 failed requests, 0 page errors and 0 console errors.
- The first correctly coloured TITLEPIC frame was drawn by 307 ms after navigation commit.
- The steady tic rate is 34.97/s.
- Escape opens and closes the menu.
- The canvas keeps 16:10 at 1280x720 and at 800x600.

This covers loading and startup only. Movement, combat and audio depth belong to reviewer_gameplay.

## Source identity (source-identity.txt, dist-hashes.txt, newer-than-dist.txt)
- HEAD e500c44 plus uncommitted changes.
- `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 92e25d7245a7dafd…
  - This differs from the prior report's 320b73c4…, so the working tree changed after that run.
  - The only files newer than dist/doom.wasm are tests/faults.sh, tests/playtest.mjs and tests/README.md. None of them is a build input.
  - Per-path hashes (tracked diff plus untracked files): platform c242d33f, web 6c3f745f, tests ffb79e8a, loop 82b4baf4. These use a different method from the prior report's per-path hashes, so do not compare them directly.
- `make -n` printed "Nothing to be done for `all'". I did not rebuild.
- dist sha256 prefixes are identical to the prior report:
  - doom.wasm 7afb94fa1ec64b5c
  - doom.js 0090630eeaf16a87
  - doom.data 1d7d43be501e67d9
  - index.html 5905489e041214ce
  - audio_web.js 09969002dba66a00
  - input_audio.js cc5e94829d3893bf
  - render_timing.js e4114e9951ad4ed1
- web/{index.html, audio_web.js, input_audio.js, render_timing.js} are byte-identical (cmp) to their dist/ copies.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Server (server-owner.txt, served-hashes.txt, server.log)
- At the start nothing was listening on :8000. The prior report's PID 13430 was gone.
- I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (PID 31321).
- curl of all 7 files returned 200, and each was hash-identical to dist/.
- server.log has 21 requests, all 200.
- I stopped the server at the end, and port 8000 is free again.

## Work and evidence (this directory)
1. **Cold load** at 1280x720. I used a CDP cache clear plus `setCacheDisabled`, then took 60 samples about 115 ms apart.
   - At 36 ms: transparent 640x400 canvas, no Module yet.
   - At 196 ms: tic 0.
   - At 307 ms: tic 3, 0 transparent pixels, mean RGB (111,52,31), and the title changed to "DOOM Shareware".
   - The responses were index.html, input_audio.js, audio_web.js, render_timing.js, doom.js, doom.data and doom.wasm, all 200 and none from a service worker.
   - The engine log shows `W_Init` and `I_InitGraphics … RGBA 8888, red_off 16`.
2. **title-1s.png** (viewed, tic 36): TITLEPIC with correct colours (red sky, blue/gold logo, green armour, yellow/blue id logo, gold footer text). No channel swap.
3. **Title→demo melt wipe** reproduced as the prior report described.
   - tic stays at 172 from 5128 ms to 6200 ms, about 1.07 s at ~115 ms granularity.
   - During that time the canvas mean colour falls steadily from (111,52,31) to (46,41,35), so the screen is animating the melt and is not hung.
   - Ticking resumes at 6318 ms.
   - This is expected engine behaviour (the D_Display wipe loop does not advance gametic) and is not a defect.
4. **Steady demo** (in-page rAF over 6.0 s):
   - tic went 478→688, which is 34.97/s.
   - The maximum tic stall was 35 ms and the maximum rAF gap was 12.7 ms, so the main thread was not blocked.
   - demo-start.png (viewed): E1M1 with correct wall, flesh and HUD colours.
5. **Escape menu** (after tic > 260 and a canvas click):
   - menu-open.png (viewed): DOOM main menu with the skull cursor over the demo.
   - menu-closed.png (viewed): the menu is gone and the demo continues.
   - tic went 277→296→312, so the demo keeps running behind the menu, as in vanilla.
6. **Geometry:**
   - At 1280x720 the canvas is 1152x720 at x=64 (pillarboxed), and scroll size equals the viewport.
   - At 800x600 it is 800x500 at y=50, with scroll size 800x600 and no scrollbars (viewport-800x600.png, not viewed).
7. **Console** (console-warnings.log; full log at artifacts/browser/console-2026-11-04T10-03-08-304Z.log):
   - 68 messages, 0 errors, 2 warnings.
   - Both warnings are "AudioContext was not allowed to start" (audio_web.js:27/:53), which is the autoplay policy before a user gesture.
8. **Network** (network.txt): 14 requests across 2 loads, all 200.

## Unresolved (owner)
1. Cosmetic, coder (carried over, not blocking): the static `<title>` in web/index.html is "Doom (WASM)" for about 300 ms, until the engine sets "DOOM Shareware".
2. Tester (carried over): stall and tic-rate checks must exclude the ~1.1 s melt-wipe gametic freeze at about 5 s after load, or measure frame change instead.
3. Tester/human: the working tree changed since the last verified run (tests/ only; the build is unchanged). Rerun `tests/verify.sh` so protected results cite the current revision hash 92e25d72….
4. UNVERIFIED, tester/human (carried over): a clean rebuild, Firefox and Safari, real HiDPI, non-localhost latency, a real hidden tab, and audio by ear.
5. No loading or startup defect to assign to coders.

## Assumptions
- The PASS criteria are agent-proposed, not student-approved, and unchanged from prior reviewer_site runs:
  - assets 200 on a cold load, with 0 page and console errors
  - a non-blank, correctly coloured frame within 2 s
  - a steady tic rate of 31.5–38.5/s, excluding the engine's wipe
  - Escape opens and closes the menu
  - the aspect ratio is kept
- Autoplay warnings are not failures.
- "Cold" means a CDP cache clear plus disable in the MCP browser profile, not a fresh profile.
- Colours were judged by eye from screenshots, backed by mean-RGB samples.
- Timings come from tool-paced sampling (about 115 ms), so the first-frame time is an upper bound.
- Manual interventions: none. Token usage: not available.
- Writes: only this OUTPUT_DIR, plus the Playwright console capture under artifacts/browser/. No source, test, loop or config edits, and no result.json. I started and stopped only my own server.

## Next action
Nothing for coders. Tester: rerun `tests/verify.sh` against the current revision and confirm that any stall check tolerates the melt wipe. Human: cross-browser, HiDPI, hidden-tab and audio-by-ear checks.
