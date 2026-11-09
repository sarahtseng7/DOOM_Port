PASS

I loaded the current dist/ build cold at http://localhost:8000 (Playwright MCP Chromium, 2026-11-04 ~09:00 UTC) and watched it start.

- All 7 assets returned HTTP 200, with 0 failed requests, 0 page errors and 0 console errors.
- The first correctly coloured TITLEPIC frame was drawn by 340 ms after navigation commit.
- The steady tic rate is 34.89/s, with no stall during the demo.
- Escape opens and closes the menu, and the canvas keeps 16:10 at 1280x720 and 800x600.

There is one new observation: `gametic` freezes for about 1.17 s at the title→demo handoff. I checked this, and it is the engine's melt wipe working as designed, not a hang (see below). This covers loading and startup only. Movement, combat and audio depth belong to reviewer_gameplay.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 320b73c4c8ae5476…, the same as the prior reviewer_site report.
- Per-path diff hashes are unchanged: platform 1acdffa1e570967d, web 85ac276c9dfe4d6d, tests c0501e435fcc724a, loop 61ff85ca3ce21ac8.
- `make -n` printed "Nothing to be done for `all'". Nothing in platform/, web/, Makefile or tests/ is newer than dist/doom.wasm. I did not rebuild.
- dist sha256 prefixes match the prior report:
  - doom.wasm 7afb94fa1ec64b5c
  - doom.js 0090630eeaf16a87
  - doom.data 1d7d43be501e67d9
  - index.html 5905489e041214ce
  - audio_web.js 09969002dba66a00
  - input_audio.js cc5e94829d3893bf
  - render_timing.js e4114e9951ad4ed1
- The four web/ files are byte-identical (cmp) to their dist/ copies.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Server
- PID 13430 listens on 127.0.0.1:8000. It started 2026-11-03 23:25:53 and runs `python -m http.server 8000 --bind 127.0.0.1 --directory dist` with cwd at this repo. It is the same process as in the prior report.
- I did not start it, so I left it running.
- All 7 files served by curl are 200 and hash-identical to dist/ (served-hashes.txt).

## Work and evidence (this directory)
1. **Cold load** at 1280x720. I used a CDP cache clear plus `setCacheDisabled`, then sampled canvas and tics every ~100 ms for 5.4 s.
   - At 55 ms: transparent 640x400 canvas, no Module yet.
   - At 232 ms: tic 0.
   - At 340 ms: tic 3, 150 colour buckets, 0 transparent pixels, mean RGB (110,50,30), and the title changed to "DOOM Shareware".
   - Responses: index.html, input_audio.js, audio_web.js, render_timing.js, doom.js, doom.data and doom.wasm, all 200.
   - title-1s.png (viewed, tic 36): TITLEPIC with correct colours (red sky, blue/gold logo, green armour, yellow/blue id logo, gold bottom text). No channel swap.
   - Geometry: the canvas is 1152x720 at x=64 (pillarboxed), and scroll size equals the viewport.
2. **Title→demo pause investigated.** Tool-paced sampling showed tic stuck at 172 at the end of the window. I re-measured in-page with rAF on reloads:
   - tic stayed at 172 from 4947 to 6122 ms, i.e. 1175 ms. It was the only gap over 60 ms in 9 s, and the maximum rAF gap was 12 ms, so the main thread was not blocked.
   - Canvas hashes during that window gave 40 distinct frames out of 141 samples, so the screen was animating.
   - startup.png (viewed, ~5.4 s) captured TITLEPIC partway through the melt into E1M1.
   - Cause: `cap_tic_count()` returns `gametic` (platform/doomgeneric_wasm.c:82). D_Display's wipe loop (third_party/doomgeneric/d_main.c:308–326) runs the melt without advancing gametic.
   - Conclusion: expected engine behaviour, not a port defect. I note it because a tic-stall check that spans the first ~6 s would flag it falsely. The prior report's 0 ms stall came from a window that ended at 4.9 s, before the wipe.
3. **Steady demo:** tic 600→814 over 6.13 s is 34.89/s, with a maximum stall of 0 ms in 100 ms sampling. demo-steady.png was not viewed.
4. **Escape menu** (after tic > 260 and a canvas click):
   - menu-open.png (viewed): DOOM main menu with the skull cursor over the E1M1 demo, and correct HUD colours.
   - menu-closed.png (viewed): the menu is gone and the demo continues (pistol firing).
   - tic went 541→559→579, so the demo keeps running behind the menu, as in vanilla.
5. **Resize:** at 800x600 the canvas is 800x500 at y=50, with scroll size 800x600 and no scrollbars (viewport-800x600.png).
6. **Console** (console.log, 155 messages over all loads):
   - 0 errors and 23 warnings. Every warning is "AudioContext was not allowed to start" (audio_web.js:27/:53), which is the autoplay policy before a gesture.
   - The engine log shows `W_Init: adding /doom1.wad` and `I_InitGraphics … RGBA 8888, red_off 16`.
7. **Network:** network.txt has all requests across 5 loads, and none is non-200.

## Unresolved (owner)
1. Cosmetic, coder (carried over, not blocking): the static `<title>` in web/index.html is "Doom (WASM)" for about 300 ms, until the engine sets "DOOM Shareware".
2. Note for tester, not a defect: there is an expected ~1.2 s `gametic` freeze during the title→demo melt wipe, at about 5 s after load. Any stall or tic-rate check should exclude that window or measure frame progress instead of gametic.
3. UNVERIFIED, tester/human (carried over): a clean rebuild, Firefox and Safari, real HiDPI, non-localhost latency, a real hidden tab, and audio by ear.
4. No loading or startup defect to assign to coders.

## Comparison with the prior reviewer_site report
- Same source and dist hashes, and the same server process.
- First frame: ≤340 ms now, 266 ms before (100 ms sampling granularity).
- Steady tic rate: 34.89/s, the same as before.
- New this run: the wipe pause, characterised above as expected.
- The prior report's dropped-input anomaly was not re-examined because input depth is outside startup scope. I did not call `_cap_input_reset`.

## Assumptions
- The PASS criteria are agent-proposed, not student-approved, and unchanged:
  - assets 200 on a cold load, with 0 page and console errors
  - a non-blank, correctly coloured frame within 2 s
  - a steady tic rate of 31.5–38.5/s, excluding the engine's wipe
  - Escape opens and closes the menu
  - the aspect ratio is kept
- Autoplay warnings are not failures.
- "Cold" means a CDP cache clear plus disable in the MCP profile, not a fresh profile.
- Colours were judged by eye from screenshots.
- Numbers are transcribed from tool results in this session.
- Manual interventions: none. Token usage: not available.
- Writes: only this OUTPUT_DIR, plus the Playwright console capture under artifacts/browser/. No source, test, loop or config edits, no result.json, and the existing server was not stopped.

## Next action
Nothing for coders. Tester: if a startup stall check exists, confirm it tolerates the melt-wipe pause, then rerun `tests/verify.sh` after any source change. Human: cross-browser, HiDPI, hidden-tab and audio-by-ear checks.
