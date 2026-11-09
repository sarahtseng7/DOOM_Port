PASS

I loaded the current dist/ build cold at http://localhost:8000. All 7 assets returned HTTP 200. There were 0 failed requests, 0 page errors, 0 console errors and 0 console warnings. The first correctly coloured frame (TITLEPIC) drew at about 276 ms. The tic rate was 35.1/s from the first tic. Escape opened and closed the menu, and the canvas kept 16:10 at two viewports. This covers loading and startup only. Gameplay and audio depth belong to reviewer_gameplay.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD | shasum -a 256` = abd25326f8b63876..., the same as the prior reviewer_site report. The hash does not cover untracked files.
- dist/ sha256 prefixes: doom.wasm 7afb94fa1ec64b5c, doom.js 0090630eeaf16a87, doom.data 1d7d43be501e67d9, index.html 5905489e041214ce, audio_web.js 09969002dba66a00, input_audio.js cc5e94829d3893bf, render_timing.js e4114e9951ad4ed1. The tester's clean build at 20:59 rewrote dist/, but it is byte-identical to the build the prior review checked.
- web/{index.html, input_audio.js, audio_web.js, render_timing.js} are byte-identical (cmp) to dist/.
- emcc is 4.0.18, matching the pin. `make -n` reported "Nothing to be done for `all'", so I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, my role prompt and all six reports in artifacts/reports/. None of them reports an open loading or startup defect.
- Port 8000 had no listener (curl 000, lsof empty). I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (PID 94421, saved in server.pid). The served `/` hash matched dist/index.html (5905489e...). Afterwards I killed only that PID and confirmed the port was closed.
- Playwright MCP (Chromium): I cleared and disabled the cache through CDP and loaded `/?r=<ts>` at 1280x720. I sampled `Module._cap_tic_count()` and a 64x40 canvas downsample about every 105 ms for 5 s. Then I clicked the canvas and pressed Escape twice, and resized to 800x600.

## Evidence (in this directory)
- probe.json: statuses, first-frame data, tic endpoints, canvas geometry and the input sequence.
- network.log, server.log: fresh 200s for all 7 paths, served at 21:24:16. The two earlier `GET /` lines are my curl checks.
- console.log (a copy of artifacts/browser/console-2026-11-04T05-24-16-379Z.log) and console-warnings.log: 33 messages, 0 errors and 0 warnings. The engine log runs from Z_Init through I_InitGraphics (640x400 RGBA8888, red_off 16, scale 2), with `adding /doom1.wad`.
- Before the first frame (172 ms): tic 0, 1 colour, the canvas fully transparent, title "Doom (WASM)".
- First frame (276 ms): tic 3, 192 sampled colours, 0 transparent pixels, title "DOOM Shareware".
- Tic rate: tic 3 to 168 over 276 to 4979 ms is 35.08/s. Tic 3 to 18 over 276 to 701 ms is about 35/s. Both are inside the 31.5 to 38.5 band.
- startup.png (viewed): TITLEPIC with the red sky, blue and gold logo, green armour and yellow id logo. The melt wipe is just starting at the top edge. No channel swap.
- after-esc.png (viewed): the main menu over the E1M1 demo, with correct HUD and face colours. Escape registered.
- after-esc2.png (viewed): the menu is closed and the demo continues.
- viewport-800x600.png (viewed): the canvas is 800x500 at top 50, with no scrollbars (scroll size 800x600).

## Comparison with the prior run
- First frame took 276 ms this run, against 179 ms before. Both are well under the 2 s criterion. My sampling began after `goto` reached commit, so the timings carry about ±100 ms of sampling error.
- Console warnings dropped from 1 (AudioContext autoplay) to 0. That warning depends on the browser's autoplay policy, so it is not a defect either way.

## Unresolved (owner)
1. Cosmetic, coder: the static `<title>` in web/index.html is "Doom (WASM)", but the runtime title is "DOOM Shareware". This is carried over and not blocking.
2. UNVERIFIED, tester/human: a clean rebuild (the tester did one at 20:59, but I did not), Firefox and Safari, real HiDPI, non-localhost latency, a real hidden tab (H1) and audible audio (A1).
3. No blocking loading or startup defect, and nothing new to assign to coders.

## Assumptions
- Startup PASS criteria are agent-proposed, not student-approved, and the same as the prior run:
  - every asset returns 200 on a cold load, with 0 page and console errors
  - a non-blank, correctly coloured frame appears within 2 s
  - the tic rate is within 31.5 to 38.5/s
  - a key press works at startup
  - the canvas keeps its aspect ratio
- "Cold" means a CDP cache clear and disable in the MCP browser profile, not a fresh profile.
- Colours were judged by eye against known Doom art. The menu continuing over the demo matches vanilla behaviour (vanilla does not pause during demo playback).
- I transcribed the tic series endpoints into probe.json from the tool result rather than having the browser write them. The full series is in this run's transcript only.
- Manual interventions: none. Token usage: not available.
- Writes: only this OUTPUT_DIR, plus the Playwright console capture in artifacts/browser/. I made no source, test, loop or config edits and did not create result.json.

## Next action
Nothing for coders. Tester or human: rerun `tests/verify.sh` after any source change, then cross-browser, HiDPI, H1 and A1 checks.
