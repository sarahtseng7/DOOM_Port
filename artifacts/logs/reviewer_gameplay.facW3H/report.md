FINDINGS

This run was an incremental review. I re-observed Doom's Pause key in the real build, which closes one gap in the earlier reviewer_gameplay report. Other prior observations were not repeated here. FINDINGS (not PASS) because audibility, a real hidden tab, door use, level exit and OPL music fidelity are still unverified.

## Source identity
HEAD e500c44 + uncommitted changes. I did not rebuild. dist/doom.wasm sha256 prefix a4c6846627bdcb21, the same as the prior reviewer_gameplay, reviewer_site and tester runs. Server: `python3 -m http.server 8123 --bind 127.0.0.1 --directory dist`, started and stopped by me (port confirmed free afterwards).

## Prior findings read
artifacts/reports/: reviewer_gameplay, reviewer_site, coder, coder_input_audio, coder_render_timing, tester. I did not re-run their controls, audio, volume or momentum checks. Those results stand from the previous run, which used the same wasm hash.

## Work and evidence (this dir)
pause.mjs -> pause.log, screens/. Ad-hoc Playwright, headless Chromium, 800x600, no autoplay flag. It is not a protected check.
- Enter x4 reaches E1M1.
- Pause key: screens/02-paused.png shows the "PAUSE" patch on a correct E1M1 frame. The frame differs from the unpaused base by 0.015 in the view region.
- While paused, ArrowUp held for 1.5 s changed the view by 0.0000, so the world is frozen.
- After the second Pause press, ArrowUp for 1.2 s moved the view by 0.663 against the base, so play resumes.
- Audio while paused: lastPeak 0 and 0 music voices. The music is silent during pause, as in Doom.
- Console and page errors: none.
- Use (Space) at the spawn point produced no SFX (delta 0). There is no door in front of the player there, so this is not evidence either way.

## Resolves a prior item
The earlier "menu pauses game" item was UNVERIFIED because `_cap_tic_count` is the gametic and cannot show pause. The Pause key is now verified by pixels. I did not verify pause via the Esc menu. I only screenshotted the menu and did not check movement behind it.

## Unresolved (owner)
1. UNVERIFIED, tester/student: no human has heard the audio. The only evidence is the analyser peak. Music is a GM-family oscillator approximation, not OPL (coder_input_audio/student).
2. UNVERIFIED, tester: a real hidden or background tab. Headless Playwright reports `document.hidden=false`, so I did not exercise throttling, audio in the background, or key release on a real hide (H1; coder_render_timing).
3. UNVERIFIED, tester: door use, pick-ups, damage/death and level exit. I made no deterministic route to a door. The tester should add a scripted route or a position export.
4. UNVERIFIED: Esc-menu pause, other E1 songs, music/SFX balance, Safari/Firefox, headed browser, HiDPI.
5. Scope (student): WASD and mouse are not mapped, only Doom defaults. Criteria are still agent-proposed.

## Assumptions
- No specification.md or acceptance-criteria.md was supplied, so the Doom default key bindings are the requirement.
- Screenshot diffs of the view region stand in for player motion and pause state. The "PAUSE" patch in the screenshot is the primary pause evidence.
- Because dist/ is unchanged since the prior review (same wasm hash), I judged repeating the prior checks to be low value.
- No source, test or loop files were edited. Manual interventions: none.
