# tester 1-test attempt-1 (run 20261103T002748Z-51080)

Status: FINDINGS. The unchanged suite passed (exit 0, failed=0), but 3 required behaviors are UNVERIFIED and the criteria are agent-proposed, so I am not reporting PASS.

## Source
- Commit e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes. Status: source-status.txt. Full dirty diff: source-dirty.patch (the untracked files are not in this patch).
- Identity, with tests_sha256, dirty_diff_sha256, wad_sha256, emcc 4.0.18: verify/identity.txt
- Tests were not modified. No tests/ edits were made.

## Assumptions
- No artifacts/specification.md, acceptance-criteria.md or interface-contract.md exists. I used the agent-proposed tester/prepare/attempt-1/proposed-criteria.md and coder/plan/attempt-1/. None is student-approved.

## Commands and results
1. Run 0: `tests/verify.sh` with a relative OUT_DIR. It exited 2 at the "npm ci" step, because the script cd's into tests/ and could not write the log. This was my invocation error, not a product failure. Preserved in verify-run0-*.
2. Run 1: `source ~/Developer/emsdk/emsdk_env.sh && RUN_ID=... OUT_DIR=<absolute> tests/verify.sh`. Exit 0. This ran the tooling check, selftest, `make clean && make all`, and the browser playtest. The playtest had 30 PASS, 0 FAIL, 3 UNVERIFIED, including the 300s soak (R1-R4) and 35.21 tics/s.
   Evidence: verify/ (verify.log, selftest.log, build.log, dist-sha256.txt, playtest-results.json, screenshots), verify-stdout.log, verify-exit.txt.

## Findings
- UNVERIFIED (owner: student): A1 audio and P1 save persistence have no decided scope.
- UNVERIFIED (owner: tester/student): G3 door use and level exit have no oracle.
- Owner tester, proposed only (not applied; no authorization to change checks): the reviewer's F2 key edge-case coverage (visibilitychange, pagehide, dual Ctrl, auto-repeat, held-key refocus) and F5 implementation-identity check (strong vs weak fallback).
- Owner student: approve or replace the proposed criteria.
- Reviewer F1, F3, F4, F6 and F9 are coder-owned and not addressed by this run. I did not verify them.

## Limits
Headless Chromium only. Outcomes are inferred from pixels. Mouse is absent. Non-Chromium browsers and touch were not tested. Usage: not available.

## Next action
Student decides the criteria and the audio/persistence scope. Tester then adds the F2 and F5 checks once authorized. Coder addresses the reviewer findings.
