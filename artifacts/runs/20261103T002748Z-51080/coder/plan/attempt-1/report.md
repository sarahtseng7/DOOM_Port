# Coder plan report — attempt-1
Run 20261103T002748Z-51080, role coder, task plan. Source commit e500c44 plus
uncommitted changes (source-status.txt). Planning only; no game code changed.

## Work done
- Read AGENTS.md, READMEs, manifest, loop/prompts/CODER.md, and prior runs
  (20261103T001738Z-47122 coder plan/1-build, tester prepare; 20261102T235903Z-41864).
- No artifacts/specification.md, acceptance-criteria.md or interface-contract.md exist,
  and this run has no tester/prepare output. Wrote `proposed-spec.md` and
  `interface-contract.md` here, carried forward from the prior run rather than
  creating conflicting scope. Both are AGENT-PROPOSED; no student approval claimed.
- Shared header `platform/capstone_bridge.h` stays at CAP_BRIDGE_VERSION 2 (matches
  doomgeneric_wasm.c exports and cap_fallback.c weak defaults). Only change: the
  comment pointing at this run's contract.
- Did not touch loop/, tests/, assets/, third_party/ or criteria.

## Evidence
- Header compiles on host (`cc -fsyntax-only`, CAP_BRIDGE_VERSION==2 -> HDR_OK). This is not an Emscripten build.
- `which emcc`: not found on default PATH. Version 4.0.18 not re-verified here;
  prior run's 1-build recorded 4.0.18 after sourcing ~/Developer/emsdk/emsdk_env.sh.
- Nothing rebuilt or retested, so no claim about the current dist/.

## Unresolved findings (carried forward)
1. (student) Audio, persistence, mouse, non-Chromium, and the definition of "faithful play" are undecided. Faithful-play acceptance is not complete.
2. (tester) Full tests/verify.sh with the 300s soak has never run; A1, P1, G3 UNVERIFIED in the quick runs.
3. (tester) verify.sh breaks with a relative OUT_DIR.
4. (coder_render_timing / coder_input_audio) Modules do not exist; weak fallbacks in use.
5. (runner) Role isolation is instruction-only; the earlier loop run failed for lack of ANTHROPIC_API_KEY (not reproduced).

## Next action
Specialists implement against the header. Tester runs full verify.sh on a rebuild. Student decides the undecided scope items.
Usage: not available. Manual interventions: none.
