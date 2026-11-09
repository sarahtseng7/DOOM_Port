FINDINGS

No source edits: no report in artifacts/reports/ asks for a change in my owned files. This run's new evidence is a clean rebuild that reproduced the same binaries. The result is FINDINGS because browser behaviour was not re-run by me and several items are still unverified.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix 2c74d74fd2c699f9, emcc 4.0.18. Hashes (prefix) before and after `make clean && make`: doom.wasm 7afb94fa1ec64b5c, doom.js 0090630eeaf16a87, doom.data 1d7d43be501e67d9. All three match, so the build is reproducible and the tester's evidence applies to the current dist/.

## Work and evidence
- Read AGENTS.md, my role prompt, and all six files in artifacts/reports/.
- Clean build: `make clean && make` exited 0. The log is clean-build.log in this directory. I deleted my pre-build copy of dist/ because doom.data embeds the WAD, which must not be stored under artifacts/.
- web/{index.html,input_audio.js,audio_web.js,render_timing.js} are byte-identical to dist/ (cmp).
- Integration: the Makefile EXPORTED_FUNCTIONS list covers the bridge v5 symbols (ready, tic, input, framebuffer, player, sector). Scripts load before doom.js, as documented in BUILD.md.
- I did not rerun tests/verify.sh. Latest tester result (tester.puK0iM, same hashes): exit 0, 0 FAIL, 5/5 fault injections caught.

## Unresolved (owner)
1. coder_input_audio/tester: audio peak 0 in two recent runs vs 0.388 earlier on identical source, unexplained (suspected load). Rerun on an idle machine.
2. human: nobody has listened to the audio (A1). Music is an oscillator synth, not GENMIDI/OPL (student decision).
3. human: H1 real hidden-tab timing (tests/README.md).
4. tester: G3 door/level exit and a menu-freezes-player check are not in tests/verify.sh. The reason string in tests/playtest.mjs is stale.
5. student: P1 save persistence scope.
6. Not tested: Firefox, Safari, HiDPI.
7. Known limits: first SFX before a gesture is dropped, WASD and mouse unmapped.

## Assumptions
- artifacts/specification.md and acceptance-criteria.md do not exist. Criteria are agent-proposed, not student-approved.
- Doom default keys are the control requirement.
- Manual interventions: none. Usage: not available.
- I wrote only in this directory, plus the generated build/ and dist/.

## Next action
Tester adds G3 and the menu-freeze check, then reruns tests/verify.sh. A human listens to the audio and runs H1.
