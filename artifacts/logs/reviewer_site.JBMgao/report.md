PASS

I loaded the current dist/ build cold at http://localhost:8000 in Playwright MCP Chromium and watched it start. All 7 assets returned HTTP 200, with 0 failed requests, 0 page errors and 0 console errors. The first correctly coloured frame (TITLEPIC) drew about 122 ms after navigation commit. The tic rate was 35.0/s from the first tic. Escape opens and closes the menu at steady state, and the canvas keeps 16:10 at both viewports I tried. This covers loading and startup only. Movement, combat and audio depth belong to reviewer_gameplay.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` prefix abd25326f8b63876, the same as every report in artifacts/reports/. That hash does not cover untracked files. To cover them, I also hashed the untracked files in platform/, web/ and Makefile: prefix 5f7d9f019b6494b5 (untracked-src.sha). There is no earlier value to compare it with.
- dist/ sha256 prefixes, all unchanged from the prior reviewer_site run:
  - doom.wasm 7afb94fa1ec64b5c
  - doom.js 0090630eeaf16a87
  - doom.data 1d7d43be501e67d9
  - index.html 5905489e041214ce
  - audio_web.js 09969002dba66a00
  - input_audio.js cc5e94829d3893bf
  - render_timing.js e4114e9951ad4ed1
- The four web/ files are byte-identical (cmp) to their dist/ copies. emcc is 4.0.18. `make -n` printed "Nothing to be done for `all'", so I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, BUILD.md, the Makefile, my role prompt, and all six reports in artifacts/reports/. None reports an open loading or startup defect.
- Port 8000 had no listener (curl 000). I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (PID 6648, in server.pid). The served `/` hashed to 5905489e…, which matches dist/index.html.
- Run 1, cold load:
  - Cleared and disabled the cache through CDP, then loaded `/?r=<ts>` at 1280x720.
  - Sampled `Module._cap_tic_count()` and a 64x40 canvas downsample about every 105 ms for 5 s.
  - Clicked the canvas, pressed Escape twice, then resized to 800x600.
- Run 2, Escape at steady state: reloaded, waited for tic > 260 (demo running), clicked, pressed Escape, took a screenshot, pressed Escape again.
- Afterwards I killed only PID 6648 and confirmed port 8000 was closed.

## Evidence (this directory)
- probe.json: statuses, the samples before the first frame and at the first frame, tic endpoints, geometry and input counters for both runs.
- server.log: fresh 200s for all 7 paths on each load.
  - The 22:42:50 `GET /` is my curl identity check.
  - The 22:43:08 load is a first probe attempt that threw a script error (`require` undefined) before it returned results. It is not counted.
- console.log (copy of artifacts/browser/console-2026-11-04T06-43-08-365Z.log):
  - The engine log runs Z_Init → W_Init `adding /doom1.wad` → I_InitGraphics (640x400, RGBA8888, red_off 16, scale 2).
  - 0 errors overall.
  - Run 1 had 33 logs and 0 warnings.
  - Run 2 had 2 warnings: "AudioContext was not allowed to start" (audio_web.js:27 and :53). This is the browser's autoplay policy and is expected before a user gesture.
- Before the first frame (17 ms): the canvas was 640x400 and fully transparent, there was no tic yet, and the title was "Doom (WASM)".
- First frame (122 ms): tic 2, 192 sampled colours, 0 transparent pixels, mean RGB (110,50,30), the red-dominant TITLEPIC. The title was "DOOM Shareware".
- Tic rate: tic 2→172 over 122→4977 ms is 35.02/s, inside the 31.5–38.5 band. Every 100 ms interval advanced 3–4 tics, with no stalls.
- startup.png (viewed): TITLEPIC with correct colours: red sky, blue and gold logo, green armour, yellow id logo. No channel swap.
- after-esc.png / after-esc2.png (viewed, run 1):
  - Both Escapes landed during the title→E1M1-demo melt wipe, so no menu is visible in either screenshot.
  - Input counters went 0→4 delivered, 0 dropped.
  - The engine's wipe loop (third_party/doomgeneric/d_main.c:313-328) draws the menu but does not process events, so both Escapes were buffered and handled together after the wipe. That is vanilla behaviour, not a port defect, and it is why I ran run 2.
- menu-open.png (viewed, run 2): the main menu (New Game … Quit Game, skull cursor) is drawn over the running demo. Delivered count 0→2.
- menu-closed.png (viewed, run 2): the menu is gone, the demo continues and the HUD colours are correct. Delivered 4, dropped 0.
- Geometry:
  - At 1280x720 the canvas is 1152x720 at x=64 (16:10, pillarboxed) with no scrollbars.
  - viewport-800x600.png: 800x500 at y=50, scroll size 800x600 (no scrollbars).

## Comparison with the prior reviewer_site run
- Same source and dist hashes, and the same results.
- First frame: 122 ms this run, 276 ms in the prior run. Both are well under 2 s. Sampling granularity is about ±100 ms.
- Tic rate: 35.02/s this run, 35.08/s before.

## Unresolved (owner)
1. Cosmetic, coder (carried over, not blocking): the static `<title>` in web/index.html is "Doom (WASM)" until the engine sets "DOOM Shareware".
2. UNVERIFIED, tester/human: a clean rebuild (I did not do one), Firefox, Safari, real HiDPI, non-localhost latency, a real hidden tab (H1) and audio by ear (A1).
3. No new loading or startup defect, and nothing to assign to coders.

## Assumptions
- The startup PASS criteria are agent-proposed, not student-approved. They are the same as in the prior run:
  - all assets return 200 on a cold load, with 0 page and console errors
  - a non-blank, correctly coloured frame appears within 2 s
  - the tic rate is 31.5–38.5/s
  - a key press works at startup
  - the canvas keeps its aspect ratio
- Autoplay-policy warnings do not count as failures.
- "Cold" means a CDP cache clear plus cache-disable in the MCP browser profile, not a fresh profile.
- Colours were judged by eye against known Doom art.
- Timings run from `goto` commit, not from navigation start.
- probe.json values were transcribed from the tool results, not written by the browser itself.
- Manual interventions: none. Token usage: not available.
- Writes: only this OUTPUT_DIR, plus the Playwright console capture in artifacts/browser/. I made no source, test, loop or config edits and did not create result.json.

## Next action
Nothing for coders. Tester: rerun `tests/verify.sh` after any source change. Human: cross-browser, HiDPI, H1 and A1.
