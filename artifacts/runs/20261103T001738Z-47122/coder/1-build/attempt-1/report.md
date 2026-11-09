# Coder 1-build report (attempt-1, run 20261103T001738Z-47122)
Source: commit e500c44 + uncommitted changes (dist hashes: dist-sha256.txt).

## Work done
- Reviewed the existing Makefile, startup (platform/doomgeneric_wasm.c) and WAD packaging; no code changes were needed.
- Wrote `BUILD.md` (previously carried-forward finding #5).
- Did not touch loop/, tests/, assets/, third_party/.

## Evidence
- emcc 4.0.18 after sourcing emsdk; `make clean && make all` exit 0 (build.log, 0 failures).
- `QUICK=1 tests/verify.sh` against that fresh build (verify-quick.log, verify-quick/): 0 FAIL, A1/P1/G3 UNVERIFIED. I5 settled 2.08s, I7 0.48s, T2 34.97 tics/s. Exit 3 by design.

## Findings addressed
- Prior I5/I7 failures: not reproduced on a fresh build (second run supporting test-timing hypothesis; flakiness still unassessed).
- Prior "dist not identical to tree": now rebuilt from the current tree.
- BUILD.md: written.

## Open
1. Full verify.sh (300s soak) not run — only QUICK.
2. verify.sh breaks with a relative OUT_DIR (it cd's into tests/); tester-owned, not changed. Use an absolute OUT_DIR.
3. A1 audio, P1 persistence, G3 door/exit, other browsers: student scope/undecided; specialist modules still absent.
Status is FINDINGS because the full acceptance run has not been done.
Usage: not available. Manual interventions: none.
