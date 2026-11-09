FINDINGS

Movement, turning, stopping, focus loss, fire, menu and audio activity were observed working in headless Chromium on the current build. FINDINGS, not PASS, because audio correctness (by ear), a real hidden tab, other browsers, pickups and level exit remain unverified.

## Source identity
HEAD e500c44 plus uncommitted changes; `git diff HEAD` sha256 prefix 2c74d74fd2c699f9; dist/doom.wasm prefix 7afb94fa1ec64b5c (both identical to the prior reviewer_gameplay and tester runs). `make -n`: nothing to do, so I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
All files in artifacts/reports/. Prior open items for this role: audio correctness, weak blur check (no speed measured before blur), unverified pickups/exit/hidden tab/other browsers.

## Work and evidence (this directory)
gp.mjs is my own script (not a protected check); headless Chromium via Playwright against a throwaway local server that exits with the script. Results: gp-results.json; screenshots menu.png (viewed), final.png (not viewed).
- **Level entry:** title -> 4x Enter -> level 101 (E1M1), start (1056,-3616), health 100.
- **Movement:** holding ArrowUp moved the player 98 units in 300 ms.
- **Focus loss (closes prior weak-check item 2):** speed was 98 units/300 ms immediately before a synthetic `blur`; after the blur, movement over 0.8 s was 0 while engine tics kept advancing (28 tics). So blur stopped a player that was actually moving. Still a synthetic event, not a real focus change.
- **Turning:** ArrowLeft for 0.5 s turned about 54.5 degrees.
- **Stopping after release:** prior run's trace (thru-results.json, reviewer_gameplay.LPg0t8) showed the momentum decay to rest; I did not repeat it.
- **Fire:** Ctrl presses raised sfxRequested/sfxPlayed 3 -> 5 with sfxBad 0; the HUD ammo reads 50 (screenshot) so I did not measure the ammo drop.
- **Menu:** Esc draws the Doom menu over the level (menu.png, correct colours, skull cursor). Esc again closed it. Engine tics advance at 35/s with the menu open, which is normal Doom (gametic runs; the game logic is paused). I did not verify that the player is frozen while the menu is open.
- **Audio (instrumented, not by ear):** AudioContext is suspended before any gesture and running after the first Enter. In level: music started 3/3, musicErrors 0, notesScheduled grew 70 -> 195, sfx 5/5 played, sfxBad 0, analyser maxPeak 0.41 (non-silent, not clipping). The analyser is on the output bus, so it shows sound is generated, not that it sounds right.
- **Console:** 35 lines, none matching "error", no page errors.

## Unresolved (owner)
1. UNVERIFIED, student/human: audio correctness by ear (SFX identity, music recognisable, volume balance).
2. UNVERIFIED, student/human: real hidden tab / real focus loss (headless cannot do it; H1 protocol in tests/README.md).
3. UNVERIFIED, tester: pickups, death, level exit, Firefox, Safari; also G3 door check still not in tests/verify.sh (see prior report next action).
4. Known limits, unchanged: music is an oscillator synth, not GENMIDI/OPL (coder_input_audio, student decision); WASD and mouse not mapped; first SFX before a gesture is dropped (expected under autoplay policy).
5. Timing/display: no fault seen; frame timing not re-measured (coder_render_timing owns it).

## Assumptions
- Doom default keys (arrows, Ctrl fire, Esc menu) are the control requirement.
- Engine-state exports (position, angle, health, tics) are trusted.
- Headless Chromium only. Manual interventions: none. Usage: not available.
- I wrote nothing outside this directory and stopped the server with the script.

## Next action
Human: listen to audio and run H1. Tester: add G3 door-use check and a menu-freezes-player check.
