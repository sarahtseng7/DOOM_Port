FINDINGS

Build and startup were re-verified from a fresh build. I changed no source because no prior finding points to a defect in coder-owned files. This is FINDINGS rather than PASS because I ran no browser playtest and did not run `tests/verify.sh` this run.

## Source identity
HEAD e500c44 plus uncommitted changes. emcc 4.0.18 (emcc.txt, rev.txt). I built into this OUTPUT_DIR with `make BUILD=$O/build DIST=$O/dist` (make.log, exit 0).
- doom.wasm sha256 prefix a4c6846627bdcb21, identical to repo `dist/` and to earlier reports.
- web/index.html, input_audio.js, audio_web.js and render_timing.js are byte-identical to the built copies (cmp).
- doom.js exports `_cap_ready`, `_cap_tic_count`, `_cap_input_event`, `_cap_input_reset`, `_cap_bridge_version`, `_cap_framebuffer_ptr`, `_cap_input_impl`, `_cap_input_delivered_count` and `_cap_input_dropped_count`.
- artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
All six files in artifacts/reports/. None reports a defect in coder-owned files (Makefile, BUILD.md, web/index.html, platform/doomgeneric_wasm.c, capstone_bridge.h, cap_fallback.c, engine_stubs.c). The serve instructions for port 8000 are in BUILD.md.

## Unresolved (owner)
1. tester: the I6.backward-returns oracle is marginal (0.60-0.79 against a 0.7 limit).
2. tester: I9 wiring, H1 hidden-tab timing and G3 door/level exit are UNVERIFIED.
3. student: no human has listened to the audio, and music is a GM-family oscillator synth, not OPL. The criteria are agent-proposed. Only headless Chromium was tested.
4. Known limits, not defects: WASD and mouse are not mapped. The first SFX before a user gesture is dropped, which causes the autoplay warnings.

## Assumptions
Doom default keys are the control requirement. Manual interventions: none. Usage: not available.
