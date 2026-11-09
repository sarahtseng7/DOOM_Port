FINDINGS

`tests/verify.sh` exited 0 (clean build, selftest, full 300 s soak, 0 failed checks, fault injection 4/4 caught). 5 required behaviors remain UNVERIFIED, so this is not PASS.

## Source identity
HEAD e500c44 plus uncommitted changes (verify/identity.txt). emcc 4.0.18. Ran `RUN_ID=tester.3P7z9H OUT_DIR=artifacts/logs/tester.3P7z9H/verify tests/verify.sh` with a relative OUT_DIR.

## Work and evidence
- Changed tests/verify.sh only: OUT_DIR is now resolved to an absolute path after mkdir. This fixes the relative-OUT_DIR failure from the previous report. The run above used a relative path and succeeded, which confirms the fix.
- Evidence: verify.out, verify/ (identity.txt, playtest.log, faults.log, verify-result.json, build.log).
- Playtest: failed=0. I6.backward-returns passed (start-vs-back=0.318, start-vs-fwd=0.532, ratio about 0.60). It is still within the range of earlier runs (0.60-0.79 against a 0.7 limit), so it is not stable.
- Fault injection caught 4/4: drop-keyup (I2 I5 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4).
- Prior reports in artifacts/reports/ read. No new product defect found.

## Unresolved (owner)
1. I6 oracle marginal (tester). Needs a position export or a direction-only check. Not changed, since I did not loosen it.
2. UNVERIFIED, listed by the suite:
   - A1 audio correctness (student scope; no human has listened).
   - P1 save persistence (student scope).
   - G3 door use and level exit (tester; no oracle).
   - I9 input-module identity (tester; the coder exports exist per the earlier report, but the check is not wired up).
   - H1 real hidden-tab timing (needs a manual protocol).
3. Faults are injected browser-side only. Criteria are agent-proposed, not student-approved. Only headless Chromium was tested.

## Assumptions
Doom default keys; no thresholds changed. Manual interventions: none. Usage: not available.
