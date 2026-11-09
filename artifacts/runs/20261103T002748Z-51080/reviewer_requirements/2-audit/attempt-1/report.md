# Requirements & evidence audit — reviewer_requirements 2-audit, attempt-1
Run 20261103T002748Z-51080. Source: commit e500c44 + 24 uncommitted/untracked paths (git status at audit time; loop/ also modified, not by me). Read-only audit: no code, tests, loop/ or other roles' files touched. I re-ran nothing; I only compared the current `dist/` sha256 values with the coder/2-integrate record (identical). All technical claims are other roles' evidence, not authority.

## Assumptions
- artifacts/specification.md, acceptance-criteria.md, interface-contract.md and artifacts/state.json do NOT exist. Fallback = coder/plan (proposed-spec.md, interface-contract.md) and tester/prepare (proposed-criteria.md). All AGENT-PROPOSED; none student-approved. I did not approve them.
- Reports from earlier run ids and from coder/1-build predate render_timing/input_audio; I treat them as superseded for the current candidate.
- Candidate = shared `dist/` (doom.data, doom.js, doom.wasm, index.html, input_audio.js), hashes equal to coder/2-integrate/attempt-1/dist-sha256.txt.

## What changed since audit 1-audit
- Closed: which modules are in dist (render_timing + input_audio, linked via platform/*.c; stale dist/input_audio.js fixed by coder 2-integrate). Full `tests/verify.sh` (incl. 300 s soak) has now been run.
- New problem: the gate is unreliable. Full verify results on the same build: exit 0 (coder 1-build, 1-integrate, 2-integrate run 2), exit 1 (coder 2-integrate run 1, tester 2-test: FAIL I3.turn-left -116px). QUICK reruns: reviewer 2 of 3 failed, coder 1 of 5. Reviewer 2-review traces it to the check (350 ms fixed hold; bestShift searches only ±213 px; real shift 200-240 px aliases). Hypothesis, not yet confirmed by a fix. A green exit is therefore NOT acceptance evidence.

## Product readiness (README as proposed)
| Item | Status | Evidence / gap |
|---|---|---|
| Clean build (emcc 4.0.18) | ESTABLISHED for dist hashes above | coder/2-integrate, tester/2-test build.log exit 0. Runner's own verify (verification-1.log) FAILED: "emcc missing", so the runner produced no independent evidence. |
| Boot/render/input/timing/soak | PARTIAL | 29 PASS in tester 2-test; I3 intermittent; headless Chromium only. |
| I3 turn-left check validity | FAILING / UNRELIABLE | ~4 failures in ~10 runs on identical build. Needs tester fix without lowering thresholds, then ≥10 consecutive passes. |
| Audio (A1) | NOT_ESTABLISHED | FEATURE_SOUND undefined; silent port; scope undecided. |
| Persistence (P1) | NOT_ESTABLISHED | In-memory FS only; scope undecided. |
| Door use / level exit (G3) | NOT_ESTABLISHED | No oracle. |
| Mouse, other browsers, HiDPI, hidden tab, IME | NOT_ESTABLISHED | Untested. |
| F2/F3 input fixes, fallback-identity | NOT_ESTABLISHED | Fixes exist in code; no behavioural test; cap_fallback.c can mask a missing module. |
| Fidelity to original Doom | NOT_ESTABLISHED | No demo/determinism oracle. |

## Assignment readiness
| Obligation | Status | Next action |
|---|---|---|
| Student-approved spec & criteria before implementation | NOT_ESTABLISHED | Student freezes artifacts/acceptance-criteria.md with date; criteria were written after a build existed. |
| Documented design decisions in loop/ | PARTIAL | loop/DESIGN_DECISION_QUESTIONS.md is a draft (untracked); Evidence/Limits/Recovery thin; no numeric budgets or stop rules. I cannot edit loop/. |
| Separate role invocations | PARTIAL | Per-role prompts and output dirs exist and were used (coder, tester, reviewer, reviewer_requirements, sub-coders). |
| Permission enforcement | NOT_ESTABLISHED | Instruction-only; tests/ untracked and not protected by hash or read-only mode. Demonstrate or state honestly as unenforced. |
| MCP tools / configuration | NOT_ESTABLISHED | None found in loop/ or artifacts. |
| Independent verification with revision identity | PARTIAL | identity.txt records commit, dirty-diff hash, tests hash, WAD hash; but source-dirty.patch excludes untracked platform/*, web/input_audio.js, Makefile, tests/* (R2-7). Need a tree hash/snapshot including untracked files. Runner verify did not run (emcc not sourced). |
| Checks catch faults (mutation evidence) | NOT_ESTABLISHED | selftest covers pixel helpers only; no broken-build injection; I3 shows a check can flip on identical builds. |
| Autonomous repair of ≥2 undisclosed regressions | NOT_ESTABLISHED | None injected; needs a teammate/instructor. |
| Resumption with fresh contexts | PARTIAL | Roles resume from reports (coder 2-integrate read prior handoffs), but no staged interruption and no state.json. |
| Resource accounting | NOT_ESTABLISHED | Every report: "Usage: not available". |
| Manual intervention log | PARTIAL | Reports say "none"; no central log. |
| Failure evidence preserved | ESTABLISHED | Failing full run (tester 2-test, coder 2-integrate run 1) and quick-1/2 retained, not overwritten. |
| Deployment (hosting) | NOT_ESTABLISHED | Local http.server only. |
| Reflection / disagreement write-up | NOT_ESTABLISHED | Not started. |

## Findings (owner)
1. (tester, high) Fix the I3 measurement (shorter hold or wider/angle-independent oracle, no weaker threshold), then 10 consecutive full/quick runs with 0 failures. Until then no PASS from verify.sh counts.
2. (student) Approve or replace the proposed criteria; decide audio, persistence, mouse, browsers, G3 and the meaning of "faithful play". Without it the port cannot be called accepted.
3. (tester) Add F2/F3, hidden-tab, and implementation-identity checks (e.g. assert Module._rt and an input diagnostic export) so the fallback cannot hide a dropped module; add fault-injection runs on builds.
4. (runner/student) Make runner verify source emsdk so independent verification actually runs (verification-1.log failure); implement or honestly disclose permission isolation; add MCP config, state.json, budgets, usage accounting, stop rules. loop/ is read-only to me.
5. (coder/runner) Snapshot or commit untracked source so the tested tree is reproducible; record a tree hash including untracked files.
6. (student + instructor) Schedule regression injection, interruption/resume demo, deployment and reflection.

## Verdict
FINDINGS. Product: builds and plays in headless Chromium, but its gate is flaky and audio/persistence/G3 are unverified. Assignment: acceptance, enforcement, hidden-regression, resumption, accounting, deployment and reflection are NOT_ESTABLISHED. No gameplay check pass is final homework acceptance.

## Evidence paths
reviewer/2-review/attempt-1/{report.md,quick-1..3.log}; tester/2-test/attempt-1/{report.md,verify/identity.txt,verify/playtest-results.json}; coder/2-integrate/attempt-1/{report.md,verify-full.log,verify-full-2.log,dist-sha256.txt}; verification-1.log; reviewer_requirements/1-audit/attempt-1/report.md (all under artifacts/runs/20261103T002748Z-51080/).

## Next action
Tester fixes I3 and repeats runs; student freezes criteria and decides scope; runner fixes verify environment. Re-audit afterward. Usage: not available. Manual interventions: none.
