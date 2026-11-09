PASS

I loaded the current dist/ build cold at http://localhost:8000 in Playwright MCP Chromium and watched it start. All 7 assets returned HTTP 200, with 0 failed requests, 0 page errors and 0 console errors. The first correctly coloured frame (TITLEPIC) drew 266 ms after navigation commit. The tic rate was 34.89/s with no stalls. Escape opens and closes the main menu at steady state, and the canvas keeps 16:10 at 1280x720 and 800x600. This covers loading and startup only. Movement, combat and audio depth belong to reviewer_gameplay.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` prefix 320b73c4c8ae5476. Recent reports show the same value, and older ones show abd25326f8b63876.
- Per-path diff hashes: platform 1acdffa1e570967d, web 85ac276c9dfe4d6d, tests c0501e435fcc724a, loop 61ff85ca3ce21ac8. The Makefile is untracked, so it has no diff.
- Nothing in platform/, web/, Makefile or tests/ is newer than dist/doom.wasm (`find -newer` was empty). `make -n` printed "Nothing to be done for `all'", so I did not rebuild. emcc is 4.0.18.
- dist/ sha256 prefixes are unchanged from the prior reviewer_site report:
  - doom.wasm 7afb94fa1ec64b5c
  - doom.js 0090630eeaf16a87
  - doom.data 1d7d43be501e67d9
  - index.html 5905489e041214ce
  - audio_web.js 09969002dba66a00
  - input_audio.js cc5e94829d3893bf
  - render_timing.js e4114e9951ad4ed1
- The four web/ files are byte-identical (cmp) to their dist/ copies.
- Untracked platform/web/Makefile concatenated hash: 66fbca997bd4253d. This is not comparable with the prior 5f7d9f… because I don't know the prior run's method.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Server
- Port 8000 already had a listener: PID 13430, started 23:25:53, running `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` with cwd at this repository. I did not start it, so I left it running.
- All 7 files fetched from it hash-match dist/ (served-hashes.txt). It is serving this project's current build.

## Work and evidence (this directory)
- **Run 1, cold load** at 1280x720. I used a CDP cache clear plus cache-disable, then sampled `Module._cap_tic_count()` and a 64x40 canvas downsample about every 100 ms for 5 s (probe.json `run1_cold`).
  - At 33 ms the canvas was 640x400 and fully transparent, there was no tic yet, and the title was "Doom (WASM)".
  - At 266 ms: tic 3, 150 colour buckets, 0 transparent pixels, mean RGB (110,50,30), and the title was "DOOM Shareware".
  - Tic 3→165 over 266→4909 ms is 34.89/s, inside the 31.5–38.5 band, with 0 ms of tic stall.
  - startup.png (viewed): TITLEPIC with correct colours (red sky, blue and gold logo, green armour, yellow/blue id logo). No channel swap.
  - Geometry: the canvas is 1152x720 at x=64 (pillarboxed), with no scrollbars.
- **Engine log** (console.log): W_Init `adding /doom1.wad`, then I_InitGraphics 640x400 RGBA8888 red_off 16. Overall there were 0 errors and 6 warnings. All 6 warnings are "AudioContext was not allowed to start" (audio_web.js:27 and :53), which is the autoplay policy before a user gesture.
- **network.txt:** 35 requests over 5 loads, all 200.
- **Run 2, Escape at steady state.** I waited for tic > 260 (E1M1 demo), clicked the canvas, pressed Escape, then pressed Escape again.
  - menu-open.png (viewed): the main menu with the skull cursor is drawn over the demo.
  - menu-closed.png (viewed): the menu is gone, the demo continues and the HUD colours are correct.
  - viewport-800x600.png (viewed): the canvas is 800x500 at y=50, with no scrollbars.
  - The input counters showed dropped = 1, 2, 3. My probe caused this, as explained in the next item.
- **Dropped-count check (runs 3–5).**
  - The run 2 probe called every zero-argument `_cap_*` export, which included `_cap_input_reset`.
  - Run 3: 12 s idle, no input calls, dropped 0.
  - Run 4: run 2 repeated without that probe. Delivered 0→2→4 and dropped stayed 0. Each Escape down/up mapped to `_cap_input_event(1,27)` then `(0,27)`.
  - Run 5: calling the C reset directly while Escape is held, then releasing the key, adds dropped +1. The direct call bypasses JS `releaseAll()`, which also clears `held`, so the later keyup is a stray release in C. The page's own handlers never call it that way.
  - Not a port defect. The dropped=1 at run 2's s0, before any key, is not fully explained, and the clean run 4 did not reproduce it.

## Unresolved (owner)
1. Cosmetic, coder (carried over, not blocking): the static `<title>` in web/index.html is "Doom (WASM)" until the engine sets "DOOM Shareware".
2. Minor, not reproduced: one dropped input event with no key pressed in contaminated run 2. If the tester's input checks ever show unexplained drops, coder_input_audio should look into it. For now, no action.
3. UNVERIFIED, tester/human: a clean rebuild, Firefox and Safari, real HiDPI, non-localhost latency, a real hidden tab, and audio by ear.
4. No new loading or startup defect, and nothing to assign to coders.

## Comparison with the prior reviewer_site report
- Same dist hashes and the same results.
- First frame: 266 ms now, 122 ms before. The sampling granularity is about 100 ms, and both are under 2 s.
- Tic rate: 34.89/s now, 35.02/s before.

## Assumptions
- The startup PASS criteria are agent-proposed, not student-approved, and unchanged from prior runs:
  - all assets return 200 on a cold load, with 0 page and console errors
  - a non-blank, correctly coloured frame appears within 2 s
  - the tic rate is 31.5–38.5/s
  - Escape opens and closes the menu
  - the canvas keeps its aspect ratio
- Autoplay warnings do not count as failures.
- "Cold" means a CDP cache clear plus disable in the MCP browser profile, not a fresh profile.
- Colours were judged by eye.
- probe.json was transcribed from tool results.
- Manual interventions: none. Token usage: not available.
- Writes: only this OUTPUT_DIR, plus the Playwright console capture under artifacts/browser/. I made no source, test, loop or config edits, did not create result.json, and did not stop the existing server.

## Next action
Nothing for coders. Tester: rerun `tests/verify.sh` after any source change. Human: cross-browser, HiDPI, hidden-tab and audio-by-ear checks.
