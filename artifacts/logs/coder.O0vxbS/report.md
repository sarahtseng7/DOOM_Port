FINDINGS

Integration check only; I made no source edits. All six prior reports are consistent with one build. FINDINGS, not PASS: my full-suite run was cut off by my own timeout during fault injection, and the same four behaviours are still UNVERIFIED.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix 2c74d74fd2c699f9, the same before and after my run. dist/doom.wasm sha256 prefix 7afb94fa1ec64b5c. emcc 4.0.18. `make -n` prints "Nothing to be done". web/{index.html,input_audio.js,audio_web.js,render_timing.js} are byte-identical to dist/ (cmp). artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read and how they integrate
- coder, coder_render_timing, coder_input_audio, reviewer_site, reviewer_gameplay and tester reports (all in artifacts/reports/) agree on wasm 7afb94fa1ec64b5c.
- None of them asks for a change in my owned files (Makefile, BUILD.md, web/index.html, platform/doomgeneric_wasm.c, capstone_bridge.h, cap_fallback.c, engine_stubs.c). Nothing needed integrating.
- reviewer_site finding 2 (hash differs from older reports): the build changed, so the older evidence does not cover this build. The newer reports match the current hash.
- reviewer_site finding 3 (mid-gameplay first screenshot): resolved by coder_render_timing, which captured the title screen as the first frame and the player appearing at about 6 s (attract demo). Still read from screenshots, not from the engine source.
- G3: reviewer_gameplay observed door 4 opening with Use on this build (ceiling 0 -> 16 -> 68) and not without Use. The v5 sector exports are enough for a tester check. Nobody has added one to tests/playtest.mjs yet.

## Evidence (this dir)
`RUN_ID=coder.O0vxbS OUT_DIR=artifacts/logs/coder.O0vxbS/verify tests/verify.sh`, output in verify.out. The run exited 124 because I set a 580 s timeout, which the 300 s soak plus fault injection exceeded.
- Playtest: `playtest: PASS failed=0 unverified=4`. This includes T2 (34.97 tics/s), S1 (16:10 at four viewports), R1-R4 (300 s soak, no errors, no long stalls), E1-E4, I8, I9, U2-U4.
- Fault injection: 3 of 5 recorded before the timeout (drop-keyup, drop-blur, ignore-left caught). swap-rb and bad-aspect did not run in my run. The earlier tester run (artifacts/logs/tester.bajOBH) caught 5/5 on the same hashes.
- After the interrupted run, the diff hash and wasm hash are unchanged and `make -n` is clean, so the fault injection left no modified source.

## Unresolved (owner)
1. UNVERIFIED A1, student/human: no one has listened to the audio. Music is a GM-family oscillator synth, not GENMIDI/OPL.
2. UNVERIFIED H1, human: real hidden-tab timing. Headless Chromium cannot background a tab.
3. UNVERIFIED G3, tester: add the position-based door check from reviewer_gameplay's recipe (steer to about (1519,-2490) facing east, press Space, assert cap_sector_ceiling(4) > 0). Level exit and walking through the door are also unchecked.
4. UNVERIFIED P1, student scope: save persistence.
5. Not tested: Firefox, Safari, physical HiDPI, pickups and damage.
6. Known limits (coder_input_audio): the first SFX before a gesture is dropped, WASD and mouse are not mapped, linked-sound pitch is ignored.

## Assumptions
- Criteria are agent-proposed and not student-approved. Doom default keys are the control requirement. The attract-demo start is intended Doom behaviour.
- A 580 s timeout was my own choice and was too short for the full suite. A rerun needs about 15 minutes.
- Manual interventions: none. Usage: not available. I wrote only in this directory.

## Next action
Tester adds the G3 door check and reruns tests/verify.sh with no short timeout on 7afb94fa1ec64b5c. A human listens for A1 and runs the H1 protocol in tests/README.md.
