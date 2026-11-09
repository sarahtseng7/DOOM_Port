FINDINGS

# Coder report (OUTPUT_DIR artifacts/logs/coder.9PHBOq)

Source: commit e500c44 + uncommitted changes. Toolchain: emcc 4.0.18 (emsdk sourced).

## Work
Read artifacts/reports/tester.md. Build was already working; the coder-owned open item was tester finding #3 (I9: no way to tell whether input_audio.c or the cap_fallback.c queue is linked).
- platform/capstone_bridge.h: CAP_BRIDGE_VERSION 2->3; added exports `cap_input_impl()` (1 = input_audio.c), `cap_input_delivered_count()`, `cap_input_dropped_count()`; weak declarations of the specialist's existing `cap_input_delivered/dropped`.
- platform/doomgeneric_wasm.c: implements the three wrappers (weak-symbol check, so the fallback build still links and reports impl=0, counts 0).
- Makefile: added the three exports to EXPORTED_FUNCTIONS.
No specialist files, tests/, or loop/ touched.

## Evidence
- `make` (incremental, then the changed objects) succeeded; dist/ regenerated.
- Ad-hoc Playwright check (/tmp, not saved): after load `_cap_input_impl()=1`, `_cap_ready()=1`, `_cap_bridge_version()=3`; after one ArrowLeft press+release `_cap_input_delivered_count()` went 0->2, dropped 0.
- Not run: tests/verify.sh, a clean `make clean && make`, the fallback-linked (impl=0) path.

## Unresolved (owner)
1. Tester: add I9 using `Module._cap_input_impl()==1` and the delivered counter (tests/ is not mine).
2. Tester/runner: full tests/verify.sh on this build (the dist changed since the tester's hashes).
3. Student: approve criteria; audio/persistence scope. Bridge contract still agent-proposed.
4. Bridge v3 is a behavior-neutral addition, but the weak-symbol approach is untested with input_audio.c removed.

## Assumptions
Specialist's `cap_input_delivered/dropped` are non-static globals (confirmed in input_audio.c:85-86). Manual interventions: none.
