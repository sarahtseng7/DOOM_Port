FINDINGS

Level entry and movement through real corridors work on the current build. This is FINDINGS rather than PASS because door use, pickups, damage and audio correctness were not established. I found no new defect and changed no source.

## Source identity
HEAD e500c44 plus uncommitted changes. `make -n` reports nothing to do. dist/doom.wasm sha256 prefix 6c93cbf125bd366a, the same build as the prior gameplay review. I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
All six files in artifacts/reports/. The prior gameplay report already measured stop-after-release, turn, strafe, run and blur release with the `_cap_player_*` exports. Those were not repeated. I targeted the gaps it listed: door use and traversal.

## Work and evidence (this directory)
`door.mjs` is my own script and is not a protected check. It uses headless Chromium via Playwright against a throwaway local server that exited with the script. Outputs: door-results.json, door-console.txt, door-*.png and door2-*.png.
- **Start:** E1M1 (level 101), health 100, position (1056,-3616), angle 90 degrees, 50 ammo (HUD screenshot).
- **Forward walk to the north wall:** the player advanced from y=-3616 to y=-2897 and stopped at a wall (door-39.png shows a flat wall). Space taps there did nothing, which is correct for a plain wall.
- **Traversal:** after turning right and walking, the player went about 440 units through the corridor. It slid along walls, with y still changing while x was blocked. After a left turn of about 147 degrees it walked about 650 units back to (720,-3346). Health stayed 100 and the level id stayed 101.
- **Console:** door-console.txt has no error entries. It has the engine startup lines only.

## Unresolved (owner)
1. UNVERIFIED, tester: door use. I tapped Space while walking but never confirmed standing at a door or a sector change. There is no exported door or sector oracle. Needs a position-based scenario, or a bridge export from coder.
2. UNVERIFIED, tester: pickups, damage and death, a real hidden tab (headless Chromium cannot background a tab), Firefox and Safari.
3. UNVERIFIED, student/tester: audio correctness. No human has listened. The prior reports record non-silent output only (peak about 0.4, notes scheduled). I did not re-test audio this run.
4. Known limits from the prior reports, unchanged: music is an oscillator synth rather than GENMIDI/OPL. WASD and mouse are not mapped. The first SFX before a gesture is dropped.
5. For the tester: I6 should move to a position-based check (see the prior gameplay and tester reports).

## Assumptions
- Doom default keys (arrows, Ctrl, Space, Shift, Alt) are the control requirement.
- The position exports are trusted as engine state.
- Manual interventions: none. Usage: not available.
