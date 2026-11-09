FINDINGS

reviewer_gameplay K8HORm, 2026-11-04. I found no defect in movement, playability or the audio pipeline, so there is nothing to assign to a coder.
- All six inherited probes pass again on the unchanged binary.
- A new damage/death/respawn probe passes 10/10 on its third run. Runs 1 and 2 failed because the probe was wrong, not the game; both runs are preserved and explained below.

The result stays FINDINGS because audio by ear (A1), a real hidden tab (H1) and normal level exit (G3c) are still UNVERIFIED.

## Source identity (source-identity.txt, dist-hashes.txt)
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 92e25d7245a7dafd…, the same as every report in artifacts/reports/.
- dist sha256 prefixes are unchanged: doom.wasm 7afb94fa1ec64b5c, doom.js 0090630eeaf16a87, doom.data 1d7d43be501e67d9, index.html 5905489e041214ce.
- `find platform web Makefile -newer dist/doom.wasm` was empty, so I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, the three READMEs, loop/prompts/REVIEWER_GAMEPLAY.md and all six reports in artifacts/reports/. No report names an open defect. reviewer_site is PASS for startup, so I did not repeat that review.
- Started `python3 -m http.server 8199 --bind 127.0.0.1 --directory dist` (PID in server.pid). server.log shows 71 requests, all 200. At the end I killed only that PID, and curl then returned 000 (server-stopped.txt).
- Copied six probes unchanged from reviewer_gameplay.WxVbWe and ran `node <probe>.mjs <OUT_DIR> 8199`. All exited 0.
- New: damage_death.mjs (headless Chromium, read-only bridge v5 hooks plus CapAudio.stats()).

## Results (all files in this directory)
### Inherited probes: all pass
| Probe | Result | Key evidence |
| --- | --- | --- |
| review_state | 32 PASS / 0 FAIL / 2 NOTE | Same results as WxVbWe: forward/back, coast and stop, turn stops at release, strafe, run, fire, menu, pause, blur, audio counters |
| coast_pertic | pass | 0 multi-tic gaps; stopped 42 tics after release; peak 8 u/tic |
| pause_check | 6 PASS | Pause and menu freeze the world; unpause moves 96 u; no stuck key |
| visibility_release | pass=true | Turn while held; no turn during the hidden window; input works afterwards |
| blur_open | pass=true | Blur coast 78 u, last move 42 tics after release, 0 in the final 1 s (control: 70 u / 44 tics) |
| cheats_weapons | 12 PASS | IDKFA, shotgun/chaingun/rocket/plasma SFX and ammo, IDDQD, IDCLEV13 with music restart, movement in E1M3 |

The two NOTEs repeat earlier observations and are not defects: Use at a wall plays the "oof" sound, and music keeps playing in the menu.

### damage_death (new): 10 PASS on run 3 (damage_death.stdout.log, damage-death.json, screens/dd-*.png)
- **Setup:** E1M1 on the default skill, then IDKFA and the rocket launcher. The player backed into the south wall, turned to face it (257°) and fired point-blank.
- **Damage:** HP went 100→36 and armour 200→136, so blue armour absorbed half. Each hit played 3 SFX (launch, explosion, pain). dd-run1-01-hurt.png shows the red pain tint and the grimacing face.
- **Death:** the second rocket took HP to 0. dd-02-dead.png shows a floor-level view, the bloodied face and 0% health.
- **Input while dead:** Up and Left gave 0 movement and 0 turn, which is correct.
- **Respawn:** Space (Use) restarted E1M1 at the spawn point (1056,-3616), facing 90°, with HP 100. dd-03-respawned.png shows a pistol start with 50 bullets and 0% armour, which is vanilla.
- **After respawn:** music kept playing (musicPlaying=true, musicErrors 0) and forward moved 148 u.
- **Audio and errors:** sfxRequested 9 = sfxPlayed 9, sfxBad 0, and 0 page errors.

### Why runs 1 and 2 failed
- **Run 1, 5/6** (damage_death.run1.*): the probe fired from a fixed spot. The first rocket's knockback pushed the player about 165 u, out of splash range, so later shots missed and HP stayed 36. Fix: walk back into the wall before each shot.
- **Run 2, 9/10** (damage_death.run2.*): I expected the music to restart on respawn. Vanilla `S_ChangeMusic` (third_party/doomgeneric/s_sound.c:625) returns early when the same track is already playing. Not restarting is correct, so run 3 checks that music keeps playing instead.

## Unresolved (owner)
1. UNVERIFIED, human: SFX and music correctness by ear (A1). The counters and peaks only show non-silent playback without errors.
2. UNVERIFIED, human: a real hidden or minimized tab (H1). Playwright cannot hide a tab (see WxVbWe). Manual step: hold Right, press Cmd+T, wait 2 s, return, and confirm the view is not spinning.
3. UNVERIFIED, coder then tester: normal level exit through the exit switch (G3c). There is still no exit hook; IDCLEV is only a proxy.
4. UNVERIFIED, tester/human: item pickups (no probe yet), Firefox, Safari and HiDPI.
5. Student decisions (coder_input_audio if required): the music is an oscillator synth, not OPL-faithful; WASD and mouse are not mapped; volume is not persisted; sub-tic taps are not latched.
6. No new defects for coder_input_audio, coder_render_timing or coder.

## Assumptions
- The required controls are Doom's default keys. Correct momentum means vanilla friction, with a stop about 40–45 tics after release.
- Self-inflicted rocket splash is a valid stand-in for taking damage. It exercises P_DamageMobj, armour, pain and death, but not monster attacks.
- Vanilla behaviour, read from the supplied engine source, is the reference wherever my expectation differed from what I observed.
- All criteria are agent-proposed, not student-approved. Headless audio peaks count only as evidence of non-silence.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only. No source, test, build or loop edits, no artifacts/browser captures, and no result.json.

## Next action
- **Human:** run A1 and H1.
- **Coder/tester:** decide whether to add the G3c exit hook; the tester could adopt damage_death.mjs as a regression check.
- **If the dist hashes change:** rerun all seven probes with `node <probe>.mjs <OUT> <PORT>`.
