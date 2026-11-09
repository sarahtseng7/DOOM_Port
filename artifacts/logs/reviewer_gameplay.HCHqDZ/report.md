FINDINGS

No gameplay, movement or audio-pipeline defect found on the current build. All 39 state-based checks passed in headless Chromium, with 0 page errors. A new per-tic coast probe matches vanilla Doom thrust and friction. Two gaps remain, so this is FINDINGS, not PASS: nobody has listened to the audio (A1), and real hidden-tab behaviour (H1) has not been checked.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD | shasum -a 256` prefix abd25326f8b63876 (tracked files only), the same as every report in artifacts/reports/.
- dist/ hashes: doom.wasm 7afb94fa1ec64b5c, doom.js 0090630eeaf16a87, index.html 5905489e041214ce. `make -n`: "Nothing to be done", so I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md do not exist.

## Work
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, my role prompt and all six reports in artifacts/reports/.
- Copied review_state.mjs and pause_check.mjs from reviewer_gameplay.F2duYo into this directory. I corrected the two script errors that the prior report had already identified:
  - The coast stop limit is now ≤55 tics instead of ≤40. Vanilla Doom predicts about 49.
  - P.menu-pauses-world and P.pause-key-toggles now judge a freeze by player position and angle, not gametic. gametic keeps advancing while paused by engine design.
- New script coast_pertic.mjs logs player x/y on every gametic during a 600 ms forward hold and the coast after release.
- Served dist/ myself: `python3 -m http.server 8192 --bind 127.0.0.1 --directory dist` (PID 86809). I stopped only that PID and confirmed port 8192 closed.
- I edited no source, test, build or loop files.

## Results (review.log, review-results.json, pause.log, pause-results.json, coast-pertic.{log,json}, screens/)
- **review_state.mjs: 32 pass, 0 fail, 2 notes, rc=0.**
  - **Audio:** the AudioContext was suspended before the gesture and running after Enter. Title music was non-silent (peak 0.23), and level music switched on entry. Menu cursor moves played SFX, both on the title menu (0->2) and in the in-game menu (19->20).
  - **Level entry:** E1M1 (level 101), HP 100, spawn (1056,-3616). Tic rate 35.0/s. No idle drift.
  - **Forward:** 76 units in 17 tics along the facing direction (cos 1.000). Coast after release was 73 units, and the player stopped 44 tics after release.
  - **Backward:** opposite the facing direction (cos -1.000).
  - **Turning:** Right -40.4° and Left +40.4°, with no translation. The angle changed 0 tics after release.
  - **Strafe and run:** ".", "," and Alt+Right each moved 112 units perpendicular to facing, with no turn. Shift run was 6.6 u/tic against 2.46 walking.
  - **Fire:** ammo 50->49 on the HUD (screens/03-fire-post.png viewed), SFX 11->12. Held fire played 5 SFX in 1.5 s, and 0 more after release.
  - **Use** at a wall played 1 SFX (note). It is consistent with sfx_noway, but the lump was not identified.
  - **Menu:** freezes the world (dPos 0, dAng 0). No stuck key after the menu closed.
  - **Focus loss:** a blur while holding a turn froze the angle immediately. A blur while holding forward allowed a 43-unit coast, then stopped. Input worked again after the blur.
  - **Pause key and automap:** Pause freezes position and angle and resumes at 35 tics/s. Automap toggle: no movement.
  - **Audio clock and counters:** the audio clock advanced 2.005 s per 2.004 s of wall time. Final counters: sfxRequested 22, sfxPlayed 22, sfxBad 0, musicErrors 0, 1192 notes, maxPeak 0.50.
- **pause_check.mjs: 6/6 pass, rc=0.**
  - Pause with forward and turn held: dPos 0, dAng 0, with gametic advancing by 45. The Pause graphic shows (screens/pause.png viewed).
  - Unpause resumes movement (96 units).
  - The menu freezes the world while forward is held.
  - After the menu closed, the player coasted 8 units, then stopped.
- **coast_pertic.mjs** (new, 109 consecutive gametics, 0 gaps): this profile matches vanilla Doom.
  - **Speed while held, u/tic:** 0 1 2 2 3 3 4 4 4 5 5 6 6 6 6 6 7 7 7 7 7.
  - **Model:** forwardmove 0x19 (g_game.c:156) with FRICTION 0xe800 (p_mobj.c:106) gives 0.78, 3.24, 4.90, 6.02, 6.77, 7.28 at every 4th tic. Observed matches within integer rounding.
  - **After release:** speed decays monotonically (7 7 6 5 5 4 ... 1 0). The last movement was 45 tics after release. The model, with STOPSPEED 0x1000 (p_mobj.c:105), predicts 49. The bridge reports positions in whole map units, so sub-unit motion at the end is invisible and the stop reads early.
  - This explains the irregular steps in review.log ("7 6 11 4 5 0 3"). They come from wall-clock sampling across uneven tic counts, not from uneven momentum.
- screens/04-menu.png (viewed): the in-game main menu is drawn over the level, with correct colours.

## Unresolved (owner)
1. UNVERIFIED, human: SFX and music correctness by ear on real audio output (A1). The counters and peaks above show only that audio plays without errors and is not silent.
2. Student decision (coder_input_audio if required): music is an oscillator synth, not GENMIDI/OPL-faithful.
3. UNVERIFIED, human: real hidden-tab timing and audio (H1). I used synthetic `blur` events as a stand-in for focus loss.
4. UNVERIFIED, tester: level exit (G3c), pickups, damage and death, Firefox, Safari, HiDPI. Doors are covered by the tester's G3a/G3b checks, which I did not rerun.
5. Observation, not judged a defect: music keeps playing in the menu and while paused (13 voices, lastPeak 0.013). I have not compared this against original Doom.
6. Carried over, student decision: WASD and mouse are not mapped, and volume is not persisted (P1).
7. Suggestion for the tester (not a defect): adopt the position/angle freeze criteria and the ≤55-tic coast limit. coast_pertic.mjs is available here if a per-tic momentum check is wanted.
8. No new defects for coder_input_audio, coder_render_timing or coder.

## Assumptions
- The control requirement is Doom's default keys: arrows, Ctrl fire, Space use, Esc menu, Shift run, "," and "." strafe, Alt strafe, Pause, and Tab.
- "Correct momentum" means it matches vanilla thrust, FRICTION and STOPSPEED within integer-unit rounding. "Turn stops" means no angle change more than 3 tics after release.
- Headless Chromium peaks count only as evidence of non-silence. Criteria are agent-proposed, not student-approved.
- Manual interventions: none. Token usage: not available.
- I wrote only in this OUTPUT_DIR: scripts, logs, JSON, screens/, server.log, server.pid and report.md.

## Next action
Human: run the headed listening test (A1) and the H1 protocol in tests/README.md. Tester: optionally adopt the state-based freeze checks and the per-tic coast check. If the student adds WASD, mouse, OPL music or persistence as requirements, coder_input_audio implements them, the coder rebuilds, and this review reruns.
