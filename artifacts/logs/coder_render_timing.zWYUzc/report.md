FINDINGS

No rendering or timing defect found; no source edits. FINDINGS rather than PASS because `tests/verify.sh` was not run by me, and a real hidden tab, physical HiDPI, Safari and Firefox remain unverified.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 2c74d74fd2c699f9... and dist/doom.wasm sha256 7afb94fa1ec64b5c... (both unchanged since the previous coder_render_timing report). `make -n`: nothing to do. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
All six files in artifacts/reports/. The only item addressed to this role is reviewer_site finding 3: the first screenshot showed mid-gameplay state, which was unexplained.

## Work and evidence (this dir)
startup.mjs (my own script, not a protected check; headless Chromium, throwaway local server) loads dist/ and screenshots at 0, 1, 3, 6 and 10 s after the first presented frame.
- startup-0s.png (viewed): the DOOM title screen (TITLEPIC), correct colours, opaque, letterboxed at 1280x720. This is the first frame.
- Tic counts: 1, 36, 106, 172, 316 at 0/1/3/6/10 s. cap_player_x is 0 until about 6 s, then changes, so a player exists only after the title phase.
- startup-10s.png (viewed): E1M1 gameplay with HUD, "YOU GOT THE SHOTGUN!", ammo 46, correct colours.
- Resolution of reviewer_site finding 3: the port starts at the title screen, then the engine's normal attract demo plays. The mid-game state seen earlier was that demo, not a startup fault. I read this from the title frame and the player appearing at about 6 s; I did not read the demo-selection code in the engine.
- Earlier measurements on this same wasm remain valid (coder_render_timing.zWYUzc is a re-run of the 7afb94fa build; see reports/coder_render_timing.md): about 35 tics/s, 0 non-opaque pixels, canvas fits the window at 16:10.

## Unresolved (owner)
1. tester/human: real hidden-tab timing (H1); headless cannot background a tab.
2. UNVERIFIED: physical Retina/HiDPI, Safari, Firefox.
3. tester: run tests/verify.sh on wasm 7afb94fa1ec64b5c.
4. Optional, not a defect: presents run about 2x the tic rate (duplicate frames).

## Assumptions
No spec exists. Criteria used: correct-colour opaque frames, about 35 tics/s, 16:10 fit, and a title-then-demo start being intended Doom behaviour. Manual interventions: none. Usage: not available. Wrote only in this directory.

## Next action
Tester reruns tests/verify.sh and runs the H1 manual protocol.
