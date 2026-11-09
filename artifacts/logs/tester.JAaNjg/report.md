FINDINGS

`tests/verify.sh` exited 0 (full 300 s soak, clean build, 0 failed checks), but 5 required behaviors remain UNVERIFIED, so this is not PASS.

## Source identity
HEAD e500c44 plus uncommitted changes (verify/identity.txt, dirty_diff_sha256 72688451...). emcc 4.0.18. Clean `make clean && make all` ran inside the script. I changed no product source, tests, or loop files.

## Prior findings read
artifacts/reports/ (tester, reviewer_gameplay, reviewer_site, coder*). No specification.md or acceptance-criteria.md exists.

## Work and evidence (this dir)
- verify.out and verify/ (identity.txt, playtest.log, faults.log, verify-result.json): `RUN_ID=tester.JAaNjg OUT_DIR=<abs> tests/verify.sh`, exit=0.
- Selftest: all helper checks ok.
- Playtest: failed=0. Every B, T, M, G1/G2, I1-I8, C, U, E and R check passed.
  - T2: 34.97 tics/s.
  - R1-R4: 300 s soak with no errors, 60 rAF/s, longtask 0 ms, 24 sampled frames differed.
- I6.backward-returns passed (start-vs-back=0.368, start-vs-fwd=0.532, ratio ~0.69). The ratio is close to the 0.7 limit. Earlier runs gave 0.79 (fail) and 0.60 (pass), so I6 passed in this run and the earlier fail is unexplained. I did not loosen it.
- Fault injection caught 4/4: drop-keyup (I2 I5 C3 I7), drop-blur (I7), ignore-left (I3 E2a), swap-rb (B4).
- verify-attempt1-relative-outdir.out: failing evidence, kept. The first attempt exited 2 because I passed a relative OUT_DIR and verify.sh does `cd tests` before writing to it. This is a script robustness issue, not a product fault. I then reran with an absolute path.

## Unresolved (owner)
1. I6 is marginal: ratios of 0.60-0.79 against a 0.7 limit. It needs a more stable oracle, such as a position export, a longer backward hold, or a direction-only check (tester).
2. tests/verify.sh breaks on a relative OUT_DIR, because the `cd tests` steps write to the log through a relative path (tester). Fix by resolving OUT_DIR to an absolute path.
3. UNVERIFIED, listed by the suite as not in scope:
   - A1 audio correctness. No human has listened, and an active AudioContext only proves non-silent output (student scope).
   - P1 save persistence (student scope).
   - G3 door use and level exit, which have no oracle (tester).
   - I9 input-module identity. The exports `cap_input_impl`, `cap_input_delivered_count` and `cap_input_dropped_count` exist per coder's report, so this is wiring work for the tester.
   - H1 hidden-tab timing. Headless Chromium cannot throttle a real background tab (needs a manual protocol).
4. Faults are injected browser-side only. The criteria are agent-proposed, not student-approved. Only Chromium was tested.

## Assumptions
Doom default keys; headless Chromium via Playwright; no thresholds changed. I did not change tests. Manual interventions: none. Usage: not available.
