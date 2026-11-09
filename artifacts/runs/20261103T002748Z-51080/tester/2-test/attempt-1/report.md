# tester 2-test attempt-1 (run 20261103T002748Z-51080)

Status: FINDINGS. The unchanged suite FAILED (exit 1): `I3.turn-left shift=-116px`. All other required checks passed. A1, P1 and G3 are UNVERIFIED. The criteria are agent-proposed, not student-approved.

## Source
- Commit e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes: source-status.txt, source-dirty.patch (untracked files are not in the patch).
- Identity (tests_sha256, dirty_diff_sha256, wad_sha256, emcc): verify/identity.txt.
- No tests/ files were modified, and no thresholds were changed.

## Assumptions
- No artifacts/specification.md, acceptance-criteria.md or interface-contract.md exists. I used the proposals in coder/plan/attempt-1/ and tester/prepare/attempt-1/. None is student-approved.

## Commands and results
- `source ~/Developer/emsdk/emsdk_env.sh && RUN_ID=... OUT_DIR=<abs> tests/verify.sh`: exit 1 (verify-exit.txt).
- Tooling, selftest and `make clean && make all` passed.
- Playtest: 29 PASS, 1 FAIL (I3), 3 UNVERIFIED (A1, P1, G3). This includes the 300s soak (R1-R4) and 34.96 tics/s.
- Evidence: verify/ (verify.log, selftest.log, build.log, dist-sha256.txt, playtest-results.json, screenshots), verify-stdout.log.

## Findings
1. FAIL I3.turn-left (owner: tester for the check; coder only if the cause turns out to be in the product).
   - Same-build history: coder 2-integrate failed 1 of 5 runs, the reviewer 2 of 3, and now this full run failed (the earlier tester 1-test run passed). That is at least 4 failures in about 10 runs.
   - I1 (turn-right) gave -200px every time, with a consistent sign. I3 gives +204px when it passes and -116px when it fails. A mirrored result of about 200px that comes out as -116px suggests bestShift aliasing (or turn timing), not the game ignoring ArrowLeft. This is a hypothesis, unconfirmed.
   - I did not change the check, because I have no authorization to rewrite checks after prepare. I preserved the failing run. Do not report PASS while I3 is intermittent.
2. UNVERIFIED (owner: student): A1 audio and P1 persistence have no decided scope.
3. UNVERIFIED (owner: tester/student): G3 door use and level exit have no oracle.
4. Owner tester, proposed only: the reviewer's R2-3 and R2-4 checks (key edge cases, implementation identity).
5. Owner student: approve or replace the proposed criteria.

## Limits
Headless Chromium only. Outcomes are inferred from pixels. Mouse, touch and non-Chromium browsers were not tested. Usage: not available.

## Next action
Student authorizes a fix for the I3 measurement (e.g. a larger bestShift search range, or an angle-independent turn-left oracle, with no lowered threshold). Tester then runs 10 repeat runs to measure the failure rate. Student decides the audio/persistence scope and approves the criteria.
