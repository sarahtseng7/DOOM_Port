FINDINGS

Not PASS: `tests/verify.sh` exited 0 this run, but required behavior remains unverified (below), so the result is partial.

## Source identity
HEAD e500c44 plus uncommitted changes (verify/identity.txt, dirty_diff_sha256 72688451...). Clean `make clean && make all` ran in the script. I changed no product source or tests.

## Prior findings read
artifacts/reports/ (tester, reviewer_gameplay, reviewer_site, coder*). The previous tester run failed I6.backward-returns with ratio 0.79 (limit 0.7); it was judged flaky.

## Results (evidence: verify.out, verify/)
- `SOAK_SECONDS=60 tests/verify.sh`: **exit=0**. Tooling, selftest, clean build and playtest passed (failed=0). Fault injection caught 4/4: drop-keyup, drop-blur, ignore-left, swap-rb.
- I6 passed this time (start-vs-back=0.318, start-vs-fwd=0.532, ratio 0.60). That is one pass; the last run's failure is not explained. The margin is thin, so I still treat I6 as marginal.
- T2 measured 34.96 tics/s. The soak ran 60 s, not the 300 s of the prior run: R2 60.4 rAF/s, longtask 0 ms, and 5 sampled frames differed.

## Unresolved (owner)
1. I6 is timing-sensitive (tester). A stable oracle needs a position export, a longer backward hold, or a direction-only check. I did not loosen it.
2. UNVERIFIED, listed by the suite:
   - A1 audio correctness (student scope).
   - P1 save persistence (student scope).
   - G3 door use and level exit (no oracle).
   - I9 input-module identity (coder needs to add a diagnostic export).
   - H1 hidden-tab timing (needs a manual protocol).
3. Faults are browser-side only, and the criteria are agent-proposed, not student-approved.

## Assumptions
Doom default keys; headless Chromium via Playwright; no thresholds changed. The soak was shortened to 60 s for time. Usage: not available.
