FINDINGS

Build/startup re-verified from clean; no source edits were needed. FINDINGS (not PASS) because I ran no browser playtest and did not run `tests/verify.sh`. Items below remain unverified.

## Source identity
HEAD e500c44 plus uncommitted changes. emcc 4.0.18 (emcc.txt). `dist/doom.wasm` sha256 a4c68466...de75 (wasm.sha), identical to earlier reports, so the build is reproducible.

## Prior findings read
All files in artifacts/reports/. None reports a defect in coder-owned files. The tester's latest run (tester.JAaNjg) had `tests/verify.sh` exit 0 with 0 failed checks.

## Work and evidence (this dir)
- `make clean && make`: exit 0 (make.log).
- web/index.html, input_audio.js, audio_web.js and render_timing.js are byte-identical to their dist/ copies (cmp).
- dist/ served on 127.0.0.1:8000 returned 200 for `/`, doom.js, doom.wasm and doom.data (http.txt). The server was stopped. This is an HTTP check only.

## Unresolved (owner)
1. tester: I6.backward-returns is marginal (ratios 0.60-0.79 against a 0.7 limit). tests/verify.sh fails on a relative OUT_DIR.
2. tester: I9 wiring (exports `cap_input_*` exist). H1 hidden-tab timing needs a manual protocol. G3 door/level exit has no oracle.
3. student: no human has listened to the audio; the criteria are agent-proposed. Only Chromium was tested.
4. Known limits: WASD and mouse are not mapped. The first SFX before a user gesture is dropped.

## Assumptions
Doom default keys are the control requirement. I made no speculative edits to code that passes existing checks. Manual interventions: none. Usage: not available.
