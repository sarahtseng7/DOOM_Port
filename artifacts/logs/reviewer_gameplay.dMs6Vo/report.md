FINDINGS

reviewer_gameplay dMs6Vo, 2026-11-04. I found no new defect in movement, playability or the audio pipeline, so there is nothing to assign to a coder:
- All five scripted probes pass on the current build: review_state 32 pass, 0 fail, 2 notes.
- An independent Playwright MCP session agrees with them, and adds weapon switching, which earlier runs did not cover.

The result stays FINDINGS, not PASS, because nobody has listened to the audio (A1) and a real hidden tab (H1) has not been tested.

## Source identity (source-identity.txt, dist-hashes.txt)
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 92e25d7245a7dafd…, the same as every report in artifacts/reports/.
- dist sha256 prefixes are unchanged:
  - doom.wasm 7afb94fa1ec64b5c
  - doom.js 0090630eeaf16a87
  - doom.data 1d7d43be501e67d9
  - index.html 5905489e041214ce
  - input_audio.js cc5e94829d3893bf
  - audio_web.js 09969002dba66a00
  - render_timing.js e4114e9951ad4ed1
- `find platform web Makefile -newer dist/doom.wasm` is empty, so I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/REVIEWER_GAMEPLAY.md and all six reports in artifacts/reports/. None names an open defect for a coder. reviewer_site HSI496 is PASS for startup, so I did not repeat that review.
- Copied the five probes from reviewer_gameplay.nRdKS9 unchanged (*.mjs here).
- Started `python3 -m http.server 8199 --bind 127.0.0.1 --directory dist` (PID 46394). Ran `node <probe>.mjs <OUT_DIR> 8199`. All five exited with rc=0.
- Ran an independent Playwright MCP session (mcp-check.json, mcp-console-warnings.log).
- I killed only PID 46394 and confirmed it was gone (curl returned 000).

## Results (in this directory: `*.stdout.log`, `*.json`, `screens/`)
**review_state, 32 PASS / 0 FAIL / 2 NOTE:**
- **Audio:**
  - The AudioContext was suspended before the gesture and running after it.
  - Title music peaked at 0.220, and the level music switched on entry.
  - Menu SFX played on the title menu (0->2) and in the in-game menu (19->20).
- **Level entry:** E1M1 (lvl 101), HP 100, spawn (1056,-3616). Tic rate 34.7/s. No drift while idle.
- **Forward and coast:**
  - Forward moved 76 units in 17 tics along the facing direction (cos 1), and backward moved 116 units (cos -1).
  - The player coasted 73 units and stopped 43 tics after release. Steps decayed, which is normal Doom friction.
  - coast_pertic: 0 multi-tic gaps in 109 tics, and the player stopped 45 tics after release.
- **Turning:**
  - Right turned -36.9° and Left +40.4° over 14 tics with no translation.
  - The last angle change came 0 tics after release, with a residual of at most one turn step (3.52°).
- **Strafe:** ",", "." and Alt+Arrow each moved 112 units perpendicular to facing, with dAng 0.
- **Run:** Shift ran at 6.60 u/tic against 2.46 walking.
- **Fire:** ammo and SFX changed (11->12). Held fire repeated 5 times, then stopped (0 after release).
- **Menu, pause and automap:**
  - The menu froze the world (dPos 0 over 56 tics), with no stuck key after it closed.
  - The Pause key froze the world, and movement resumed after unpausing (pause_check: 94 units).
  - The automap toggle caused no movement. 05-automap.png shows "E1M1: HANGAR".
- **Focus loss:**
  - Blur stopped a held turn, and input worked after the blur (29.9°).
  - Held forward: coasted 43 units after the blur, and 0 movement in the last 800 ms.
  - A forced `visibilitychange` stopped a held turn (visibility_release).
  - blur_open: the player coasted 78 units, made their last move 42 tics after release, and did not move in the final 1 s.
- **Final audio counters:** sfxRequested 22 = sfxPlayed 22, sfxBad 0, musicErrors 0, maxPeak 0.46. The audio clock advanced 2.000 s per 2.003 s of wall time. 0 page errors.
- **Screenshots (viewed):** 03-fire-post.png shows E1M1 in correct colours with the pistol and ammo 49.

**MCP session (new this run):**
- New game started at E1M1 spawn.
- **Weapon switching:**
  - Key 1 switched to the fist, and the HUD ammo field went blank as expected (screens/mcp-weapon1.png).
  - A fist swing at empty air played 0 SFX. That is vanilla: A_Punch plays a sound only on a hit.
  - Key 2 switched back to the pistol, with ammo 50 (screens/mcp-weapon2.png).
- Up held for 600 ms moved 97 units, coasted 77 more, then stayed still (0 over the next 700 ms).
- Audio: sfxRequested 27 = sfxPlayed 27, sfxBad 0, musicErrors 0, ctx running.
- Console: 35 messages, 0 errors, plus 2 pre-gesture AudioContext autoplay warnings (audio_web.js:27, :53). These are expected browser policy messages.

## Unresolved (owner)
1. UNVERIFIED, human: SFX and music correctness by ear (A1). Counters and peaks prove only that audio plays without errors and is not silent.
2. UNVERIFIED, human: a real hidden or minimized tab (H1). The `blur` and forced `visibilitychange` here are proxies.
3. Student decision (coder_input_audio if required):
   - The music is an oscillator synth, not OPL-faithful.
   - WASD and mouse are not mapped.
   - Volume is not persisted (P1).
   - Sub-tic taps are not latched (vanilla behaviour; see report nRdKS9).
4. UNVERIFIED, tester: level exit (G3c), pickups, damage and death, Firefox, Safari, HiDPI.
5. Observations, not judged defects:
   - Music keeps playing in the menu.
   - Use at a wall plays the "oof" sound.
   - Turning has a one-step residual after release.
6. No new defects for coder_input_audio, coder_render_timing or coder.

## Assumptions
- The required controls are Doom's default keys.
- Correct momentum means vanilla thrust and friction, with a stop roughly 40–45 tics after release.
- A turn counts as stopped when the angle stops changing within 3 tics of release.
- All of these criteria are agent-proposed, not student-approved.
- Headless audio peaks count only as evidence of non-silence.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR, plus the Playwright MCP snapshot and console capture under artifacts/browser/ (page-2026-11-04T12-07-34-327Z.yml, console-2026-11-04T12-07-34-125Z.log). No source, test, build or loop edits, and no result.json.

## Next action
- **Human:** run A1 and H1.
- **Student:** decide the scope items in item 3.
- **If the dist hashes change:** rerun the five probes with `node <probe>.mjs <OUT> <PORT>`, plus the MCP weapon and movement check.
