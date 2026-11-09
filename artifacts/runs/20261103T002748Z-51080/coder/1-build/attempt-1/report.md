# Coder 1-build report (attempt-1, run 20261103T002748Z-51080)
Source: commit e500c44 + uncommitted changes (identity: verify-full/identity.txt). Criteria are AGENT-PROPOSED (tester/prepare), not student-approved; no specification.md / acceptance-criteria.md / interface-contract.md exist.

## Work done
- Reviewed prior findings (runs ...235903Z-41864, ...001738Z-47122). Their open items: full verify not run, dist identity vs tree.
- No source changes were needed: Makefile, platform/, web/, BUILD.md from earlier attempts were left as-is. Did not touch loop/, tests/, assets/, third_party/.
- Clean rebuild with emcc 4.0.18 (`make clean && make all`, exit 0; build.log). dist hashes in dist-sha256.txt.
- Ran full `tests/verify.sh` (selftest, clean build, playtest, 300s soak) with absolute OUT_DIR: exit 0, `playtest: PASS failed=0`. Evidence: verify-full.log, verify-full/.

## Result for owned scope (build, startup, WAD packaging)
Build reproducible; WAD packaged in doom.data and the game boots, renders, and takes input in headless Chromium (B0-B6, M1, G1, I1-I7, C1-C3, U1-U4, T2 35.0 tics/s, R1-R4 soak all PASS).

## Limits / open
1. A1 audio, P1 save persistence, G3 door/level-exit are UNVERIFIED (student scope undecided / no oracle). "Exit 0" does not cover them.
2. Only headless Chromium tested; single full run, flakiness not assessed.
3. Passing checks are agent-proposed; an independent reviewer pass has not occurred.
4. verify.sh needs an absolute OUT_DIR (tester-owned; unchanged).
Manual interventions: none. Usage: not available.
