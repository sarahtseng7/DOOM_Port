FINDINGS

reviewer_gameplay nRdKS9, 2026-11-04. The build is unchanged. I found no defect in movement, playability or the audio pipeline, so there is nothing to assign to a coder:
- All five scripted probes pass: review_state 32 pass, 0 fail, 2 notes.
- An independent Playwright MCP session agrees with them.

The result stays FINDINGS, not PASS, because nobody has listened to the audio (A1) and a real hidden tab (H1) has not been tested.

## Source identity (source-identity.txt, dist-hashes.txt)
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 92e25d7245a7dafd…, the same as every current report in artifacts/reports/.
- dist sha256 prefixes are unchanged:
  - doom.wasm 7afb94fa1ec64b5c
  - doom.js 0090630eeaf16a87
  - doom.data 1d7d43be501e67d9
  - index.html 5905489e041214ce
  - input_audio.js cc5e94829d3893bf
  - audio_web.js 09969002dba66a00
  - render_timing.js e4114e9951ad4ed1
- The doom.wasm served on :8198 hashed to 7afb94fa….
- `find platform web Makefile -newer dist/doom.wasm` is empty and `make -n` prints "Nothing to be done", so I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/REVIEWER_GAMEPLAY.md and all six reports in artifacts/reports/. None names an open defect for a coder.
- Copied the five probes from reviewer_gameplay.tVf5OL unchanged: review_state, pause_check, coast_pertic, visibility_release and blur_open.
- Started `python3 -m http.server 8198 --bind 127.0.0.1 --directory dist` (PID 39160), after checking that the port was free. Ran `node <probe>.mjs <OUT_DIR> 8198`. All five exited with rc=0.
- Ran an independent Playwright MCP session (mcp-check.json).
- I killed only PID 39160 and confirmed it was gone (curl returned 000).

## Results (in this directory: `*.stdout.log`, `*.json`, `screens/`)
**review_state, 32 PASS / 0 FAIL / 2 NOTE:**
- **Audio:**
  - The AudioContext was suspended before the gesture and running after it.
  - Title music peaked at 0.233, and the level music switched on entry.
  - Menu SFX played on the title menu (0->2) and in the in-game menu (18->19).
- **Level entry:** E1M1 (lvl 101), HP 100, spawn (1056,-3616). Tic rate 35.0/s. No drift while idle.
- **Forward and coast:** forward moved 76 units in 17 tics along the facing direction (cos 1), and backward moved 116 units (cos -1). The player coasted 73 units and stopped 44 tics after release. Per-sample steps decayed 7→2, which is normal Doom friction.
- **Turning:** Right turned -36.9° and Left +40.4° over 14 tics with no translation. Each had a residual of 3.52° (one turn step), and the angle stopped changing within 1–2 tics of release. That is within the 3-tic criterion.
- **Strafe:** ",", "." and Alt+Arrow each moved 112.2 units perpendicular to facing, with dAng 0.
- **Run:** Shift ran at 6.51 u/tic against 2.91 walking.
- **Fire:** ammo changed and SFX went 11->12. Held fire repeated 4 times, then stopped (0 after release).
- **Menu, pause and automap:**
  - The menu froze the world (dPos 0 over 56 tics), with no stuck key after it closed.
  - The Pause key toggled (39 tics while paused vs 36 tics resumed in 1 s each; same result as earlier runs).
  - The automap toggle caused no movement.
- **Focus loss (blur):**
  - A held turn stopped with 0 latency, and input worked after the blur (26.4°).
  - Held forward: movedBeforeBlur 28, coastAfterBlur 41, last 800 ms 0.
- **Final audio counters:** sfxRequested 21 = sfxPlayed 21, sfxBad 0, musicErrors 0, maxPeak 0.436. The audio clock advanced 2.000 s per 2.003 s of wall time. 0 page errors.
- **Screenshots (viewed):** 03-fire-post.png shows E1M1 in correct colours with the pistol and ammo 49. 04-menu.png shows the in-game main menu with the skull cursor.

**pause_check:** all PASS. The world froze while paused and while the menu was open with a key held. Movement resumed after unpausing (101 units). After the menu closed, 8 units of pre-menu momentum resumed, then the player stopped. 0 errors.

**coast_pertic:** 109 tics with 0 multi-tic gaps. Peak speed 8 u/tic. The player stopped 42 tics after release.

**visibility_release:** pass. Forcing `document.hidden` stopped a held turn (no change across a 35-tic window), and input worked afterwards.

**blur_open:** pass. The player moved 104 units while held, coasted 78 units, made their last move 42 tics after release, and did not move in the final 1 s. Input moved 141 units after the blur. 0 errors.

**MCP session (independent harness, 1280x720):**
- New game via click, Esc, Enter, Enter, Enter. I confirmed E1M1 at spawn.
- Up held for 700 ms moved 127 units, coasted 80 more, then stayed still (0 over the next 700 ms).
- Left held for 500 ms turned 51.0° with 0 units of translation, and had a 3.52° one-step residual after release.
- **Tap-duration sweep for fire (new this run):** a key down/up with no hold registered 0 of 6 times. Holding the key registered:
  - 10 ms: 3/8
  - 20 ms: 6/8
  - 35 ms: 8/8
  - 50 ms: 8/8
  - 80 ms: 5/5
- Ammo went 50→20, which is 30 shots. That equals the sum of the registered fire SFX (0+5+3+6+8+8). Fire actions and SFX counters agree one-to-one.
- Use (Space) in open space played 0 SFX, which is vanilla. Use at a wall in review_state played 1 ("oof").
- Final: sfxRequested 97 = sfxPlayed 97, sfxBad 0, musicErrors 0, ctx running, maxPeak 0.71.
- Console: 35 messages, 0 errors, plus 2 pre-gesture AudioContext autoplay warnings (audio_web.js:27, :53).
- screens/mcp-after-fire.png (viewed): E1M1 in correct colours, HP 100, ammo 20.

## Interpretation of the tap sweep (not a defect)
platform/input_audio.c queues events FIFO, and the engine drains them once per tic before building the ticcmd. When the down and the release both arrive inside one 28.6 ms tic, the press is consumed before G_BuildTiccmd samples key state. Vanilla Doom's event loop does the same.

The registration rate matches the expected probability that the hold spans a tic boundary (about hold/28.6 ms). Taps of 35 ms or longer always register. Human key taps are normally longer than that.

This affects automation more than people: scripts that use a zero-hold `keyboard.press` will see dropped inputs. If the student wants sub-tic taps latched, which would differ from vanilla, the owner is coder_input_audio.

## Unresolved (owner)
1. UNVERIFIED, human: SFX and music correctness by ear (A1). Counters and peaks prove only that audio plays without errors and is not silent.
2. UNVERIFIED, human: a real hidden or minimized tab (H1), using the protocol in tests/README.md. The `blur` and forced `visibilitychange` here are proxies.
3. Student decision (coder_input_audio if required):
   - The music is an oscillator synth, not OPL-faithful.
   - WASD and mouse are not mapped.
   - Volume is not persisted (P1).
   - Sub-tic tap latching (see above).
4. UNVERIFIED, tester: level exit (G3c), pickups, damage and death, Firefox, Safari, HiDPI.
5. Tester (optional): protected checks that send key taps should hold them for at least 35 ms, or they will flake.
6. Observations, not judged defects:
   - Music keeps playing in the menu and while paused.
   - Use at a wall plays the "oof" sound.
   - Turning has a one-step residual after release.
7. No new defects for coder_input_audio, coder_render_timing or coder.

## Assumptions
- The required controls are Doom's default keys.
- Correct momentum means vanilla thrust and friction within integer rounding (a stop roughly 40–45 tics after release).
- A turn counts as stopped when the angle stops changing within 3 tics of release.
- Sub-tic tap loss is acceptable because it is vanilla behaviour.
- All of these criteria are agent-proposed, not student-approved.
- Headless audio peaks count only as evidence of non-silence.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR, plus the Playwright MCP snapshot and console capture under artifacts/browser/ (page-2026-11-04T11-07-59-170Z.yml, console-2026-11-04T11-07-58-978Z.log). No source, test, build or loop edits, and no result.json.

## Next action
- **Human:** run A1 and H1.
- **Student:** decide the scope items in item 3.
- **If the dist hashes change:** rerun the five probes here with `node <probe>.mjs <OUT> <PORT>`, plus the tap sweep.
