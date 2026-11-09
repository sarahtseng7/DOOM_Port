FINDINGS

`tests/verify.sh` exited 0 (tooling, selftest, clean build, playtest failed=0 incl. 300 s soak, 5/5 fault injections caught). Result is FINDINGS, not PASS, because 4 required behaviors remain UNVERIFIED: A1 audio, P1 persistence, G3 door/level exit, H1 hidden-tab timing.

## Source identity
HEAD e500c44 plus uncommitted changes; see verify/identity.txt (dirty_diff_sha256 429a585d..., includes my test edits). dist/doom.wasm sha256 prefix 6c93cbf125bd366a. Command: `RUN_ID=tester.3Pq6Xx OUT_DIR=artifacts/logs/tester.3Pq6Xx/verify tests/verify.sh` (emsdk 4.0.18 sourced). Evidence: verify.out, verify/ (build.log, playtest.log, playtest-results.json, faults.log, screens/).

## Work (prior reports read: all six in artifacts/reports/)
Existing checks preserved; none weakened. Changes in tests/ (tester-owned):
- **I6 now position-based** (cap_player_x/y), limit 0.7 unchanged. TEST CORRECTION, reason: pixel oracle flaked (0.60-0.79). Pixel values kept in detail. This run: start-to-fwd 409, start-to-back 84 units.
- **New G1b** (E1M1, health 100 from engine state), **I4b** (forward moves player >=32 units; 409), **I9** (cap_input_impl==1, delivered 46 > 0, dropped 0; was UNVERIFIED), **S1** (canvas stays 16:10 and fits 1280x720, 500x300, 1000x700, 800x600).
- **New fault bad-aspect** (forces a 640x200 canvas): S1 fails as expected.
- tests/README.md: rev 3 notes and a manual H1 hidden-tab protocol.
- No spec/acceptance-criteria file exists; criteria remain the agent-proposed set in artifacts/runs/20261103T002748Z-51080/tester/prepare/attempt-1/proposed-criteria.md plus the additions above.

## Unresolved (owner)
1. UNVERIFIED A1 audio correctness (student/human: nobody has listened).
2. UNVERIFIED P1 save persistence (student scope).
3. UNVERIFIED G3 door use / level exit (coder: a sector/line export would allow a check; no oracle today).
4. UNVERIFIED H1 real hidden-tab timing (human: run the manual protocol in tests/README.md).
5. Limits: faults injected browser-side only; criteria agent-proposed, not student-approved; headless Chromium only; non-position outcomes pixel-inferred; no Firefox/Safari/physical HiDPI.

## Assumptions
Doom default keys. I4b threshold 32 map units chosen from observed ~409. S1 viewports and 3% aspect tolerance chosen by me. Suite run once. No product source touched. Manual interventions: none. Usage: not available.

## Next action
Human listens to audio and runs the H1 protocol; coder may add a door/sector export so tester can add G3.
