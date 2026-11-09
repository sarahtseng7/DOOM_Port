# Coder plan report — attempt-1
Run 20261103T001738Z-47122, role coder, task plan. Source commit e500c44 plus
uncommitted changes (see source-status.txt in this dir and ../../../initial-source.patch).
Plan only; no game implementation changed.

## Work done
- Read AGENTS.md, READMEs, manifest, and prior run reports (20261102T235903Z-41864 coder plan/1-build, tester prepare; 20261030T202822-loop-sh log).
- Wrote `proposed-spec.md` and `interface-contract.md` here (AGENT-PROPOSED; no student approval claimed).
- Edited `platform/capstone_bridge.h`: CAP_BRIDGE_VERSION 1 -> 2 (cap_tic_count was added without a bump), documented weak/strong override, repointed contract path to this run.
- Did not touch loop/, tests/, assets/, third_party/, or any criteria.

## Evidence
- Header compiles with host `cc -fsyntax-only` against doomgeneric.h and CAP_BRIDGE_VERSION==2 (HDR_OK). Not an Emscripten build.
- `which emcc`: not found on default PATH (a prior run used ~/Developer/emsdk). Version 4.0.18 not re-verified; dist/ from the prior run exists but was not rebuilt or retested here.

## Unresolved findings carried forward
1. (tester) I5/I7 FAIL in prior quick playtest; coder judged settle times (900/700ms) too short vs Doom momentum — UNCONFIRMED by tester.
2. (student) Audio, persistence, mouse, non-Chromium, "faithful play" definition undecided.
3. Full 300s soak never run; A1, P1, G3, T2 were UNVERIFIED in the quick run.
4. (coder, later) Specialist modules render_timing/input_audio don't exist; weak fallbacks in use.
5. (coder, later) BUILD.md not written.
6. (runner) Earlier loop run failed for missing ANTHROPIC_API_KEY; not reproduced here.
7. This run has no tester/prepare output; fallback criteria exist only in the prior run. Roles are instruction-enforced only.

## Next action
Tester: re-evaluate I5/I7 timing, add a cap_tic_count hook for T2, run full tests/verify.sh on a rebuilt tree. Coder: write BUILD.md, rebuild, integrate specialist modules when delivered. Student: decide the undecided scope items.
Usage: not available. Manual interventions: none.
