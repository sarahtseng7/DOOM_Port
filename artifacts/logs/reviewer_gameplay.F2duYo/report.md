FINDINGS

No gameplay, movement or audio-pipeline defect found. This run measured movement from the bridge v5 engine-state hooks (player x/y/angle/level), not from pixel diffs. Movement, momentum, turning, stopping, strafe, run, fire, use, menu and Pause freeze, focus loss and tic rate all behaved like vanilla Doom in headless Chromium. Audio played and was non-silent, but nobody listened to it, so audio correctness remains UNVERIFIED. Real hidden-tab behaviour is also UNVERIFIED. Those two gaps make this FINDINGS, not PASS.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD | shasum -a 256` prefix abd25326f8b63876 (tracked files only). It matches the tester.I2eTl9, coder and reviewer_site reports. The c9b3c829... value in the previous reviewer_gameplay report used a different method, so the two are not comparable.
- dist/doom.wasm prefix 7afb94fa1ec64b5c, unchanged. `make -n`: "Nothing to be done", so I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md do not exist.

## Work
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, my role prompt, all six reports in artifacts/reports/, tests/README.md, platform/capstone_bridge.h and web/input_audio.js.
- Wrote two new scripts in this directory: review_state.mjs (32 checks plus 2 notes) and pause_check.mjs (6 checks). They read Module._cap_player_*, _cap_level_id and _cap_tic_count, and CapAudio.stats(), all read-only.
- Served dist/ myself: `python3 -m http.server 8191 --bind 127.0.0.1` (PID 76544). I stopped only that PID and confirmed port 8191 closed.
- Headless Chromium came from tests/node_modules, with no autoplay-policy flag. I edited no source, test, build or loop files.

## Results (evidence: review.log, review-results.json, pause.log, pause-results.json, screens/)
Startup and level
- AudioContext was suspended before the gesture and running after Enter.
- Title music non-silent (peak 0.22).
- Menu cursor moves play SFX (0->2).
- New Game enters E1M1: level 101, player valid, HP 100, spawn (1056,-3616) facing 90°.
- Level music switched (3 starts, playing).
- 35.0 tics/s.
- No drift while idle.

Movement
- Forward: 76 units in 18 tics, exactly along the facing direction (cos 1.000).
- Coast after release: 65 units, with per-sample steps decaying geometrically (6 5 5 5 4 4 3 3 3 3 2 2 0). The player stopped completely 47 tics after release. This matches FRICTION 0xe800 (0.90625/tic) and STOPSPEED 0x1000 in third_party p_mobj.c:105-106. In theory a player near full walking speed stops after about 50 tics, coasting about 66 units.
- Backward: moves opposite the facing direction (cos -1.000).
- Turning: Right turned -40.4° and Left +36.9° in 14 tics, without moving the player. The angle stops changing within 1 tic of release (+/-3.5°, one tic of turn), so there is no stuck turn.
- Strafing: "." strafes right, "," strafes left and Alt+Right strafes right, each 112 units and perpendicular to facing (|cos to facing| < 0.01), with no turn.
- Shift run: 6.92 units/tic against 2.2 walking.

Combat and use
- Fire (Ctrl): ammo 50->49 on the HUD (screens/03-fire-post.png), SFX 11->12.
- Held fire: 4 SFX in 1.5 s, and 0 more after release.
- Use (Space) against a plain wall after walking into it: 1 SFX. This is consistent with Doom's "oof" (sfx_noway), but the lump played was not identified.

Menu, Pause and focus
- The Esc menu freezes the world (dPos 0 over 1.5 s, even with ArrowUp held while it opened).
- Menu navigation inside the game plays SFX.
- No stuck key after closing the menu. Any pre-menu coast is at most 8 units, then the player is stopped.
- The Pause key freezes position and angle while forward and turn are held, shows the "Pause" graphic (screens/pause.png), and resumes movement when pressed again.
- Window blur while holding turn: angle frozen afterwards. Blur while holding forward: no movement.
- Input works again after the blur.
- Automap toggle does not move the player.

Audio and errors
- The audio clock advanced 2.000 s per 2.003 s of wall time.
- Final counters: sfxRequested 21, sfxPlayed 21, sfxBad 0, musicErrors 0, 1184 notes scheduled, maxPeak 0.47.
- 0 page or console errors in both scripts.

## FAILs in review.log and why they are script errors, not product faults
1. M.forward-coasts-then-stops: my ≤40-tic stop limit was a guess made before I checked the source. Vanilla friction predicts about 50 tics, and 47 was observed. Read with the corrected limit (≤55 tics), this PASSES. I did not rerun it.
2. P.menu-pauses-world and P.pause-key-toggles: these used gametic as the measure. In the engine, P_Ticker returns early when paused or when the menu is active (p_tick.c:128-137), but d_loop.c:812 still runs gametic++. So gametic advancing is correct vanilla behaviour. pause_check.mjs repeated both checks using player position and angle, and all of them PASS.
I am leaving the FAIL lines in review.log as raw evidence and have not edited them.

## Unresolved (owner)
1. UNVERIFIED, human: SFX and music by ear on a real audio output (A1). Peak and counter values show only that audio plays without errors. Music is an oscillator synth, not GENMIDI/OPL-faithful. Whether that is acceptable is a student decision; the owner is coder_input_audio if it becomes a requirement.
2. UNVERIFIED, human: a real hidden tab (H1). Headless Chromium does not hide a page, so I did not retest it.
3. UNVERIFIED, tester: door opening via Use (covered by tester G3a/G3b), level exit G3c, pickups, damage and death, Firefox, Safari, HiDPI.
4. Observation: music keeps playing while the menu or Pause is open (13 voices, lastPeak 0.02 in the menu). As far as I know, vanilla Doom also keeps music playing in the menu; I did not compare it against the original.
5. Carried over, student decision: WASD and mouse are not mapped, and volume is not persisted (P1).
6. Suggestion for the tester (no defect): T/P checks should judge freezes by position or angle, not gametic, and coast limits should allow about 50 tics. Copy review_state.mjs and pause_check.mjs from here if useful.
7. No new defects to assign to coder_input_audio, coder_render_timing or coder.

## Assumptions
- Doom default keys (arrows, Ctrl fire, Space use, Esc menu, Shift run, "," and "." strafe, Alt strafe, Pause, Tab) are the control requirement.
- "Correct momentum" means matching vanilla FRICTION/STOPSPEED decay. "Turn stops" means no angle change more than 3 tics after release.
- Synthetic `blur` events stand in for real focus loss. Headless audio peaks stand in for non-silence only.
- Criteria are agent-proposed, not student-approved. Manual interventions: none. Token usage: not available.
- I wrote only in this OUTPUT_DIR: review_state.mjs, pause_check.mjs, review.log, review-results.json, pause.log, pause-results.json, screens/, server.log, server.pid, report.md.

## Next action
Human: a headed listening test (A1) and the H1 hidden-tab protocol in tests/README.md. Tester: optionally adopt the state-based movement and pause checks. If the student adds WASD, mouse, OPL music or persistence as requirements, coder_input_audio implements them, the coder rebuilds, and this review reruns.
