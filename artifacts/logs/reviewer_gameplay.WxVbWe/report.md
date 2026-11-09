FINDINGS

reviewer_gameplay WxVbWe, 2026-11-04. I found no defect in movement, playability or the audio pipeline, so there is nothing to assign to a coder.
- The five inherited probes pass again on the same binary (review_state 32 pass / 0 fail / 2 notes).
- A new probe passes 12/12. It covers typed-letter input through the IDKFA, IDDQD and IDCLEV cheats, and firing the shotgun, chaingun, rocket launcher and plasma gun with SFX and ammo changes. It also covers changing level with a music restart, and movement in the new level.
- A new real-tab-switch probe for H1 was inconclusive: Playwright never set the original tab to hidden.

The result stays FINDINGS because audio correctness by ear (A1) and a real hidden tab (H1) remain UNVERIFIED.

## Source identity (source-identity.txt, dist-hashes.txt)
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 92e25d7245a7dafd…, the same as every report in artifacts/reports/.
- dist prefixes are unchanged:
  - doom.wasm 7afb94fa1ec64b5c
  - doom.js 0090630eeaf16a87
  - doom.data 1d7d43be501e67d9
  - index.html 5905489e041214ce
  - input_audio.js cc5e94829d3893bf
  - audio_web.js 09969002dba66a00
  - render_timing.js e4114e9951ad4ed1
- `find platform web Makefile -newer dist/doom.wasm` was empty, so I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/REVIEWER_GAMEPLAY.md and all six reports in artifacts/reports/. No report names an open defect. reviewer_site 0fZGKo is PASS for startup, so I did not repeat that review.
- Started `python3 -m http.server 8199 --bind 127.0.0.1 --directory dist` (PID 54049). When I finished, I killed only that PID and confirmed with curl that the server was gone (000).
- Copied the five probes from reviewer_gameplay.dMs6Vo unchanged and ran `node <probe>.mjs <OUT_DIR> 8199`. All exited 0.
- New this run:
  - hidden_tab.mjs and hidden_tab_headed.mjs (the headed copy differs only in its launch option and output names).
  - cheats_weapons.mjs.

## Results (all files in this directory)
### review_state: 32 PASS, 0 FAIL, 2 NOTE (review_state.stdout.log)
- **Audio startup:** the AudioContext was suspended before the user gesture and running after it. Title music peaked at 0.229, and the level music switched on entry.
- **Level entry:** E1M1 (lvl 101), spawn (1056,-3616), HP 100. Tic rate 35.0/s. No drift while idle.
- **Forward and backward:**
  - Forward moved 83 units in 18 tics along the facing direction (cos 1). Backward moved 116 units (cos -1).
  - After release the player coasted 66 units and stopped 43 tics later. Steps decayed 6→2, which matches vanilla friction.
  - coast_pertic: 0 multi-tic gaps, and the player stopped 45 tics after release.
- **Turning:** each arrow turned ±40.4° over 14–15 tics with no translation, and the angle stopped changing at release (0 tics).
- **Strafe:** ",", "." and Alt+Arrow each moved 112 units perpendicular to facing, with dAng 0.
- **Run:** Shift ran at 6.0 u/tic against 2.66 walking.
- **Fire:** ammo and SFX changed (11→12). Held fire repeated 5 times, then stopped (0 after release).
- **Menu and pause:**
  - The menu froze the world (dPos 0 over 56 tics), with no stuck key afterwards.
  - Pause froze the world, and unpausing resumed movement (94 units).
  - The automap toggle caused no movement.
- **Focus loss:**
  - Blur stopped a held turn (0° latency) and a held forward (coasted 41, then 0 in the last 800 ms). Input still worked after the blur.
  - visibility_release and blur_open: pass=true.
- **Final audio counters:** sfxRequested 22 = sfxPlayed 22, sfxBad 0, musicErrors 0, maxPeak 0.467. The audio clock advanced 2.005 s per 2.004 s of wall time. 0 page errors.

### cheats_weapons: 12 PASS, 0 FAIL (cheats_weapons.stdout.log, cheats-weapons.json, screens/cw-*.png)
- **IDKFA:** typed as separate letter keys, it was accepted. The ammo HUD changed (diff 0.18). The screenshot shows "VERY HAPPY AMMO ADDED", 200% armour, all three keys and arms 2–7 (cw-02-shotgun.png).
- **Firing:** each weapon played SFX and its ammo field changed:
  - shotgun +1 sfx
  - chaingun +2 (two rounds in a 150 ms hold)
  - rocket +1
  - plasma +1
- **Sprites:** the shotgun and chaingun sprites differ (0.227). cw-03-rocket-fired.png shows the rocket in flight and RCKT 49.
- **IDDQD:** accepted and HP stayed 100. This check is weak, because no damage was taken.
- **IDCLEV13:**
  - Changed the level from lvl 101 to 103 and restarted the music (musicStarted 3→4).
  - cw-05-idclev13.png shows E1M3 with a pistol-start inventory, which is vanilla IDCLEV behaviour.
  - Forward then moved 127 units in the new level. 0 page errors.

### hidden_tab: INCONCLUSIVE (hidden-tab.json, hidden-tab-headed.json)
- **What I did:** held Right on the game tab, opened a second tab with `bringToFront`, waited 2 s, then returned. I ran this both headless and headed.
- **What happened:** `document.visibilityState` stayed `visible`, and no visibilitychange or blur fired. Playwright emulates each page as focused and visible. Because the page never lost focus, the turn kept going (+110° while "hidden").
- **Why this is not a defect:**
  - The tab was never actually hidden, so the probe did not exercise the condition it targets.
  - In a real tab switch the browser fires blur and visibilitychange, and earlier probes show those events release held keys.
  - The game kept ticking (70 tics in 2 s), audio stayed running, and input worked after returning (40.4°).
- **Note for later readers:** turnAfterReturn reads 173.67°, but that comes from the probe's ±180° wrap, not from game behaviour.

## Unresolved (owner)
1. UNVERIFIED, human: SFX and music correctness by ear (A1). Counters and peaks prove only that audio plays without errors and is not silent.
2. UNVERIFIED, human: a real hidden or minimized tab (H1). This run showed that Playwright tab switching cannot create a hidden tab, so a person must do it.
   - Suggested manual step: hold Right, press Cmd+T, wait 2 s, close the tab, and confirm the view is not spinning.
3. Student decision (coder_input_audio if required):
   - The music is an oscillator synth, not OPL-faithful.
   - WASD and mouse are not mapped.
   - Volume is not persisted (P1).
   - Sub-tic taps are not latched.
4. UNVERIFIED, tester: these remain untested:
   - Normal level exit through the exit switch (G3c). IDCLEV is only a proxy.
   - Pickups, taking damage and death.
   - Firefox, Safari and HiDPI.
5. Observations, not defects:
   - Music keeps playing in the menu.
   - Use at a wall plays the "oof" sound.
   - The gametic counter advances while paused, but the world does not. That is vanilla.
6. No new defects for coder_input_audio, coder_render_timing or coder.

## Assumptions
- Required controls are Doom's default keys.
- Correct momentum means vanilla thrust and friction, with a stop roughly 40–45 tics after release.
- A turn counts as stopped when the angle stops changing within 3 tics of release.
- Cheat codes are a valid way to test typed-letter input and weapon coverage.
- All of these criteria are agent-proposed, not student-approved.
- Headless audio peaks count only as evidence of non-silence.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only. No source, test, build or loop edits, no artifacts/browser captures, and no result.json.

## Next action
- **Human:** run A1 and H1 (see item 2).
- **Student:** decide the scope items in item 3.
- **If the dist hashes change:** rerun the probes with `node <probe>.mjs <OUT> <PORT>`: review_state, coast_pertic, pause_check, visibility_release, blur_open and cheats_weapons.
