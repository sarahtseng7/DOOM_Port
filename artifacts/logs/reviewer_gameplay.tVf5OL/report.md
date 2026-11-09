FINDINGS

reviewer_gameplay tVf5OL, 2026-11-04. The build is unchanged, and on it I found no movement, playability or audio-pipeline defect, so there is nothing to assign to a coder:
- All five scripted probes pass: review_state 32 pass, 0 fail, 2 notes.
- An independent Playwright MCP session agrees with them.

The result stays FINDINGS, not PASS, because nobody has listened to the audio (A1) and a real hidden tab (H1) has not been tested.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` prefix 92e25d7245a7dafd.
  - This is the same as reviewer_site, tester and the coders this round.
  - It differs from my previous report's 320b73c4 only because the tester edited tests/.
- dist sha256 prefixes are unchanged:
  - doom.wasm 7afb94fa1ec64b5c
  - doom.js 0090630eeaf16a87
  - doom.data 1d7d43be501e67d9
  - index.html 5905489e041214ce
  - input_audio.js cc5e94829d3893bf
  - audio_web.js 09969002dba66a00
  - render_timing.js e4114e9951ad4ed1
- The served doom.wasm hash matched.
- `find platform web Makefile -newer dist/doom.wasm` is empty and `make -n` prints "Nothing to be done", so I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/REVIEWER_GAMEPLAY.md and all six reports in artifacts/reports/:
  - reviewer_site: PASS for startup
  - tester: added the drop-visibility fault; the full verify.sh was not rerun
  - coders: no edits
- Copied the five probes from reviewer_gameplay.rhBDEY unchanged: review_state, pause_check, coast_pertic, visibility_release and blur_open.
- Started `python3 -m http.server 8197 --bind 127.0.0.1 --directory dist` (PID 31713) and ran `node <probe>.mjs <OUT_DIR> 8197`. All exited with rc=0.
- Independent check: a Playwright MCP session against the same server. I clicked the canvas, pressed Esc, Enter, Enter, Enter to start a new game, then held Up, coasted, turned Left and tapped Ctrl. Data is in mcp-check.json and screens/mcp-after-fire.png, which I viewed.
- I killed only PID 31713 and confirmed it was gone (curl returned 000).

## Results (evidence in this directory: `*.stdout.log`, `*.json`, `screens/`)
**review_state:**
- **Audio:**
  - The AudioContext was suspended before the gesture and running after it.
  - Title music peaked at 0.219, and the level music switched on entry.
  - Menu SFX played on the title menu (0->2) and in the in-game menu (19->20).
- **Level entry:** E1M1 (lvl 101), HP 100, spawn (1056,-3616). Tic rate 35.0/s. No drift while idle.
- **Forward and coast:** forward moved 83 units in 18 tics along the facing direction (cos 1), and backward moved 116 units (cos -1). The player coasted 66 units and stopped 43 tics after release, which is normal Doom momentum.
- **Turning:** Right and Left each turned ±40.43° over 14 tics with no translation, and stopped at release (0° residual).
- **Strafe:** ",", "." and Alt+Arrow each moved 112 units perpendicular to facing, with dAng 0.
- **Run:** Shift ran at 6 u/tic against 2.66 walking.
- **Fire:** ammo changed and SFX went 11->12. Held fire repeated 5 times, then stopped (0 after release).
- **Menu, pause and automap:**
  - The menu froze the world (dPos 0 over 56 tics), with no stuck key after it closed.
  - The Pause key toggled (39 tics while paused vs 35 tics resumed in 1 s each; the probe passed, as before).
  - The automap toggle caused no movement.
- **Focus loss (blur):**
  - A held turn stopped with 0 latency, and input worked after the blur (29.9°).
  - Held forward: movedBeforeBlur 28, coastAfterBlur 41, last 800 ms 0.
- **Final audio counters:** sfxRequested 22 = sfxPlayed 22, sfxBad 0, musicErrors 0, maxPeak 0.472. The audio clock advanced 2.005 s per 2.003 s of wall time. 0 page errors.

**pause_check:** all PASS. The menu freezes the world while a key is held. After it closes, 8 units of pre-menu momentum resume, then the player stops. 0 errors.

**coast_pertic:** 109 tics with 0 multi-tic gaps. Peak speed 8 u/tic. The player stopped 42 tics after release, close to earlier runs (44–45).

**visibility_release:** pass. Forcing `document.hidden` stopped a held turn (no angle change across a 35-tic window), and input worked afterwards.

**blur_open:** pass. The control (keyup) and the blur run both moved 104 units while held, coasted 70 units, made their last move 44 tics after release, and did not move in the final 1 s. Input moved 149 units after the blur. 0 errors.

**MCP session (independent harness):**
- Up held for 700 ms moved 134 units along the facing direction. After release the player coasted 73 more units, then stayed still (s2 = s3).
- Left held for 500 ms turned about 51.4° with no translation, and the angle was unchanged 700 ms later.
- A Ctrl tap took SFX from 21 to 22. The screenshot shows the pistol, ammo 49 and a correctly coloured E1M1.
- sfxBad 0, musicErrors 0, ctx running. Console: 0 errors, plus 2 autoplay warnings from before the gesture.

## Unresolved (owner)
1. UNVERIFIED, human: SFX and music correctness by ear (A1). Counters and peaks prove only that audio plays without errors and is not silent.
2. UNVERIFIED, human: a real hidden or minimized tab (H1), using the protocol in tests/README.md. The `blur` and forced `visibilitychange` here are proxies.
3. Tester (carried over from reviewer_site and tester): rerun the full `tests/verify.sh` for revision 92e25d72…. Optionally adopt blur_open.mjs into the protected checks.
4. Student decision (coder_input_audio if required): the music is an oscillator synth, not OPL-faithful. WASD and mouse are not mapped. Volume is not persisted (P1).
5. UNVERIFIED, tester: level exit (G3c), pickups, damage and death, Firefox, Safari, HiDPI.
6. Observations, not judged defects:
   - Music keeps playing in the menu and while paused.
   - Use at a wall plays 1 SFX (the "oof" sound, as in vanilla).
   - Within a run, per-tic coast decay is quantised by integer positions.
7. No new defects for coder_input_audio, coder_render_timing or coder.

## Assumptions
- The required controls are Doom's default keys.
- Correct momentum means vanilla thrust and friction within integer rounding (a stop roughly 40–45 tics after release).
- A turn counts as stopped when the angle stops changing within 3 tics of release.
- All of these criteria are agent-proposed, not student-approved.
- Headless audio peaks count only as evidence of non-silence.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR, plus the Playwright MCP snapshot and console capture under artifacts/browser/. No source, test, build, or loop edits.

## Next action
- **Human:** run A1 and H1.
- **Tester:** run the full verify.sh on 92e25d72….
- **Student:** decide the scope items in item 4.
- **If the dist hashes change:** rerun the five probes here with `node <probe>.mjs <OUT> <PORT>`.
