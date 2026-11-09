# coder 3-build attempt-1 (run 20261103T002748Z-51080)
Status: PASS for owned scope (build, startup, WAD packaging). Project NOT complete (see Limits).

## Source
Commit e500c440 + uncommitted changes. This attempt preserves untracked files too (reviewer R2-7): `source-snapshot.tgz` (19 files: Makefile, BUILD.md, platform/, web/, tests/ excluding node_modules), `source-files.txt`, `source-files-sha256.txt`, `source-dirty.patch` (tracked diff), `source-status.txt`, `source-commit.txt`.
Criteria are AGENT-PROPOSED; no student-approved specification/criteria/contract exists in artifacts/. I did not invent approval.

## What I did
- Found that the runner's verification (`verification-1/2.log`: "emcc missing") produced no evidence because emsdk was not sourced. I sourced `~/Developer/emsdk/emsdk_env.sh` (emcc 4.0.18) myself. The runner fix is in loop/, which I may not edit: reported to the student (R2-9).
- Clean rebuild: `make clean && make all` exit 0, 0 warnings (build.log). No Makefile/source changes were needed this attempt.
- WAD packaging: `dist/doom.data` sha256 equals `assets/doom1.wad` (1d7d43be...), so the preload embeds the unmodified WAD at /doom1.wad. Hashes: dist-sha256.txt.
- Full `tests/verify.sh` (selftest, clean build, playtest, 300 s soak): exit 0, `playtest: PASS failed=0 unverified=3`, T2 34.98 tics/s. Evidence: verify-full.log, verify-full/, verify-exit.txt.

## Limits / open
- Unverified: A1 audio, P1 persistence, G3 door/level exit.
- Earlier tester run 2 saw I3.turn-left FAIL and the reviewer saw it flaky (tester-owned check, R2-1). It passed in this single run; that does not show the flake is fixed. Needs repeated runs by the tester.
- Open outside my scope: R2-3 (tester), R2-4 silent fallback in cap_fallback.c (tester+coder), R2-5 persistence scope (student), R2-6 hidden-tab, R2-8 per-frame allocation.
- Headless Chromium only, one run. Passing shows no regression, not fault detection.
- I did not modify tests/, loop/, assets/, third_party/. Manual interventions: none. Usage: not available.

## Next action
Tester: repeat verify >=10x to assess I3 flakiness, add R2-3/R2-4 checks. Student: fix runner emsdk sourcing, approve criteria, decide audio/persistence scope.
