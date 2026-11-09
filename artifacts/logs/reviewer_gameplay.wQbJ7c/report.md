FINDINGS

Movement and turning are observed working on the current dist/, now measured with the engine's player-position exports instead of pixel diffs. FINDINGS rather than PASS because audio was never listened to, and door use, pickups, damage, a real hidden tab and non-Chromium browsers were not exercised. No new defect was found in my scope. I changed no source.

## Source identity
HEAD e500c44 plus uncommitted changes. `make -n` reports nothing to do. dist/doom.wasm sha256 prefix 6c93cbf125bd366a (rebuilt since the earlier gameplay review, which used a4c6846627bdcb21). I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
artifacts/reports/ (all six files). The earlier gameplay review had to use pixel diffs. The tester's I6 (backward-returns) failure is a flaky pixel-diff oracle, and bridge v4 has since added `_cap_player_*` exports. I used those exports here.

## Work and evidence (this directory)
`pos.mjs` and `audio.mjs` are my own scripts and are not protected checks. They use headless Chromium via Playwright against a throwaway local server that I stopped. Outputs: pos-results.json, audio-results.json, pos-console.txt, audio-console.txt, final.png, final2.png, fire.png. The runs are in agent.log.
- **Start:** E1M1 (level id 101), health 100, position (1056,-3616).
- **Forward (1 s):** moved 213 units, then coasted 114 more and stopped about 1.2 s after release. Drift over the last second was 0.
- **Backward (0.6 s):** moved 105 units, coasted 78, and stopped about 1.0 s after release. This moves the player in the opposite direction, which is the position-based answer to the tester's flaky I6 pixel check (the pixel ratio was 0.79 against a 0.7 limit).
- **Turn right/left (0.4 s):** the angle changed -40.4 and +40.4 degrees, symmetric. There was no coast, and the angle was stable 0.1 s after release.
- **Strafe (Alt+Left):** moved 73 units and stopped about 1.0 s after release, with no turn.
- **Walk vs run (0.4 s, open space):** walk moved 56 units, run (Shift) moved 112, about 2x. Both stopped within 0.8 s with 0 drift.
- **Held key then blur event:** the player moved 57 units while held, coasted another 60 after the blur, then had 0 drift for 0.8 s. The held ArrowUp did not keep driving the player.
- **Audio (tapped through AudioNode):** after the first gesture and level start there were 18 buffer sources, 58 oscillators and an analyser peak of 0.416, so output is non-silent. After two Ctrl presses the sources rose from 18 to 21 and oscillators from 58 to 65.
- **Console:** 0 error entries in either run; the log holds only the engine startup output.

## Unresolved (owner)
1. UNVERIFIED, student/tester: no human has listened to the audio. Node counts and a peak only show non-silent output, not correct sound or music. This could not be established here.
2. UNVERIFIED, tester: door use (Space was sent but I did not stand at a door), pickups, damage and death, a real hidden tab (I used a synthetic blur event, not a backgrounded page), and Firefox and Safari.
3. Known limit, student decision (reported by coder_input_audio): the music is an oscillator synth rather than GENMIDI/OPL. WASD and mouse are not mapped, and the first SFX before a gesture is dropped.
4. For the tester: a position-based I6 using `_cap_player_x/y` would replace the flaky pixel ratio. This evidence supports it, since backward movement was 105 units in the opposite direction.

## Assumptions
- Doom default keys (arrows, Ctrl, Space, Shift, Alt) are the control requirement.
- "Stopped" means identical x, y and angle on consecutive 100 ms samples. Normal Doom momentum is allowed, and I used 2 s as the limit.
- The position exports are trusted as engine state.
- Manual interventions: none. Usage: not available.
