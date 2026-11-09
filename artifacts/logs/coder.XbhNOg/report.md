FINDINGS

No source edits. No report in artifacts/reports/ asks for a change in my owned files (Makefile, BUILD.md, web/index.html, platform/doomgeneric_wasm.c, capstone_bridge.h, cap_fallback.c, engine_stubs.c). Result is FINDINGS because browser behaviour was not re-run by me and the items below remain unverified.

## Source identity
HEAD e500c44 plus uncommitted changes; `git diff HEAD` sha256 prefix 2c74d74fd2c699f9 (unchanged since the previous coder, tester and reviewer runs). emcc 4.0.18.

## Evidence
- `make clean && make` exited 0 (clean-build.log in this directory).
- Hashes (prefix) after the rebuild: doom.wasm 7afb94fa1ec64b5c, doom.js 0090630eeaf16a87, doom.data 1d7d43be501e67d9. These match the previous coder run, so the build is reproducible and the tester's evidence applies to the current dist/.
- web/{index.html,input_audio.js,audio_web.js,render_timing.js} are byte-identical to dist/ (cmp).
- I did not rerun tests/verify.sh or any browser check. Latest tester result (tester.BNf9ts, same source): exit 0, 0 FAIL, 5/5 fault injections caught, with 4 behaviours UNVERIFIED.
- doom.data embeds the WAD, so I did not copy dist/ under artifacts/.

## Unresolved (owner)
1. tester: G3 door/level exit, a menu-freezes-player check, an audio-clock guard (currentTime must advance before asserting peak), and the stale "no sector oracle exported" reason string in tests/playtest.mjs. The bridge v5 sector exports exist.
2. human: listen to the audio (A1); run H1 hidden-tab timing (tests/README.md). Headless audio clock stalls intermittently.
3. student: P1 save persistence scope; music is an oscillator synth, not GENMIDI/OPL.
4. Not tested: Firefox, Safari, HiDPI. Known limits: first SFX before a gesture dropped, WASD and mouse unmapped.

## Assumptions
- artifacts/specification.md and acceptance-criteria.md do not exist; criteria are agent-proposed, not student-approved.
- Doom default keys are the control requirement.
- Manual interventions: none. Usage: not available.
- I wrote only in this directory, plus the generated build/ and dist/.

## Next action
Tester adds the missing checks and reruns tests/verify.sh. A human listens to the audio and runs H1.
