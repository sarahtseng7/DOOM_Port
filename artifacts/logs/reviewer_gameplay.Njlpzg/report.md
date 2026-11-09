FINDINGS

reviewer_gameplay Njlpzg, 2026-11-04 ~17:09–17:25 UTC. I found no defect in movement, playability or the audio pipeline, so nothing is assigned to a coder.
- I re-ran 8 inherited probes against the current build myself. All passed; I did not rely on the earlier results.
- I added one new probe, door_combined.mjs, 8 PASS / 0 FAIL. It covers a manual door that blocks while closed, makes a sound on Use, and lets the player through once open. It also covers holding two keys at once: forward plus strafe moves diagonally, and forward plus turn moves in an arc.

The result stays FINDINGS only because A1 (audio by ear), H1 (a real hidden tab) and other browsers still need a human.

## Source identity (source-identity.txt, dist-hashes.txt)
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 441e441ad5dfcd52…. This is the same hash as reviewer_gameplay xPaDae, reviewer_site Ox5ZuG, the tester and all three coder reports.
- The dist/ hashes match xPaDae exactly: doom.wasm 7afb94fa…, doom.js 0090630e…, doom.data 1d7d43be…, index.html 43a15c63…, plus the 3 helper JS files.
- `find platform web Makefile -newer dist/doom.wasm` is empty. I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, the READMEs, my role prompt and all 6 reports in artifacts/reports/.
- reviewer_site Ox5ZuG is PASS for startup on this hash, so I did not repeat the startup review.
- Server:
  - Port 8207 was free before I started (lsof printed nothing).
  - I ran `python3 -m http.server 8207 --bind 127.0.0.1 --directory dist`, PID in server.pid.
  - server.log has 71 requests, all 200.
  - At the end I killed only that PID. curl then returned 000 (server-stopped.txt).
- Probes:
  - The 8 probes were copied unchanged from reviewer_gameplay.xPaDae. probes-provenance.txt holds their sha256 hashes, which are byte-identical to xPaDae's.
  - I ran them serially with `node <probe>.mjs <OUT> 8207` in headless Chromium.
  - All exited 0 (probe-rcs.txt).

## Results: inherited probes (re-run, all pass)
| Probe | Result |
| --- | --- |
| review_state | 32 PASS / 0 FAIL / 2 NOTE. The NOTEs are the same as before: Use at a wall plays "oof", and music keeps playing in the menu, as in vanilla. |
| coast_pertic | 0 multi-tic gaps. Stopped 44 tics after release, peak 7 u/tic, which matches vanilla friction. |
| pause_check | 6 PASS: pause and the menu freeze the world, and nothing coasts or sticks after the menu closes. |
| visibility_release / blur_open | pass=true / pass=true. After blur, movement coasts 44 tics and then stops (0 movement in the final 1 s), and input still works afterwards. |
| cheats_weapons | 12 PASS: every weapon fires with SFX and uses ammo; IDCLEV changes the level and restarts music. |
| damage_death | 10 PASS: damage, death, no movement while dead, Use respawns. |
| exit_pickup | 8 PASS: health bonus 100→101 with SFX, the E1M1 exit switch leads to the intermission and then E1M2, and the player moves in E1M2. |

Details from review_state:
- Movement: forward moves along the facing direction and backward moves opposite it. Coasting then stopping takes 47 tics.
- Turning: turns about 40° per 15 tics while held, with 0° of drift after release.
- Strafing: `,`, `.` and Alt+arrows all strafe.
- Running: Shift raises speed from 1.94 to 5.91 u/tic.
- Fire: firing uses ammo and plays SFX. Held fire repeats, then stops after release.
- Focus: blur stops held turning and held forward movement.
- Automap toggles without moving the player.
- Tic rate is 35.0 tics/s.
- Audio counters: SFX requested 20 = played 20, with sfxBad 0, musicErrors 0 and maxPeak 0.44. The AudioContext is running after the first gesture.

## Results: new probe door_combined.mjs (door_combined.stdout.log, door-combined.json, wad-doors.json, screens/ep-dr-*.png)
| Check | Result |
| --- | --- |
| diagonal-forward-plus-strafe-right | Up+`.` held 300 ms moved 82 units forward and 87 right, with 0° of turn. |
| arc-forward-plus-turn-left | Up+Left held 400 ms turned 43.95° and moved 113.8 units. |
| reached-door-front | Clipping on at (1484,−2488), facing 358.6°. ep-dr-01 (viewed) shows the closed door. |
| closed-door-blocks | Holding forward stops at x=1519, which is the door line at x=1536 minus the player's 16-unit radius. |
| door-use-sfx | Use played 3 SFX (see the note below). |
| open-door-passable | After the door opened, walking forward reached x=1719 in sector 7, so the player went through. ep-dr-03 (viewed) shows the open door and the room beyond in correct colours. |
| no-page-errors | 0 |

- The door was found by a read-only parse of assets/doom1.wad (wad_doors.py → wad-doors.json): linedef 151, special 1 (DR door), front side to the west, back sector 4 with floor and ceiling both at 0, i.e. closed.
- Noclip (IDSPISPOPD) was used only to travel to the door. Clipping was back on, as the "NO CLIPPING MODE OFF" message in ep-dr-01 shows, before the blocking, Use and pass-through checks.
- Probe error, kept as evidence: the first run failed with a SyntaxError (duplicate `s0`) because I copied too many helper lines from exit_pickup.mjs. I deleted those lines and re-ran. This was not a product fault.
- Note: the 3 SFX from one Use is most likely the door sound plus the sight sounds of the two zombiemen who become visible (ep-dr-03). I did not attribute each sound, because the counter reports totals only. Health stayed at 100.

## Unresolved (owner)
1. UNVERIFIED, human: A1, whether SFX and music sound correct by ear. The counters and peaks prove only that playback is non-silent.
2. UNVERIFIED, human: H1, a real hidden or minimized tab. Playwright only overrides visibility and blur.
3. UNVERIFIED, tester/human: Firefox, Safari, HiDPI, the episode end, and a full walked route with no noclip.
4. Tester (carried over, not re-checked this run):
   - Switch E2b to `_cap_player_angle`.
   - Automate G3c with the route in exit_pickup.mjs.
   - Fix the faults.sh expectations.
   - Run verify.sh in the background on 441e441a.
   - The door check in door_combined.mjs could also be adopted as a protected check.
5. Student decisions (carried over): music is an oscillator synth, not OPL-faithful; WASD and mouse are not mapped; volume is not persisted.
6. No new defects for coder_input_audio, coder_render_timing or coder.

## Assumptions
- The required controls are Doom's default keys.
- Correct momentum means a vanilla friction stop about 40–47 tics after release.
- Engine state hooks (`_cap_*`) outrank pixel diffs.
- I did not re-run e2b_repeat this run. It is a tester-owned stress check that passed 10/10 in xPaDae on this same hash.
- All criteria are agent-proposed, not student-approved. I tested only headless Chromium on one macOS machine.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only, including probes, logs, JSON and screens. I made no source, test, build, loop or artifacts/browser edits, wrote no result.json, and did not touch agent.log.

## Next action
- **Human:** run A1 and H1 (protocol in tests/README.md).
- **Tester:** take the engine-state checks for E2b, G3c and the door, then run verify.sh.
- **If the dist hashes change:** re-run `node <probe>.mjs <OUT> <PORT>` for the 9 probes in this directory.
