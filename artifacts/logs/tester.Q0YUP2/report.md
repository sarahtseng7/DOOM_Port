FINDINGS

`tests/verify.sh` exited 1. Tooling, selftest, clean build and 38 of 39 required playtest checks passed, including the 300 s soak. One check failed: I6.backward-returns. Five behaviors remain UNVERIFIED.

## Source identity
HEAD e500c44 plus uncommitted changes (verify/identity.txt, dirty_diff_sha256 7268845137456e44...). emcc 4.0.18. Command: `RUN_ID=tester.Q0YUP2 OUT_DIR=artifacts/logs/tester.Q0YUP2/verify tests/verify.sh`. Wall time about 6 min.

## Work and evidence
Evidence is in artifacts/logs/tester.Q0YUP2/: verify.out, verify/ (identity.txt, build.log, selftest.log, playtest.log, playtest-results.json, verify-result.json, browser-console.log, dist-sha256.txt, screens/). I read all six prior files in artifacts/reports/ and changed no files other than this report and the evidence directory. No tests were weakened.

- Passed: load and console errors, boot frame, colors and channel order, rAF liveness, menu to E1M1, turn left and right, forward movement and its stop on release, blur, pagehide and hidden-tab key release, fire with ammo decrement, automap, Esc menu, 35 tics/s (measured 34.97), soak (300 s, no errors, no stalls).
- **FAIL I6.backward-returns:** start-vs-back=0.394, start-vs-fwd=0.496. The ratio is 0.79 against a 0.7 limit.

## Analysis of the I6 failure
The previous tester run (tester.3P7z9H) passed I6 with a ratio of about 0.60. Earlier runs ranged 0.60-0.79, so this result is inside the known range and the same build and checks produce both PASS and FAIL. That makes it a flaky oracle, not clear evidence of a product defect.

Evidence for that reading:
- Forward-then-backward movement should end nearer the start than the forward-only frame. The ratio is 0.79 (<1), so the back frame is still somewhat closer to the start.
- The check compares pixel diffs of the view and is sensitive to Doom's momentum and timing, because there is no player position export.
- I could not confirm a real backward-movement bug from pixel diffs alone. I did not loosen the threshold.

## Unresolved (owner)
1. I6 fails intermittently (tester). Needs a position export from the engine (coder) or a direction-only check. Until then verify.sh can return nonzero without a product defect, so I can't call the build verified.
2. UNVERIFIED, as listed by the suite:
   - A1 audio correctness (student scope; no human has listened).
   - P1 save persistence (student scope).
   - G3 door use and level exit (tester; no oracle).
   - I9 input-module identity (coder must export a diagnostic).
   - H1 real hidden-tab timing (needs a manual protocol).
3. Faults are injected browser-side only. Criteria are agent-proposed, not student-approved. Only headless Chromium was tested.

## Assumptions
Doom default keys; no thresholds changed. I ran the suite once and did not rerun I6 in isolation. Manual interventions: none. Usage: not available.
