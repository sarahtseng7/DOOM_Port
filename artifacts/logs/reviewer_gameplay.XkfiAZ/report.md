FINDINGS

reviewer_gameplay XkfiAZ, 2026-11-04. I found no defect in movement, playability or the audio pipeline, so there is nothing to assign to a coder.
- All seven inherited probes pass on the current build.
- I investigated the single E2b (hidden-releases-keys) failure from coder.oWCDg7. It was a false failure of the pixel-diff check: the engine angle never changed while hidden (10/10 trials). Owner: tester.

The result stays FINDINGS because audio by ear (A1), a real hidden tab (H1) and normal level exit (G3c) are still UNVERIFIED.

## Source identity (source-identity.txt, dist-hashes.txt)
- HEAD e500c44 plus uncommitted changes. The diff hash prefix is now 441e441ad5dfcd52 (it was 92e25d72… in K8HORm).
- The only product change is the static `<title>` in web/index.html (coder.oWCDg7), so dist/index.html is now 43a15c63….
- doom.wasm 7afb94fa1ec64b5c, doom.js 0090630eeaf16a87 and doom.data 1d7d43be501e67d9 are unchanged. The helper JS files also have the same hashes as before.
- Only web/ is newer than dist/doom.wasm, and it is already copied into dist/. I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, the READMEs, the role prompt and all six reports in artifacts/reports/, plus coder.oWCDg7's E2b evidence. reviewer_site lFGon0 is PASS for startup on this build, so I did not repeat that review.
- Started `python3 -m http.server 8199 --bind 127.0.0.1 --directory dist` (PID in server.pid). server.log has 64 requests, all 200. At the end I killed only that PID, and curl then returned 000 (server-stopped.txt).
- Copied the seven probes from reviewer_gameplay.K8HORm. probes-provenance.txt confirms they are byte-identical. I ran each as `node <probe>.mjs <OUT_DIR> 8199`, and all exited 0 (probe-rcs.txt).
- New: e2b_repeat.mjs and pixel_diff.mjs.

## Results (all files in this directory)
### Inherited probes: all pass
| Probe | Result |
| --- | --- |
| review_state | 32 PASS / 0 FAIL / 2 NOTE (the same NOTEs as before: Use at a wall plays "oof", music keeps playing in the menu). 22 SFX requested = 22 played, sfxBad 0, maxPeak 0.495 |
| coast_pertic | pass: 0 multi-tic gaps, stopped 42 tics after release, peak 8 u/tic (vanilla momentum) |
| pause_check | 6 PASS |
| visibility_release | pass=true |
| blur_open | pass=true |
| cheats_weapons | 12 PASS |
| damage_death | 10 PASS: damage, death, input ignored while dead, respawn, music continues |

### E2b one-off failure: false failure (e2b_repeat.*, e2b-run1-pixel-diff.json)
- **The failure:** in coder.oWCDg7 run 1, E2b failed with later-diff=0.0570 against a threshold of 0.02. Run 2 passed.
- **Screenshots:** I viewed coder.oWCDg7/playtest/screens/049-settle.png and 050-edge-after.png.
  - The wall edges, the weapon and the HUD are identical, so the view did not rotate.
  - What changed is the brightness of the light panel and the walls to its right. This is a vanilla E1M1 sector light effect.
- **Pixel diff:**
  - 6.1% of the view area changed, all inside x=265–789.
  - The left wall (x<265) has 0 changed pixels. A turn would shift every column, so this is not a rotation.
- **Engine check:** e2b_repeat.mjs repeats E2b's exact sequence 10 times (override only `document.hidden`, fire visibilitychange with ArrowLeft held, send keyup only after restoring).
  - It reads `_cap_player_angle` instead of pixels.
  - Result: 10/10 pass. The view turned while the key was held, then the angle change was 0 over 52–53 tics while hidden. CapInput.held() was 0 after each hide, and there were 0 page errors.
- **Conclusion:** web/input_audio.js releases keys correctly on visibilitychange. E2b's frame-diff check can be fooled by animated sector lighting.

## Unresolved (owner)
1. Tester: E2b (and the E2a/I-series checks that use the same pixel diff) is flaky because of animated lighting.
   - Suggested fix: judge by `_cap_player_angle` / CapInput.held(), or mask the frame to columns that did not change.
   - The tester should also rerun the full `tests/verify.sh` on source hash 441e441a, which has not been done yet.
2. UNVERIFIED, human: A1, SFX and music correctness by ear. The counters and peaks only show non-silent playback.
3. UNVERIFIED, human: H1, a real hidden or minimized tab. Playwright only simulates this by overriding `document.hidden`. Protocol: hold Right, press Cmd+T, wait 2 s, return, and confirm the view is not spinning.
4. UNVERIFIED, coder then tester: G3c, normal level exit through the exit switch (no exit hook yet).
5. UNVERIFIED, tester/human: item pickups, Firefox, Safari and HiDPI.
6. Student decisions: the music is an oscillator synth, not OPL-faithful; WASD and mouse are not mapped; volume is not persisted; sub-tic taps are not latched.
7. No new defects for coder_input_audio, coder_render_timing or coder.

## Assumptions
- The required controls are Doom's default keys. Correct momentum means vanilla friction, with a stop about 40–45 tics after release.
- Engine state (angle, held keys) outranks screenshot diffs when the two disagree. Vanilla behaviour from the supplied engine source is the reference.
- That 050's brightness change is sector lighting is inferred from the images and the column distribution of changed pixels. I did not trace it to a specific sector special.
- All criteria are agent-proposed, not student-approved. Headless audio peaks count only as evidence of non-silence.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only. No source, test, build or loop edits, no artifacts/browser captures, and no result.json.

## Next action
- **Tester:** harden E2b to use engine state, then run `tests/verify.sh` on 441e441a.
- **Human:** run A1 and H1.
- **If the dist hashes change:** rerun the eight probes in this directory with `node <probe>.mjs <OUT> <PORT>`.
