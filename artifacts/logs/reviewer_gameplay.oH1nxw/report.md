FINDINGS

I found no movement, playability or audio-pipeline defect on the current build. All state-based probes passed in headless Chromium: 32 in review_state, 6 in pause_check, the per-tic coast check, and a new visibilitychange-release check. There were 0 page errors. It is still FINDINGS, not PASS:
- Nobody has listened to the audio (A1).
- Real hidden-tab behaviour (H1) is still unverified. This run tried three automated ways to hide the tab, and none worked: Playwright kept `document.visibilityState` at "visible" in every attempt.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD | shasum -a 256` prefix abd25326f8b63876. This matches the previous reviewer_gameplay run (HCHqDZ) and every report in artifacts/reports/, so the source did not change since the last review.
- dist/ hashes are unchanged: doom.wasm 7afb94fa1ec64b5c, doom.js 0090630eeaf16a87, index.html 5905489e041214ce. I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md do not exist.

## Work
- Read AGENTS.md, the README files, my role prompt, and all reports in artifacts/reports/. The coder, coder_input_audio and coder_render_timing reports record no source edits. reviewer_site reports PASS for startup.
- Copied review_state.mjs, pause_check.mjs and coast_pertic.mjs from reviewer_gameplay.HCHqDZ unchanged, apart from a header comment. Reran them against a fresh server I started: `python3 -m http.server 8193 --bind 127.0.0.1 --directory dist`, PID 94799. I stopped only that PID and confirmed port 8193 closed.
- New hidden_tab.mjs (H1 attempt) tried three ways to hide the page:
  - headless, with a second tab brought to the front
  - headed, with a second tab brought to the front
  - headed, with the window minimized via CDP `Browser.setWindowBounds`
- New visibility_release.mjs isolates the `visibilitychange` release path in web/input_audio.js:93. Previous reviews only exercised `blur`.
- I edited no source, test, build or loop files.

## Results
**review_state.mjs** (review.log, review-results.json): 32 pass, 0 fail, 2 notes, rc=0.
- **Audio:**
  - The AudioContext was suspended before the gesture and running after it.
  - Title music was non-silent (peak 0.22), and the level music switched on entry.
  - Menu cursor moves played SFX on the title menu (0->2) and in the in-game menu (18->19).
- **Level entry:** E1M1 (lvl 101), HP 100, spawn (1056,-3616). Tic rate 35.0/s. No idle drift.
- **Forward:** 76 units in 18 tics along the facing direction (cos 1.000).
  - After release the player coasted 65 units and stopped 47 tics later (limit ≤55).
  - The steps decayed monotonically: 6 5 5 5 4 4 3 3 3 3 2 2 2.
- **Backward:** opposite the facing direction (cos -1.000).
- **Turning:** Right -40.43° and Left +40.43°, with no translation. The angle changed 0 tics after release.
- **Strafe and run:**
  - "." moved 120 units, "," moved 112 and Alt+Right moved 112. All were perpendicular to facing (|cosR| = 1), with dAng 0.
  - Shift run was 7.0 u/tic against 1.91 walking.
- **Fire:** ammo 50->49. I checked screens/03-fire-post.png: the HUD shows 49 and BULL 49/200. Fire SFX 11->12. Held fire repeated 4 times, then stopped with 0 more after release.
- **Use** at a wall played 1 SFX (note). The lump was not identified.
- **Menu, pause and automap:**
  - The menu froze the world (dPos 0).
  - The Pause key froze the game. Unpaused, the tic rate was 35/s; while paused, ticsPaused1s was 39 because gametic keeps advancing by engine design.
  - The automap toggle caused no movement.
- **Focus loss (synthetic `blur`):**
  - A held turn stopped immediately.
  - A held forward coasted 53 units, then stopped completely.
  - Input worked again after the blur.
- **Audio counters:** the audio clock advanced 2.005 s per 2.003 s of wall time. sfxRequested 21 = sfxPlayed 21, sfxBad 0, musicErrors 0, maxPeak 0.47.

**pause_check.mjs** (pause.log, pause-results.json): 6/6 pass, rc=0.
- Pause with keys held: dPos 0, dAng 0, with gametic +46. Unpause resumed movement (94 units).
- The menu froze the world while a key was held (dPos 0).
- After the menu closed the player coasted 8 units, then stopped (dPos 0).

**coast_pertic.mjs** (coast-pertic.log/json): 109 consecutive gametics, 0 gaps.
- Peak speed 7 u/tic. The last movement was 45 tics after release, the same as the previous run.
- This is consistent with vanilla FRICTION and STOPSPEED: the model predicts about 49, and positions are reported in integer units.

**visibility_release.mjs** (visibility-release.log/json): pass.
- ArrowLeft was held and turning. I then forced `document.hidden=true` and dispatched `visibilitychange` alone, with no blur and no keyup.
- Over the next 35 tics the angle did not change. Input worked normally after visibility was restored.
- This exercises the port's handler. It does not show what a real browser does when the tab is actually hidden.

**hidden_tab.mjs** (hidden-tab-{headless,headed,minimize}.{log,json}): **inconclusive.**
- In all three modes `becameHidden` was false: the page stayed "visible" and kept 35 tics/s while "hidden".
- Movement during that window came from the deliberately held key on a page that was still visible. It is not a defect.
- Playwright's Chromium does not hide pages in these setups, so this harness cannot establish H1.

## Unresolved (owner)
1. UNVERIFIED, human: SFX and music correctness by ear (A1). The counters and peaks show only that audio plays without errors and is not silent.
2. UNVERIFIED, human: real hidden-tab or minimized timing and audio (H1). Automated hiding failed; see hidden_tab.mjs. Use the protocol in tests/README.md with a normal browser.
3. Student decision (coder_input_audio if required): the music is an oscillator synth, not GENMIDI/OPL-faithful.
4. UNVERIFIED, tester: level exit (G3c), pickups, damage and death, Firefox, Safari, HiDPI.
5. Observation, not judged a defect: music continues in the menu and while paused (13 voices, lastPeak 0.014).
6. Carried over, student decision: WASD and mouse are not mapped, and volume is not persisted (P1).
7. Suggestion for the tester (not a defect): visibility_release.mjs could become a protected check for the `visibilitychange` path. Today only `blur` is fault-injected (drop-blur).
8. No new defects for coder_input_audio, coder_render_timing or coder.

## Assumptions
- The required controls are Doom's default keys. "Correct momentum" means it matches vanilla thrust and friction within integer-unit rounding. "Turn stops" means the angle changes no more than 3 tics after release.
- Criteria are agent-proposed, not student-approved. Headless peaks count only as evidence of non-silence.
- The headed runs opened a Chromium window on this Mac briefly. No other processes were touched.
- Manual interventions: none. Token usage: not available.
- I wrote only in this OUTPUT_DIR: scripts, logs, JSON, screens/, server.log, server.pid and report.md.

## Next action
- **Human:** run the A1 listening test and the H1 protocol with a real tab switch or minimize.
- **Tester:** optionally adopt visibility_release.mjs and the per-tic coast check.
- **If the source changes:** rerun this review.
