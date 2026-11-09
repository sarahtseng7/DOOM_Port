FINDINGS

reviewer_gameplay aln28c, 2026-11-04 ~18:12–18:19 UTC. I found no defect in movement, playability or the audio pipeline. Nothing is assigned to a coder. The result is FINDINGS only because A1 (audio by ear), H1 (a real hidden tab) and other browsers still need a human or the tester.

## Source identity (source-identity.txt, dist-hashes.txt)
- HEAD e500c44 plus uncommitted changes. The diff hash, excluding artifacts/, is 441e441ad5dfcd52…, the same as Njlpzg, reviewer_site RUjcrA, the tester and all coder reports.
- The dist/ hashes match Njlpzg exactly: doom.wasm 7afb94fa…, doom.js 0090630e…, doom.data 1d7d43be…, index.html 43a15c63…, plus the 3 helper JS files.
- `find platform web Makefile -newer dist/doom.wasm` is empty. I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, the READMEs, my role prompt and all 6 reports in artifacts/reports/.
- reviewer_site RUjcrA is PASS for startup on this hash, so I did not repeat the startup review.
- Copied the 9 probes and wad_doors.py from reviewer_gameplay.Njlpzg without changes. Their sha256 hashes in probes-provenance.txt match Njlpzg's.
- Server:
  - Port 8211 was free before I started.
  - I ran `python3 -m http.server 8211 --bind 127.0.0.1 --directory dist`, PID in server.pid.
  - server.log has 71 requests, all 200.
  - I killed only that PID. curl then returned 000 (server-stopped.txt).
- Ran the probes one at a time with `node <probe>.mjs <OUT> 8211` in headless Chromium. All 9 exited 0 (probe-rcs.txt).
- Viewed screens/ep-dr-03-door-open.png and screens/ep-05-e1m2.png:
  - The door opens onto the room beyond.
  - E1M2 renders with correct palette and HUD, at 101% health after the bonus pickup.

## Results (this run, own execution)
| Probe | Result |
| --- | --- |
| review_state | 32 PASS / 0 FAIL / 2 NOTE. The NOTEs are unchanged and match vanilla: Use at a wall plays "oof", and music keeps playing in the menu. |
| coast_pertic | 0 multi-tic gaps. Stopped 44 tics after release, peak 7 u/tic. |
| pause_check | 6 PASS |
| visibility_release / blur_open | pass=true / 0 movement in the final 1 s, and input works afterwards. |
| cheats_weapons | 12 PASS |
| damage_death | 10 PASS |
| exit_pickup | 8 PASS: bonus 100→101 with SFX, exit switch → intermission → E1M2, and the player moves in E1M2. |
| door_combined | 8 PASS: diagonal movement, an arc, a closed door that blocks, a door SFX, and an open door the player can pass. |

Key numbers from review_state:
- Tic rate is 35.0 tics/s.
- Forward movement coasts 65 units and stops 47 tics after release, with decaying steps 6→2.
- Turning drifts 0° after release, in both directions.
- Firing uses ammo and plays SFX. Held fire repeats, then stops after release.
- Blur stops held turning and held forward movement. Forward coasts 50 units, then 0 in the last 800 ms.
- Menu cursor SFX play on the title screen and in game.
- Audio counters: sfxRequested 19 = sfxPlayed 19, with sfxBad 0, musicStarted 3/3, musicErrors 0 and maxPeak 0.43. The AudioContext is running.

## Unresolved (owner)
1. UNVERIFIED, human: A1, whether SFX and music sound correct by ear. The counters and peaks prove only that playback is non-silent.
2. UNVERIFIED, human: H1, a real hidden or minimized tab. Playwright only overrides visibility and blur.
3. UNVERIFIED, tester/human: Firefox, Safari, HiDPI, the episode end, and a full walked route with no noclip.
4. Tester (carried over, not re-checked):
   - Move E2b, G3c and the door check onto the engine-state hooks.
   - The faults.sh expectations from earlier reports.
5. Student decisions (carried over): music is an oscillator synth, not OPL-faithful; WASD and mouse are not mapped; volume is not persisted.
6. No new defects for coder_input_audio, coder_render_timing or coder.

## Assumptions
- Doom's default keys are the required controls.
- Correct momentum means a vanilla friction stop about 40–47 tics after release.
- Engine state hooks (`_cap_*`) outrank pixel diffs.
- The probes come from earlier reviewer runs. I checked them against Njlpzg by hash rather than re-auditing their logic. A probe with a logic flaw would carry that flaw into this run.
- I did not re-run e2b_repeat, which belongs to the tester.
- I used headless Chromium only, on one macOS machine. All criteria are agent-proposed, not student-approved.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only. I made no source, test, build or loop edits, wrote no result.json, and did not touch agent.log.

## Next action
- **Human:** run A1 and H1 (protocol in tests/README.md).
- **Tester:** adopt the engine-state checks.
- **If the dist hashes change:** re-run `node <probe>.mjs <OUT> <PORT>` for the 9 probes here.
