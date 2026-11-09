FINDINGS

Integration re-verified from a fresh build; no specialist change requires an edit to my files, so I changed no source. FINDINGS (not PASS) because I ran no browser playtest and did not run `tests/verify.sh`. The unresolved items below are unverified.

## Source identity
HEAD e500c44 + uncommitted changes. emcc 4.0.18 (emcc.txt). Built into this OUTPUT_DIR with `make BUILD=$O/build DIST=$O/dist` (make.log, exit 0). doom.wasm sha256 prefix a4c6846627bdcb21, identical to repo dist/ and to every earlier report. web/index.html, input_audio.js, audio_web.js and render_timing.js are byte-identical to the built copies (cmp). The exports include the specialist hooks `_cap_input_impl`, `_cap_input_delivered_count` and `_cap_input_dropped_count`. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
All six files in artifacts/reports/. None reports a defect in coder-owned files. The latest tester run had verify.sh exit 0, 0 failed checks, and fault injection caught 4/4.

## Unresolved (owner)
1. tester: I6.backward-returns is marginal (0.60-0.79 against a 0.7 limit). reviewer_gameplay's single backward trial showed no product fault, which points to oracle sensitivity.
2. tester: tests/verify.sh fails on a relative OUT_DIR.
3. tester: I9 wiring, H1 hidden-tab timing (needs a manual protocol), and G3 door/level exit (no oracle).
4. student: no human has listened to the audio, and music is a GM-family oscillator synth, not OPL. The criteria are agent-proposed. Only headless Chromium was tested; physical HiDPI is unverified.
5. Known limits, not defects: WASD and mouse are not mapped. The first SFX before a user gesture is dropped, which causes the autoplay console warnings.

## Assumptions
Doom default keys are the control requirement. I made no speculative edits to code that passes existing checks. Manual interventions: none. Usage: not available.
