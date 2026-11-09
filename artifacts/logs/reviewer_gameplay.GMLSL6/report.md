FINDINGS

Movement, turning, momentum decay, focus loss, fire (ammo drop observed), menu freeze and audio activity worked in headless Chromium on the current build. FINDINGS, not PASS, because audio correctness by ear, a real hidden tab, other browsers, pickups, death and level exit remain unverified. WASD is not mapped (known).

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix 2c74d74fd2c699f9 and dist/doom.wasm prefix 7afb94fa1ec64b5c, both identical to the previous reviewer_gameplay, reviewer_site and tester runs. `make -n`: nothing to be done, so I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
README.md, platform/README.md, AGENTS.md, my role prompt, and all six files in artifacts/reports/. Open items I took on this run: menu freezing the player, the release-decay trace, ammo drop on fire.

## Work and evidence (this directory)
gp.mjs and fire.mjs are my own scripts, not protected checks. They drive headless Chromium via Playwright against a throwaway local server that exits with the script. Outputs: run.out (gp.mjs), fire-results.json, menu.png and fire.png (both viewed).
- **Level entry:** title, then 4x Enter reaches level 101 (E1M1), start (1056,-3616), health 100.
- **Movement:** holding ArrowUp moved the player 88 units per 300 ms.
- **Stopping after release (new):** per-100 ms displacement after release was 14, 8, 7, 4, 3, 2, 1, 1, then 0 drift after settling. This is the normal Doom momentum decay, not an instant stop and not a runaway.
- **Focus loss:** speed was 88 units/300 ms before a synthetic `blur`, then 0 movement over 0.8 s while 28 engine tics advanced. The event is synthetic, not a real focus change.
- **Turning:** ArrowLeft for 0.5 s turned about 51 degrees.
- **Fire (new):** with Ctrl held 150 ms, each shot raised sfxRequested/sfxPlayed by 1 (3, 4, 5), sfxBad 0. The HUD ammo went 50 to 48 after two shots (menu.png vs fire.png).
- **Menu freeze (new):** with the Esc menu open and ArrowUp held for 1.2 s, the player moved 0 units while 43 tics advanced. After Esc closed the menu, ArrowUp moved the player 95 units. menu.png shows the Doom menu over the level with the skull cursor and correct colours.
- **Audio (instrumented, not by ear):** AudioContext is suspended before any gesture and running after the first Enter. Music started 3/3, musicErrors 0, notesScheduled 70 -> 133 -> more by the end, SFX 7/7 played, sfxBad 0, analyser maxPeak 0.43. The analyser sits on the output bus, so this shows sound is generated, not that it sounds right.
- **Console:** 35 lines, none matching "error", no page errors.

## Findings
1. Observation, no owner: a key press with zero hold time (Playwright `keyboard.press('Control')`, down and up in the same tic) did not register as a shot (sfxRequested stayed 3). This matches vanilla Doom, where down and up in one tic cancel. A human tap lasts well over 28 ms, so I do not call it a defect.
2. WASD pressed for 600 ms moved the player 0 units. This is the known unmapped-keys limit, not a regression. Doom default keys (arrows) are the control requirement I assumed.

## Unresolved (owner)
1. UNVERIFIED, student/human: audio correctness by ear (SFX identity, recognisable music, balance).
2. UNVERIFIED, student/human: real hidden tab and real focus loss (H1 in tests/README.md).
3. UNVERIFIED, tester: pickups, death, level exit, door use (G3 still not in tests/verify.sh), Firefox, Safari. The tester should also add a menu-freezes-player check; I only observed it manually.
4. Known limits, unchanged: music is an oscillator synth, not GENMIDI/OPL (coder_input_audio, student decision); mouse not mapped; first SFX before a gesture is dropped (autoplay policy).
5. Timing/display: no fault seen; I did not measure frame timing (coder_render_timing owns it).

## Assumptions
- Doom default keys (arrows, Ctrl fire, Esc menu) are the control requirement.
- Engine-state exports (position, angle, health, tics) are trusted.
- Headless Chromium only. Manual interventions: none. Usage: not available.
- I wrote nothing outside this directory. The servers exited with their scripts, and I started no other processes.

## Next action
Human: listen to the audio and run H1. Tester: add G3 and a menu-freezes-player check.
