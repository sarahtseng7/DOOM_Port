FINDINGS

I found no movement, playability or audio-pipeline defect on the current build, and none to assign to a coder. All probes passed again in headless Chromium:
- review_state: 32 pass, 0 fail, 2 notes
- pause_check: 6/6
- per-tic coast: 109 tics, 0 gaps
- visibilitychange release: pass

A new Playwright MCP check in open space confirmed the `blur` release path. It is still FINDINGS, not PASS, for the same reasons as before:
- Nobody has listened to the audio (A1).
- Real hidden-tab behaviour (H1) is still unverified.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` prefix abd25326f8b63876, the same as the prior run (oH1nxw) and every report in artifacts/reports/. Untracked platform/, web/ and Makefile files concatenated hash to dfe94e12321be043. This is a different hashing method from reviewer_site's 5f7d9f…, so the two values are not comparable.
- dist/ sha256 prefixes, all unchanged:
  - doom.wasm 7afb94fa1ec64b5c
  - doom.js 0090630eeaf16a87
  - doom.data 1d7d43be501e67d9
  - index.html 5905489e041214ce
  - input_audio.js cc5e94829d3893bf
  - audio_web.js 09969002dba66a00
  - render_timing.js e4114e9951ad4ed1
- `make -n`: "Nothing to be done", so I did not rebuild.
- artifacts/specification.md and acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, the README files, loop/prompts/REVIEWER_GAMEPLAY.md and the reports in artifacts/reports/: reviewer_gameplay, reviewer_site (PASS for startup), tester (verify.sh rc=0, 6/6 faults caught) and coder_input_audio (no edits).
- Copied review_state.mjs, pause_check.mjs, coast_pertic.mjs and visibility_release.mjs from reviewer_gameplay.oH1nxw. The only change is a header comment.
- Started `python3 -m http.server 8194 --bind 127.0.0.1 --directory dist` (PID 7034). Ran all four scripts against it.
- Played the game through Playwright MCP on the same server. This was an independent recheck of `blur`, prompted by one result that differed from the last run (see below).
- Killed only PID 7034 and confirmed port 8194 closed (curl 000).
- I edited no source, test, build or loop files.

## Results (evidence in this directory)
**review_state** (review.log, review-results.json), rc=0:
- **Audio:**
  - The AudioContext was suspended before the gesture and running after it.
  - Title music peaked at 0.226, and the level music switched on entry.
  - Menu cursor moves played SFX on the title menu (0->2) and in the in-game menu (18->19).
- **Level entry:** E1M1 (lvl 101), HP 100, spawn (1056,-3616). Tic rate 35.0/s. No idle drift.
- **Forward and coast:** forward moved 76 units in 17 tics along the facing direction (cos 1). After release the player coasted 65 units and stopped 47 tics later, with steps decaying 6 5 5 5 4 4 3 3 3 3 2 2 2. That is normal Doom momentum.
- **Backward:** opposite the facing direction (cos -1).
- **Turning:**
  - Right turned -40.43°; it stopped turning 1 tic after release, adding -3.52° in that tic.
  - Left turned +40.43° and stopped turning 0 tics after release.
  - Neither turn caused any translation.
- **Strafe:** ",", "." and Alt+Arrow each moved 112.2 units perpendicular to facing (|cosR| = 1), with dAng 0.
- **Run:** Shift ran at 5.92 u/tic against 2 walking. The last run measured 7.0 u/tic; the difference comes from sampling, and the per-tic peak of 7 is confirmed below.
- **Fire:** frame diff in the ammo digits and SFX 11->12. Held fire repeated 4 times and stopped after release.
- **Use:** pressing Use at a wall played 1 SFX (note).
- **Menu, pause and automap:**
  - The menu froze the world.
  - The Pause key froze the game. Unpaused, 36 tics ran per second.
  - The automap toggle caused no movement.
- **Focus loss (`blur`):**
  - A held turn stopped immediately, and input worked after the blur.
- **Final audio counters:** sfxRequested 21 = sfxPlayed 21, sfxBad 0, musicErrors 0, maxPeak 0.48. The audio clock advanced 2.005 s per 2.003 s of wall time. 0 page errors.

**Difference from the last run:** F.blur-stops-held-forward reported coastAfterBlur 0, where the last run saw 53. The script measures only from the moment of the blur and never checks that the player was moving. At that point in the sequence the player is probably against a wall after the Use test, so this run's pass is vacuous.

**MCP recheck** (mcp-blur-check.json, screens/mcp-after-blur-check.png, mcp-console.log):
- Setup: fresh E1M1 spawn, open space ahead. I held ArrowUp for 600 ms, then dispatched `blur` without sending a keyup.
- After the blur the player coasted 70 units, the last movement came 44 tics later, and there was 0 movement in the last second.
- Control: the same move with a real keyup coasted 78 units and stopped 48 tics later.
- So `blur` releases the held key and normal momentum follows. Input worked afterwards (116 units). The console had 0 errors.
- The screenshot shows correctly coloured E1M1 and the HUD.

**pause_check** (pause.log, pause-results.json): 6/6, rc=0.
- With keys held, pause gave dPos 0 and dAng 0 while gametic advanced by 46. Unpause resumed movement (94 units).
- The menu froze the world while a key was held. After the menu closed the player coasted 8 units, then stopped (dPos 0).

**coast_pertic** (coast-pertic.log/json):
- 109 consecutive tics with 0 gaps. Peak speed 7 u/tic.
- The player stopped 45 tics after release, the same as the last two runs and consistent with vanilla friction.

**visibility_release** (visibility-release.log/json): pass.
- With a turn held, forcing `document.hidden` and dispatching `visibilitychange` produced no turning over the next 35 tics. Input worked after visibility was restored.

## Unresolved (owner)
1. UNVERIFIED, human: SFX and music correctness by ear (A1). The counters and peaks show only that audio plays without errors and is not silent.
2. UNVERIFIED, human: real hidden-tab or minimized timing and audio (H1). Playwright could not hide the page (oH1nxw). Use the tests/README.md protocol.
3. Test-quality note for whoever owns the review scripts (not a product defect): review_state's F.blur-stops-held-forward can pass with no movement. It should check that the player is moving at the blur, or run in open space as mcp-blur-check did. The tester's protected drop-blur fault check is a separate check and is not affected.
4. Student decision (coder_input_audio if required): the music is an oscillator synth, not OPL-faithful. WASD and mouse are not mapped. Volume is not persisted (P1).
5. UNVERIFIED, tester: level exit (G3c), pickups, damage and death, Firefox, Safari, HiDPI.
6. Observation, not judged a defect: music keeps playing in the menu and while paused.
7. No new defects for coder_input_audio, coder_render_timing or coder.

## Assumptions
- The required controls are Doom's default keys. Correct momentum means vanilla thrust and friction within integer rounding. A turn counts as stopped when the angle changes no more than 3 tics after release. These criteria are agent-proposed, not student-approved.
- Headless audio peaks count only as evidence of non-silence. The MCP numbers were transcribed from the tool result into mcp-blur-check.json.
- The MCP session's sfx count of 62 includes demo and menu sounds after the canvas click. I did not analyse it further.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR, plus MCP snapshot and console captures in artifacts/browser/.

## Next action
- **Human:** run the A1 listening test and the H1 protocol.
- **Tester:** optionally adopt the open-space `blur` and `visibilitychange` checks.
- **If the source changes:** rerun this review.
