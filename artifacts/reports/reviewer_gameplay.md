FINDINGS

reviewer_gameplay oxtWFN, 2026-11-04 ~19:12–19:19 UTC. On this source hash I re-ran the gameplay probes myself and found no defect in movement, playability or the audio pipeline. Nothing is assigned to a coder. The result is FINDINGS only because A1 (audio by ear), H1 (a real hidden tab) and other browsers cannot be established by this role.

## Source identity (source-identity.txt, dist-hashes.txt)
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 441e441ad5dfcd52…9b5d9c. This matches aln28c, reviewer_site kSPGNA, tester FciNnh and all coder reports.
- The dist/ hashes are byte-identical to reviewer_gameplay.aln28c/dist-hashes.txt (doom.wasm 7afb94fa…, doom.js 0090630e…, doom.data 1d7d43be…, index.html 43a15c63…, plus the 3 helper JS files).
- `find platform web Makefile -newer dist/doom.wasm` is empty (0). I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, the READMEs, my role prompt and all 6 reports in artifacts/reports/. reviewer_site kSPGNA is PASS for startup on this hash, so I did not repeat the startup review.
- Copied the 9 probes and wad_doors.py from reviewer_gameplay.aln28c without changes. `shasum -c` against aln28c is OK for all 10 files (probes-provenance.txt).
- Server: port 8212 was free (lsof showed no listener). I started `python3 -m http.server 8212 --bind 127.0.0.1 --directory dist` (PID in server.pid). server.log has 71 requests, all 200. I killed only that PID, and curl then returned 000 (server-stopped.txt).
- Ran `node <probe>.mjs <OUT> 8212` one at a time in headless Chromium. All 9 exited 0 (probe-rcs.txt), with 0 FAIL lines across the stdout logs.
- Looked at these screenshots myself:
  - screens/03-fire-post.png: in-game view, pistol, ammo 49 after one shot, HUD correct.
  - screens/04-menu.png: the main menu draws over the paused game.
  - screens/ep-04-intermission.png: "Hangar Finished" intermission with the tally counting.

## Results (this run, own execution)
| Probe | Result |
| --- | --- |
| review_state | 32 PASS / 0 FAIL / 2 NOTE. The NOTEs are unchanged and match vanilla: Use at a wall plays "oof", and music keeps playing in the menu. |
| coast_pertic | 0 multi-tic gaps. Stopped 42 tics after release, peak 8 u/tic. |
| pause_check | 6 PASS |
| visibility_release | pass=true: no turning in the 35-tic hidden window, and input works afterwards. |
| blur_open | pass=true: blur coasts 70 u and stops 44 tics later, the same as a plain keyup; 0 movement in the final 1 s; input works afterwards (149 u). |
| cheats_weapons | 12 PASS |
| damage_death | 10 PASS |
| exit_pickup | 8 PASS: bonus 100→101 with SFX, exit switch → intermission → E1M2, and the player moves in E1M2. |
| door_combined | 8 PASS: diagonal movement, an arc, a closed door that blocks, door SFX, and an open door the player can pass. |

Key numbers from review_state:
- Tic rate is 35.0 tics/s. The audio clock advances 2.000 s per 2.004 s of wall time.
- Forward walking coasts 66 units and stops 43 tics after release, with decaying steps 6→2. Run is 6.6 u/tic against 2.46 u/tic walking.
- After release, ArrowRight turns 3.5° more (one tic of latency) and ArrowLeft 0°. Strafe keys (`,` `.` and Alt+arrows) move perpendicular to facing without turning.
- Fire uses ammo and plays SFX. Held fire repeats, then stops after release.
- Blur stops held turning and held forward movement.
- Pause and menu freeze the world, and no key is stuck after the menu closes.
- Audio counters: sfxRequested 20 = sfxPlayed 20, sfxBad 0, musicErrors 0, maxPeak 0.50. The AudioContext goes suspended → running after the first gesture. Music changes per level and restarts on idclev.

## Unresolved (owner)
1. UNVERIFIED, human: A1, whether SFX and music sound correct by ear. Counters and peaks prove only that playback happens and is non-silent.
2. UNVERIFIED, human: H1, a real hidden or minimized tab. Playwright only emulates visibility and blur.
3. UNVERIFIED, tester/human: Firefox, Safari, HiDPI, the episode end, and a full walked route with no noclip or idclev.
4. Tester (carried over, not re-checked): move E2b, G3c and the door check onto the engine-state hooks.
5. Student decisions (carried over): music is an oscillator synth, not OPL-faithful; WASD and mouse are not mapped; volume is not persisted.
6. No new defects for coder_input_audio, coder_render_timing or coder.

## Assumptions
- Doom's default keyboard controls are the required controls.
- Correct momentum means a vanilla friction stop about 40–47 tics after release, not an instant stop.
- Engine-state hooks (`_cap_*`) outrank pixel diffs.
- The probes were inherited from earlier reviewer runs. I verified them by hash, not by re-auditing their logic, so a logic flaw in a probe would carry into this run. Because this is the same hash as aln28c, the main new value of this run is that the results reproduce: each figure is within a few tics or units of aln28c.
- I used headless Chromium only, on one macOS machine. All criteria are agent-proposed, not student-approved.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only. I made no source, test, build or loop edits, wrote no result.json, and did not touch agent.log.

## Next action
- **Human:** run A1 and H1 (protocol in tests/README.md).
- **Tester:** adopt the engine-state checks.
- **If the source or dist hashes change:** re-run the 9 probes here with `node <probe>.mjs <OUT> <PORT>`.
