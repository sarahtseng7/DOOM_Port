FINDINGS

Door use (the open G3 gap) is now observed working on the current build. This is still FINDINGS, not PASS: audio correctness, walking through the opened door, pickups, damage, a real hidden tab and non-Chromium browsers remain unverified.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix 2c74d74fd2c699f9. dist/doom.wasm sha256 prefix 7afb94fa1ec64b5c (bridge v5, with sector exports). `make -n`: nothing to do, so I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
All six files in artifacts/reports/. The earlier reviewer_gameplay run found no door because no oracle existed. Coder's v5 sector exports now provide one. I did not repeat the movement or audio measurements.

## Work and evidence (this directory)
Scripts are my own, not protected checks. They use headless Chromium via Playwright against a throwaway local server that exits with the script.
- **Door location:** I read the E1M1 LINEDEFS from assets/doom1.wad (read only). Door lines (special 1) belong to sectors 4, 68, 76 and 81. The engine export at level start reports exactly these four sectors with floor == ceiling (closed), which agrees with the WAD.
- **door5.mjs, with Use:** steered from the start (1056,-3616) toward the sector 4 door at about (1544,-2496) using cap_player_x/y/angle, pressing Space while walking. The player reached (1519,-2484) in sector 3. Sector 4's ceiling then went 0 -> 16 -> 68, so the door opened. Health 100, level 101, no console errors. See door5-use-results.json and door5-use-final.png.
- **door5ctl.mjs, control with Space removed:** same route, 90 steps, 0 sector changes. So the opening is caused by Use and not by walking up to the door.
- **Movement and turning:** the steering depended on turning and on stopping, and both worked. The player turned toward the target and ended within about 25 units of the door.
- **Console:** no errors or page errors in either run (35 console lines each, warnings only).

## Unresolved (owner)
1. UNVERIFIED, tester: walking through the opened door. door5pass.mjs (door5pass-results.json) did not reach the far side. Its steering ended with the player at (1519,-2449) and no further sector events. That is a limit of my greedy steering, not evidence that the door blocks the player. The tester can add a G3 check from this recipe: steer to (1519,-2490) facing east, press Space, and assert cap_sector_ceiling(4) > 0.
2. UNVERIFIED, student/human: audio correctness. No one has listened. I did not retest audio. The coder_input_audio report on this same wasm hash shows a running context, 5 of 5 SFX played and peak 0.394, which proves non-silent output only.
3. UNVERIFIED, tester: pickups, damage and death, level exit, a real hidden tab (headless cannot background a tab), Firefox, Safari.
4. Known limits from earlier reports, unchanged: music is an oscillator synth, not GENMIDI/OPL. WASD and mouse are not mapped. The first SFX before a gesture is dropped.

## Assumptions
- Doom default keys (arrows, Space for Use) are the control requirement.
- Position and sector exports are trusted as engine state. The WAD cross-check supports the sector list.
- An opening ceiling in a door sector is taken to mean the door opened.
- I used the first 220 steering steps as the budget. I stopped once the door event was seen.
- Manual interventions: none. Usage: not available. I wrote nothing outside this directory.

## Next action
Tester adds a position-based G3 door check using the recipe above. A human listens to SFX and music.
