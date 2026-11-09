# Tester prepare report (attempt-1, run 20261103T002748Z-51080)
Criteria are AGENT-PROPOSED, not student-approved (no artifacts/acceptance-criteria.md or specification.md exists).
Source: commit e500c44 plus uncommitted changes (see source-status.txt; tests/ files are untracked/modified).

## Work done
- Created `proposed-criteria.md` here (rev 2 content carried forward unchanged from run 20261103T001738Z-47122; coder's R1-R6 in coder/plan/attempt-1/proposed-spec.md are unchanged in substance, so no conflicting scope was introduced).
- Reviewed the existing suite (`tests/verify.sh`, `playtest.mjs`, `selftest.mjs`, `lib/frames.mjs`). It already exists, so I did not rewrite it. No edits to tests/ this attempt.
- Checks: `bash -n verify.sh` ok, `node --check playtest.mjs` ok, `node tests/selftest.mjs` all ok (exit 0).
- Ran `QUICK=1 node tests/playtest.mjs` against the EXISTING dist/ (not rebuilt; `emcc` is not on PATH in this shell): 32 PASS, 0 FAIL, 3 UNVERIFIED (A1 audio, P1 persistence, G3 door/level exit), exit 3 by design (QUICK never passes). Evidence: `playtest-quick.log`, `playtest-quick/`, `dist-sha256.txt`.

## Findings
1. (tester/student) Full `tests/verify.sh` (clean rebuild + 300s soak) not run here; needs `source ~/Developer/emsdk/emsdk_env.sh`. No PASS can be claimed.
2. (coder/tester) dist/ was not rebuilt, so its match to the current working tree is unverified; its hash is recorded in dist-sha256.txt.
3. (tester, minor) In QUICK mode the results JSON says status "FAIL" with failed=0; cosmetic, exit code 3 is correct. Not changed (checks frozen after preparation).
4. (student) Undecided: audio, persistence, mouse, other browsers, definition of faithful play. A1/P1/G3 stay UNVERIFIED.
5. Role isolation is instruction-only; nothing demonstrates filesystem protection of tests/.

## Next action
Test task: run `source ~/Developer/emsdk/emsdk_env.sh && RUN_ID=20261103T002748Z-51080 tests/verify.sh` on the integrated candidate.
Manual interventions: none. Usage: not available.
