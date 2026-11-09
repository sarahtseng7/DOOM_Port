FINDINGS

Level entry, movement and turning still work on the unchanged build. I found no new defect and changed no source. This is FINDINGS rather than PASS because door use, pickups, damage, a real hidden tab and audio correctness are still unverified.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix 8a0736f5784ff838. dist/doom.wasm sha256 prefix 6c93cbf125bd366a. `make -n` reports nothing to do, and I did not rebuild. These are the same hashes as the prior gameplay, tester and coder_input_audio reports. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
All six files in artifacts/reports/. I targeted the open door-use gap. I did not repeat the movement measurements or the audio check from the earlier reports.

## Work and evidence (this directory)
`door3.mjs` is my own script and is not a protected check. It uses headless Chromium via Playwright against a throwaway local server that exited with the script. Outputs: door3-results.json (position log and console), use-after.png, final.png.
- **Start:** E1M1 (level 101), health 100, position (1056,-3616), angle 90 degrees.
- **Walk north 4 s:** the player stopped at (1055,-2897), the same wall as the prior review.
- **Space press at that wall, then 2.5 s forward:** the position did not change, so that wall is not a usable door. The screenshot is consistent with this.
- **Four left turns of about 700 ms, each followed by Space and 1.2 s forward:** the player moved to (720,-2994), (670,-3280), (921,-3513) and (1167,-3334). The angle changed each time (169, -115, -40, 36 degrees). Health stayed 100 and the level id stayed 101. So movement and turning work, but I did not find a door.
- **Console:** I did not review the console entries in door3-results.json. The prior review's console file showed no errors.

## Unresolved (owner)
1. UNVERIFIED, tester/coder: door use. No export identifies a door or sector, so I cannot confirm a door opened. A position-based scenario toward a known door, or a sector/line export from coder, is needed.
2. UNVERIFIED, tester: pickups, damage and death, a real hidden tab (headless Chromium cannot background a tab), Firefox and Safari.
3. UNVERIFIED, student/tester: audio correctness. No human has listened. I did not re-test audio this run, so the non-silent-output results come only from the coder_input_audio report.
4. Known limits from the prior reports, unchanged: music is an oscillator synth, not GENMIDI/OPL. WASD and mouse are not mapped. The first SFX before a gesture is dropped. Tester's I6 pixel oracle is flaky and should become position-based (owner: tester).

## Assumptions
- Doom default keys (arrows, Ctrl, Space, Shift, Alt) are the control requirement.
- The position exports are trusted as engine state.
- Manual interventions: none. Usage: not available.

## Next action
Tester adds a position-based door scenario, or coder adds a sector/line export. A human listens to SFX and music.
