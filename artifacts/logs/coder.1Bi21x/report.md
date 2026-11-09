FINDINGS

Integration is current: the repo `dist/` is rebuilt, so the render_timing DPR change now ships. No source edits by me. I did not run `tests/verify.sh` or a browser playtest, so this is partial.

## Source identity
HEAD e500c44 + uncommitted changes. emcc 4.0.18 (~/Developer/emsdk). `dist/doom.wasm` sha256 prefix a4c6846627bdcb21, unchanged from prior runs.

## Prior findings read
All six files in artifacts/reports/. artifacts/specification.md and acceptance-criteria.md do not exist.

## Work and evidence (this dir)
- `make` in the repo, exit 0 (make.log). This copied the web files into dist/.
- `cmp` shows web/{index.html,audio_web.js,input_audio.js,render_timing.js} are byte-identical to dist/. dist/render_timing.js contains the devicePixelRatio fit.
- Served dist/ on 127.0.0.1:8000 with python http.server: /, doom.js, doom.wasm, doom.data all 200 (http.txt). Server stopped. This is an HTTP check only, not a browser run.
- BUILD.md already documents port 8000. No edits needed.

## Unresolved (owner)
1. tester: I6.backward-returns is flaky (ratios 0.60-0.79 vs 0.7 limit), so verify.sh cannot give a stable exit 0. Tester-owned; I did not touch tests/.
2. tester: run verify.sh, including fault injection, on this build. The last full pass skipped faults.
3. tester: no automated canvas-scaling check; hidden-tab timing (H1) needs a manual protocol.
4. student: no human has listened to the audio. Music is a GM-family oscillator synth, not OPL.
5. UNVERIFIED: door use and level exit, Safari/Firefox, physical HiDPI.
6. Known limits: WASD and mouse are not mapped. The two AudioContext autoplay warnings before a gesture are expected.

## Assumptions
Doom default keys are the control requirement. No speculative edits to code that passes its checks. Manual interventions: none.
