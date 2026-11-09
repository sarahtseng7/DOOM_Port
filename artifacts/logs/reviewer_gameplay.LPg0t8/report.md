FINDINGS

Walking through an opened door is now observed. Audio correctness, a real hidden tab, other browsers, pickups and level exit are still unverified, so this is FINDINGS, not PASS.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix 2c74d74fd2c699f9. dist/doom.wasm sha256 prefix 7afb94fa1ec64b5c. `make -n`: nothing to do, so I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
All six files in artifacts/reports/. The open item for this role was "walking through the opened door" (previous reviewer_gameplay report, item 1).

## Work and evidence (this directory)
thru.mjs is my own script, not a protected check. It uses headless Chromium via Playwright against a throwaway local server that exits with the script. Results are in thru-results.json and thru-final.png. I did not open the PNG.
- **Door opens with Use:** steering from the start (1056,-3616) with Space pressed, sector 4 ceiling went 0 -> 14 -> 68. The player was in sector 3 at (1519,-2449). This repeats the earlier result.
- **Walk through:** I turned east and held ArrowUp for 3.6 s. The player went from x=1519 to x=1896, then 1970. The sectors visited were 4 (the door), 0 and 7. So the player passed through the door sector into new areas and is not blocked.
- **Stopping after release:** after ArrowUp was released, x advanced 1908, 1929, 1942, 1950, 1957, 1961, 1964, 1966 at 100 ms intervals. The steps shrink to about 1 unit, which is Doom's normal momentum decay. The player settled at x=1970 and did not slide on.
- **Focus loss:** ArrowDown held, then a synthetic `blur` event. Movement afterwards was 0 over 0.8 s.
- **Damage:** health was 100 at the start and 61 at the end of the run, on level 101. Something damaged the player, so the damage path works. I did not identify the source.
- **Console:** 35 lines, none matching "error", no page errors.

## Unresolved (owner)
1. UNVERIFIED, student/human: audio correctness. I did not retest audio. The coder_input_audio report on this same wasm hash shows non-silent output only (running context, 5 of 5 SFX, peak 0.394).
2. Weak check, tester: the blur test did not measure speed just before the blur. The 0 result shows the player was stationary afterwards. It does not show that blur stopped a player who was moving. A synthetic event is also not a real focus loss. tests/verify.sh already catches drop-blur (I7), so I rely on that for the stronger evidence.
3. UNVERIFIED, tester: pickups, death, level exit, a real hidden tab (headless cannot background a tab), Firefox, Safari.
4. Known limits from earlier reports, unchanged: music is an oscillator synth, not GENMIDI/OPL (coder_input_audio, student decision). WASD and mouse are not mapped. The first SFX before a gesture is dropped.
5. Timing and display: I observed no fault. Frame timing was not re-measured (coder_render_timing owns it).

## Assumptions
- Doom default keys (arrows, Space for Use) are the control requirement.
- Position, sector and health exports are trusted as engine state.
- Entering sectors 0 and 7 after the door opened is taken as passing through.
- Headless Chromium only. The first run was slow and went to the background, but it finished with exit 0.
- Manual interventions: none. Usage: not available. I wrote nothing outside this directory.

## Next action
Tester adds a G3 check from this recipe: steer to (1519,-2490) facing east, press Space, assert cap_sector_ceiling(4) > 0, then hold ArrowUp and assert x grows past 1700. A human listens to the SFX and music and runs the H1 hidden-tab protocol.
