FINDINGS

I reran all five gameplay probes in headless Chromium on an unchanged build and found no movement, playability or audio-pipeline defect, so there is nothing to assign to a coder:
- review_state: 32 pass, 0 fail, 2 notes
- pause_check: all PASS
- coast_pertic: 108 tics, 0 gaps
- visibility_release: pass
- blur_open: pass

The result is still FINDINGS, not PASS, because nobody has listened to the audio (A1) and real hidden-tab behaviour (H1) has not been tested.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` prefix 320b73c4c8ae5476, the same as the previous run (EGn2Bb).
- Per-path diff hashes match EGn2Bb:
  - platform 1acdffa1e570967d
  - web 85ac276c9dfe4d6d
  - tests c0501e435fcc724a
  - loop 61ff85ca3ce21ac8
- dist/ sha256 prefixes are unchanged:
  - doom.wasm 7afb94fa1ec64b5c
  - doom.js 0090630eeaf16a87
  - doom.data 1d7d43be501e67d9
  - index.html 5905489e041214ce
  - input_audio.js cc5e94829d3893bf
  - audio_web.js 09969002dba66a00
  - render_timing.js e4114e9951ad4ed1
- `find platform web Makefile tests -newer dist/doom.wasm` is empty and `make -n` prints "Nothing to be done", so I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/REVIEWER_GAMEPLAY.md and all six reports in artifacts/reports/:
  - reviewer_site: PASS for startup
  - tester: FINDINGS (verify.sh rc=0, 6/6 faults caught)
  - all three coders: no edits
- Copied EGn2Bb's five probes into this directory unchanged. Apart from the header lines, review_state.mjs diffs as identical.
- Started `python3 -m http.server 8196 --bind 127.0.0.1 --directory dist` (PID 24449) and ran each probe with `node <probe>.mjs <OUT_DIR> 8196`.
- Killed only PID 24449 and confirmed it was gone (curl returned 000).
- Viewed screens/03-fire-post.png: E1M1 renders with correct colours, and the HUD shows ammo at 49 after one shot.
- I edited no source, test, build or loop files.

## Results (evidence in this directory: `*.stdout.log`, `*.json`, `screens/`)
**review_state** (rc=0):
- **Audio:**
  - The AudioContext was suspended before the gesture and running after it.
  - Title music peaked at 0.229, and the level music switched on entry.
  - Menu cursor moves played SFX on the title menu (0->2) and in the in-game menu (19->20).
- **Level entry:** E1M1 (lvl 101), HP 100, spawn (1056,-3616). Tic rate 35.0/s. No drift while idle.
- **Forward and coast:** forward moved 76 units along the facing direction (cos 1), and backward moved 116 units (cos -1). After release the player coasted 73 units and stopped 44 tics later, which is normal Doom momentum.
- **Turning:**
  - Turns of -36.9° and +40.4° caused no translation.
  - Turning stopped within 1 tic of release (Right: -3.5° of residual turn; Left: 0°).
- **Strafe:** ",", "." and Alt+Arrow each moved 112 units perpendicular to facing, with dAng 0.
- **Run:** Shift ran at 7 u/tic against 2.71 walking.
- **Fire:** ammo changed and SFX went 11->12. Held fire repeated 5 times, then stopped (0 after release).
- **Use:** pressing Use at a wall played 1 SFX (note).
- **Menu, pause and automap:**
  - The menu froze the world (dPos 0 over 57 tics), with no stuck key after it closed.
  - The Pause key toggled (38 tics while paused vs 35 tics resumed in 1 s each; the probe passed).
  - The automap toggle caused no movement.
- **Focus loss (`blur`):**
  - A held turn stopped immediately, and input worked after the blur (26.4°).
  - Held forward: movedBeforeBlur 28, coastAfterBlur 40, last 800 ms 0. This pass is not vacuous.
- **Final audio counters:** sfxRequested 22 = sfxPlayed 22, sfxBad 0, musicErrors 0, maxPeak 0.472. The audio clock advanced 2.000 s per 2.004 s of wall time. 0 page errors.
- **Notes:** music keeps playing in the menu (13 voices). Use-at-wall played 1 SFX.

**pause_check:**
- The menu freezes the world while a key is held (dPos 0 over 42 tics).
- There is no stuck key after the menu closes: dPos 8 of pre-menu momentum, then 0.
- 0 page errors.

**coast_pertic:** 108 consecutive tics with 0 multi-tic gaps. Peak speed 7 u/tic. The player stopped 44 tics after release, consistent with earlier runs (44–45).

**visibility_release:** pass. Forcing `document.hidden` stopped a held turn, and input worked afterwards. 0 errors.

**blur_open:** pass.

| | moved while held | coast after release | last move after release | final 1 s | input afterwards |
| --- | --- | --- | --- | --- | --- |
| Control (keyup) | 104 | 70 | 44 tics | 0 | — |
| Blur | 104 | 78 | 42 tics | 0 | 141 units |

The blur behaves like a real keyup, with normal momentum. 0 errors.

## Unresolved (owner)
1. UNVERIFIED, human: SFX and music correctness by ear (A1). The counters and peaks prove only that audio plays without errors and is not silent.
2. UNVERIFIED, human: real hidden-tab or minimized timing and audio (H1). Use the protocol in tests/README.md. The dispatched `blur` and forced `visibilitychange` are proxies only.
3. Tester, optional and carried over: adopt blur_open.mjs and the movedBeforeBlur precondition into protected checks.
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
- I used scripted Playwright probes, not Playwright MCP.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only.

## Next action
- **Human:** run the A1 listening test and the H1 protocol.
- **Student:** approve or amend the criteria and decide the scope items in item 4.
- **If the source or dist hashes change:** rerun `node <probe>.mjs <OUT> <PORT>` for the five probes here, against `dist/` served locally.
