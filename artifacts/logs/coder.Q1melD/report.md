FINDINGS

The clean rebuild succeeded and is reproducible. I changed no source files because I found nothing in coder-owned files that needed repair. The result is FINDINGS because I did not run `tests/verify.sh` or a browser startup check in this session, and earlier unverified items remain.

## Source identity
HEAD e500c44 plus uncommitted changes. emcc 4.0.18 from ~/Developer/emsdk.

## Work and evidence (this dir)
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/CODER.md, and all of artifacts/reports/.
- `make clean && make` exited 0 (build.log). No warnings or errors were flagged in the tail I inspected; I did not review the full log.
- dist/doom.wasm sha256 is a4c6846627bdcb21..., the same as the prior coder, tester and reviewer runs, so the build is reproducible. Hashes are in dist-sha256.txt.
- dist/{index.html, audio_web.js, input_audio.js, render_timing.js} are byte-identical to web/ (cmp).
- The Makefile link line exports `_cap_input_impl`, `_cap_input_delivered_count` and `_cap_input_dropped_count`, and embeds assets/doom1.wad via `--preload-file`.
- BUILD.md matches the Makefile. It documents serving `dist/` over HTTP, but I did not confirm it names port 8000 explicitly.

## Not verified in this session
- Browser startup and the protected `tests/verify.sh`. I relied on the tester's earlier PASS on the same wasm hash. That is inference, not a re-run.

## Unresolved (owner)
1. tester: tests/playtest.mjs (~line 223) says the I9 check "needs coder export". The export exists (cap_input_impl, bridge v3), so the check is stale.
2. tester/student: hidden-tab timing (H1), door use and level exit (G3), and real audio listening are still unverified. Music is an oscillator approximation, not OPL (student decision).
3. student: criteria are agent-proposed. WASD and mouse are unmapped, and HiDPI is not handled (canvas backing store 640x400).
4. coder_render_timing: reviewer_site noted the canvas is not scaled to the viewport. The earlier coder report says render_timing.js handles scaling, but I did not confirm it.

## Assumptions
No specification.md or acceptance-criteria.md exists. Doom default controls are the requirement. Manual interventions: none.
