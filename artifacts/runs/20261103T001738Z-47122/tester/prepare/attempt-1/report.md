# Tester prepare report (attempt-1, run 20261103T001738Z-47122)
Source: commit e500c44 + uncommitted changes (see ../../../initial-source.patch). Criteria remain AGENT-PROPOSED, not student-approved; no student inputs existed.

## Work done
- Read prior reports (run 20261102T235903Z-41864 tester/coder, this run's coder plan). Existing suite already in tests/; reviewed, not rewritten.
- `tests/playtest.mjs` updated:
  - added `settle()` polling; I5, I6 and I7 no longer use fixed delays (prior coder-reported I5/I7 failures were short settle times vs Doom momentum).
  - I7 now holds a turn key (ArrowRight) so a wall cannot mask a stuck key; new precondition I7a.
  - T2 (35 tics/s +/-10%) now checked via `Module._cap_tic_count`; UNVERIFIED if export is missing.
- `proposed-criteria.md` (rev 2, with change log) saved here.

## Evidence
- `node tests/selftest.mjs`: all ok, exit 0.
- `playtest-quick.log`, `playtest-quick/` (results json, console log, screens): QUICK=1 against the EXISTING dist/ (built in run 20261102T235903Z-41864; NOT rebuilt here, emcc not on PATH): 0 FAIL, 32 PASS, 3 UNVERIFIED (A1, P1, G3). I5 settled in ~2.1s, I7 settled in ~0.5s, T2 = 34.98 tics/s. Exit 3 by design (QUICK never passes).
- This supports the earlier hypothesis that I5/I7 were test timing issues, in one run only; flakiness not assessed (single run).

## Not done / open findings
1. Full `tests/verify.sh` (clean rebuild + 300s soak) not run; needs `source ~/Developer/emsdk/emsdk_env.sh`.
2. dist/ identity vs the current working tree not verified.
3. Student: audio, persistence, mouse, other browsers, "faithful play" definition undecided; A1/P1/G3 remain UNVERIFIED.
4. Roles isolation is instruction-only; tests/ edits by tester only.
Manual interventions: none. Usage: not available.
