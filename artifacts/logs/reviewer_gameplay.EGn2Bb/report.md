FINDINGS

I found no movement, playability or audio-pipeline defect in the current build, so there is nothing to assign to a coder. All five probes passed in headless Chromium:
- review_state: 32 pass, 0 fail, 2 notes
- pause_check: 6/6
- per-tic coast: 109 tics, 0 gaps
- visibilitychange release: pass
- new open-space blur probe: pass

The review_state test-quality issue from the last run (ZIYPuo item 3) is fixed in this run's copy. The forward-blur check now records how far the player moved before the blur, and it passed with real motion: 32 units before the blur, 43 units of coast, 0 afterwards.

The result is still FINDINGS, not PASS, because nobody has listened to the audio (A1) and real hidden-tab behaviour (H1) has not been tested.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` prefix 320b73c4c8ae5476. This differs from ZIYPuo's abd25326f8b63876.
- Per-path diff hashes:
  - platform 1acdffa1e570967d
  - web 85ac276c9dfe4d6d
  - tests c0501e435fcc724a
  - loop 61ff85ca3ce21ac8

  These match reviewer_site's report.
- `find platform web Makefile tests -newer dist/doom.wasm` is empty and `make -n` prints "Nothing to be done", so I did not rebuild. I conclude the hash change is outside the product (probably loop/), but I did not confirm this.
- dist/ sha256 prefixes are identical to ZIYPuo and every other report:
  - doom.wasm 7afb94fa1ec64b5c
  - doom.js 0090630eeaf16a87
  - doom.data 1d7d43be501e67d9
  - index.html 5905489e041214ce
  - input_audio.js cc5e94829d3893bf
  - audio_web.js 09969002dba66a00
  - render_timing.js e4114e9951ad4ed1
- artifacts/specification.md and acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, the README files, loop/prompts/REVIEWER_GAMEPLAY.md and all reports in artifacts/reports/:
  - reviewer_site: PASS for startup
  - tester: verify.sh rc=0, 6/6 faults caught
  - coder_input_audio: no edits
  - reviewer_gameplay (ZIYPuo)
- Copied ZIYPuo's probes. coast_pertic, pause_check and visibility_release are unchanged apart from a header comment.
- Changed review_state.mjs: F.blur-stops-held-forward now records `movedBeforeBlur`. If the player moved less than 8 units before the blur, the check becomes an inconclusive NOTE instead of a vacuous pass.
- Added blur_open.mjs, a scripted version of ZIYPuo's MCP recheck. It loads a fresh E1M1 spawn facing open floor and holds ArrowUp for 600 ms.
  - Control: a real keyup.
  - Test: a dispatched `blur` with no keyup.
  - Pass requires: the player moved while the key was held, stops within control +6 tics, has 0 movement in the final second, input works afterwards, and there are 0 page errors.
- Started `python3 -m http.server 8195 --bind 127.0.0.1 --directory dist` (PID 14918) and ran all five probes against it. Then I killed only PID 14918 and confirmed port 8195 was closed (curl 000).
- I edited no source, test, build or loop files.

## Results (evidence in this directory)
**review_state** (review.log, review-results.json, screens/), rc=0:
- **Audio:**
  - The AudioContext was suspended before the gesture and running after it.
  - Title music peaked at 0.250, and the level music switched on entry.
  - Menu cursor moves played SFX on the title menu (0->2) and in the in-game menu (19->20).
- **Level entry:** E1M1 (lvl 101), HP 100, spawn (1056,-3616). Tic rate 35.0/s.
- **Forward and coast:** forward moved 76 units along the facing direction (cos 1). After release the player coasted 65 units and stopped 47 tics later, which is normal Doom momentum. The single 0 in the 25 ms samples is a sampling alias. The per-tic probe below shows no gaps.
- **Turning:** turns of ±40.43° stop 0 tics after release, with no translation.
- **Strafe:** ",", "." and Alt+Arrow each moved 112 units perpendicular to facing (|cosR| = 1), with dAng 0.
- **Run:** Shift ran at 6.5 u/tic against 1.94 walking.
- **Fire:** ammo digits changed and SFX went 11->12. Held fire repeated 5 times, then stopped (0 after release).
- **Use:** pressing Use at a wall played 1 SFX (note).
- **Menu, pause and automap:** the menu froze the world (dPos 0 over 57 tics). The Pause key toggled. The automap toggle caused no movement.
- **Focus loss (`blur`):**
  - A held turn stopped immediately, and input worked after the blur (29.9°).
  - Held forward: movedBeforeBlur 32, coastAfterBlur 43, last 800 ms 0. **This run's pass is not vacuous.**
- **Final audio counters:** sfxRequested 22 = sfxPlayed 22, sfxBad 0, musicErrors 0, maxPeak 0.466. The audio clock advanced 2.000 s per 2.002 s of wall time. 0 page errors.

**blur_open** (blur-open.json, blur-open.log, screens/blur-open-after.png): pass.

| | moved while held | coast after release | last move after release | final 1 s | input afterwards |
| --- | --- | --- | --- | --- | --- |
| Control (keyup) | 104 | 70 | 44 tics | 0 | — |
| Blur | 104 | 70 | 44 tics | 0 | 149 units |

The blur behaves exactly like a real keyup, with normal momentum. The screenshot shows correctly coloured E1M1 and the HUD.

**pause_check** (pause.log, pause-results.json): 6/6.

**coast_pertic** (coast-pertic.log/json):
- 109 consecutive tics with 0 gaps. Peak speed 7 u/tic.
- The player stopped 44 tics after release; earlier runs measured 45.
- The integer-rounded decay ratios match ZIYPuo's pattern.

**visibility_release** (visibility-release.log/json): pass.
- While a turn was held, forcing `document.hidden` stopped the turning: 0 change over the next 35 tics. Input worked afterwards.

## Unresolved (owner)
1. UNVERIFIED, human: SFX and music correctness by ear (A1). The counters and peaks prove only that audio plays without errors and is not silent.
2. UNVERIFIED, human: real hidden-tab or minimized timing and audio (H1). Use the protocol in tests/README.md.
3. Tester, optional: adopt blur_open.mjs and the movedBeforeBlur precondition into protected checks. The tester's drop-blur fault check is separate and unaffected.
4. Student decision (coder_input_audio if required): the music is an oscillator synth, not OPL-faithful. WASD and mouse are not mapped. Volume is not persisted (P1).
5. UNVERIFIED, tester: level exit (G3c), pickups, damage and death, Firefox, Safari, HiDPI.
6. Observation, not judged a defect: music keeps playing in the menu and while paused.
7. No new defects for coder_input_audio, coder_render_timing or coder.

## Assumptions
- The required controls are Doom's default keys.
- Correct momentum means vanilla thrust and friction within integer rounding.
- A turn counts as stopped when the angle stops changing within 3 tics of release.
- The blur pass threshold is control +6 tics.
- All of these criteria are agent-proposed, not student-approved.
- Headless audio peaks count only as evidence of non-silence.
- I did not use Playwright MCP this run. The scripted blur_open probe replaces ZIYPuo's manual MCP recheck.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only.

## Next action
- **Human:** run the A1 listening test and the H1 protocol.
- **Student:** approve or amend the criteria and decide the scope items in item 4.
- **If the source or dist hashes change:** rerun these five probes with `node <probe>.mjs <OUT> <PORT>` against `dist/` served locally.
