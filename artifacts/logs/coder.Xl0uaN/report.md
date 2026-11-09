FINDINGS

Build/startup is healthy and the shared interfaces are coherent; no source edits were needed. FINDINGS (not PASS) because I ran no browser playtest or `tests/verify.sh`, and the open items below remain.

## Source identity
HEAD e500c44 plus uncommitted changes. emcc 4.0.18. `dist/doom.wasm` sha256 prefix a4c6846627bdcb21, identical to the previous runs.

## Prior findings read
All six files in artifacts/reports/. artifacts/specification.md and acceptance-criteria.md do not exist.

## Work and evidence (this dir)
- `make clean && make`: exit 0 (make.log). The wasm hash is unchanged, so the build is reproducible.
- exports.txt: all bridge exports are in the build, including the v3 diagnostics `cap_input_impl`, `cap_input_delivered_count` and `cap_input_dropped_count`. The tester's earlier "I9 needs a diagnostic export" is therefore already met. The tester must use these exports; I added nothing.
- http.txt: with dist/ served on 127.0.0.1:8000, `/`, doom.js, doom.wasm and doom.data all returned 200. The server was stopped. This is an HTTP check only, not a browser run.
- BUILD.md already documents the build and port 8000, so I made no edits.

## Unresolved (owner)
1. tester: I6.backward-returns is flaky (ratios 0.60-0.79 vs 0.7). The oracle is theirs to stabilise.
2. tester: wire I9 to the exports above; H1 hidden-tab timing needs a manual protocol.
3. UNVERIFIED: door use and level exit, Safari/Firefox, physical HiDPI.
4. student: no human has heard the audio; criteria are agent-proposed.
5. Known limits: WASD and mouse are not mapped.

## Assumptions
Doom default keys are the control requirement. I made no speculative edits to passing code. Manual interventions: none.
