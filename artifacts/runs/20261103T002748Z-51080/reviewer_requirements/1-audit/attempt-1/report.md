# Requirements & evidence audit — reviewer_requirements, attempt-1
Run 20261103T002748Z-51080, task 1-audit. Source commit e500c44 + 27 uncommitted/untracked paths (git status at audit time; loop/ also modified, not by me). Read-only audit: no code, tests, loop/, or other roles' files touched. No commands were re-run (no build, no playtest); all technical claims below are from other roles' reports and are evidence, not authority.

## Assumptions
- artifacts/specification.md, acceptance-criteria.md, interface-contract.md and artifacts/state.json do NOT exist. Fallback = run 20261103T001738Z-47122 coder/plan (proposed-spec.md, interface-contract.md) and tester/prepare (proposed-criteria.md rev 2). All are AGENT-PROPOSED; none is student-approved.
- This run (…51080) contains only manifest.txt (no coder/tester outputs yet), so there is no current-run candidate evidence.
- loop/DESIGN_DECISION_QUESTIONS.md is a student draft: Evidence, Limits and Recovery answers are thin ("compilation, screenshots, plausible explanations…" is listed as success, which the README says is insufficient). It is not an approved acceptance document.

## Product readiness (README R1-R6 as proposed)
| Item | Status | Evidence / gap |
|---|---|---|
| Clean build (emcc 4.0.18) | PARTIAL | Coder 1-build of run …47122 reports `make clean all` exit 0. Predates the current tree? dist/ files are timestamped 16:52 and platform/render_timing.c, input_audio.c, web/input_audio.js (16:37-16:40) exist, but prior reports say these modules are "not delivered"/absent. Which modules are in the tested dist is NOT_ESTABLISHED. |
| Quick playtest | PARTIAL | 0 FAIL, 32 PASS, 3 UNVERIFIED (A1, P1, G3), twice (tester + coder), QUICK exits 3 by design. |
| Full 300s soak / `tests/verify.sh` | NOT_ESTABLISHED | Never run in any run. |
| Audio, persistence, door/exit, mouse, other browsers | NOT_ESTABLISHED | Student scope undecided; A1/P1/G3 UNVERIFIED. "Faithful play" undefined (no demo/determinism check). |
| I5/I7 timing hypothesis | WEAK | Earlier failures attributed to test timing; tester then loosened to settle-polling. Two passes on one build, flakiness unassessed. Criteria were changed in response to failure (logged in rev 2 change log, but with no student sign-off) — must not count as evidence the port was right. |

## Assignment readiness
| Obligation | Status | Next action |
|---|---|---|
| Student-approved spec & criteria written before implementation | NOT_ESTABLISHED | Criteria were written by the tester agent after the build existed (run …41864 coder 1-build preceded criteria). Student must review/freeze artifacts/acceptance-criteria.md and record approval + date. |
| Documented design decisions in loop/ | PARTIAL | Draft answers exist; Evidence/Limits/Authority truncated or vague; no numeric time/token/retry budgets or stop rules distinguishing success/exhaustion/stall. |
| Separate coder/reviewer/tester invocations | PARTIAL | Prompts and per-role output dirs exist. |
| Permission enforcement | NOT_ESTABLISHED | loop.sh states isolation is not implemented; every report says instruction-only. No demonstration that coder cannot edit tests/. Today tests/ is untracked and unprotected by hash/read-only mode. |
| MCP tools / handoffs | NOT_ESTABLISHED | No MCP config or tool definitions found in artifacts evidence. |
| Independent verification w/ revision identity | PARTIAL | Reports cite commit + "uncommitted changes", but the tree is dirty and untracked; initial-source.patch exists for earlier runs but dist hash vs. tree for the current candidate is unchecked. Recommend recording a tree hash (including untracked files). |
| Checks catch faults (mutation evidence) | PARTIAL | tests/selftest.mjs covers pixel helpers only (black/swapped/transparent/static/mis-shifted). No evidence that broken *builds* (e.g. dropped key release, BGR swap, frozen loop) fail the playtest. |
| Autonomous repair of ≥2 undisclosed regressions | NOT_ESTABLISHED | None injected. Needs a teammate/instructor. |
| Resumption with fresh contexts | NOT_ESTABLISHED | Runs resume by reading prior reports, but no interruption was staged and no state.json exists. loop.log of 20261030T202822-loop-sh shows an earlier failure (missing ANTHROPIC_API_KEY). |
| Resource accounting | NOT_ESTABLISHED | All reports: "Usage: not available". |
| Manual interventions log | PARTIAL | Reports say "none"; no central log, and student edits to loop/ are uncommitted. |
| Deployment (hosting) | NOT_ESTABLISHED | Only local http.server; no hosting decision. |
| Reflection / disagreement write-up | NOT_ESTABLISHED | Not started. |

## Findings (owner)
1. (student) Approve or replace the agent-proposed spec and criteria; until then no result is "accepted". Decide audio, persistence, mouse, browsers, faithful-play definition.
2. (tester) Run full `tests/verify.sh` with absolute OUT_DIR on the current tree; record tree hash/dist hash. Add fault-injection runs proving checks fail on broken builds, and repeat quick runs for I5/I7 flakiness.
3. (coder) Report whether render_timing / input_audio modules are in dist; reconcile stale "absent" statements in prior reports; no delivery report exists for them.
4. (student/runner) Implement real permission enforcement (read-only tests/ for coder, hash check of protected files) or document honestly as unenforced; add MCP config.
5. (student/runner) Add state.json, budgets, usage accounting, stop rules.
6. (student + instructor) Schedule regression-injection, interruption/resume demonstration, and reflection.
7. (reviewer note) Prior builds shared dist/; earlier run evidence must be preserved — currently preserved.

## Next action
Student to freeze criteria (finding 1); tester to run the full verify; coder to clarify module status. Re-audit afterward.
Usage: not available. Manual interventions by this role: none.
