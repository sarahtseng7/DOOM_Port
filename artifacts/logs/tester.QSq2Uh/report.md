FINDINGS

# Tester prepare report (OUTPUT_DIR artifacts/logs/tester.QSq2Uh)

Not PASS: the full `tests/verify.sh` (clean rebuild + 300s soak + fault stage) was NOT run in this task, criteria remain agent-proposed (not student-approved), and A1/P1/G3/I9/H1 are UNVERIFIED.

## Source identity
- Commit e500c440656622db5ab3f8fb7df73d8b5998eeb3 + uncommitted changes (untracked platform/, web/, Makefile, tests/ are not in any git patch).
- Tested dist/ (NOT rebuilt here; emsdk not sourced): doom.wasm sha256 prefix 23aac171a5498a3c, doom.js 4ce4b34137f86765. Tests sha (verify.sh+faults.sh+playtest+selftest+frames+package.json) prefix 3725fed52050b571.
- Product source (platform/, web/) untouched. Only tests/ edited.

## Prior findings read and how they were handled
No artifacts/reports/ files exist; I read run reports under artifacts/runs/20261103T002748Z-51080 (reviewer 1/2, reviewer_requirements 1/2, tester 1/2, prepare).
| Finding | Action |
|---|---|
| R2-1 / audit: I3.turn-left flaky (~4 fails in ~10 runs) | Fixed in the check (see Test correction). 10 consecutive QUICK playtests on the same dist: 0 FAIL (quick-1..10.log). |
| R2-3 / F2,F3: key edge cases untested | New checks E1 (F5, Ctrl+R not default-prevented; ArrowUp is), E2a pagehide and E2b visibilitychange release held key, E3 repeat keydown after blur acts as fresh press, E4 dual-Ctrl held until both up (JS state only). All PASS. |
| R2-4 / F5: silent fallback | New I8: `Module._rt.frames` exists and increases (render_timing.c linked, not cap_fallback.c). Input side: I9 UNVERIFIED, needs a coder-exported diagnostic (owner: coder). |
| R2-6: hidden-tab timing | H1 listed UNVERIFIED (headless cannot throttle a real background tab). |
| Audit: "checks catch faults" only had pixel-helper selftests | New tests/faults.sh + `FAULT=` hook in playtest.mjs: browser-side injected faults against the real dist. All 4 caught (faults.log): drop-keyup -> I2 I5 C3 I7 FAIL; drop-blur -> I7; ignore-left -> I3 E2a E2b; swap-rb -> B4. verify.sh now runs it after a passing playtest (skipped in QUICK). |
| R2-2/R2-5 audio, persistence | Unchanged: A1, P1 UNVERIFIED, scope is a student decision (owner: student). |
| R2-7, R2-9, F1/F3/F4/F6 etc. | Coder/runner-owned; not addressed here. |

## Test correction (recorded separately, with reason; thresholds NOT lowered)
- rev 3: I1/I3 key hold 350ms -> 150ms (settle 900ms). Reason: 350ms turned ~200-240px, beyond bestShift's +-213px window, so the estimate aliased (I3 gave -116px on a correct turn; reviewer R2-1 frame evidence). Thresholds (|shift|>=8px, err<err0) unchanged. Added a saturation guard: a shift beyond 85% of the window now FAILs instead of aliasing. Selftest added for aliasing beyond the window and for an ~90px shift.
- Observed after correction: I1 -60/-98px, I3 +56/+78/+84px: the same sign, far from the window edge. The reviewer's aliasing hypothesis was not directly instrumented; the evidence is that 10/10 runs pass, with shifts well inside the window. The left/right asymmetry (56 vs 98px) was not investigated.

## Evidence (in this OUTPUT_DIR)
quick-1..10.log + quick-N/ (screens, playtest-results.json), repeat-summary.txt, faults.log + faults/<fault>.log and dirs, repeat.sh (the exact driver). Selftest: `node tests/selftest.mjs` all ok.

## Unresolved (owner)
1. Run the full `source ~/Developer/emsdk/emsdk_env.sh && tests/verify.sh` on the integrated tree (clean build, 300s soak, fault stage), absolute OUT_DIR (owner: tester next task/runner).
2. Student: approve or replace proposed criteria (still none in artifacts/); decide audio/persistence scope.
3. Coder: export an input-delivery diagnostic so I9 can be checked.
4. G3 door/level-exit and "faithful play" oracle (e.g. demo/determinism) still absent.
5. Faults injected are browser-side only; none rebuild the C source (e.g. dropped key release in C queue, frozen loop, linker fallback). The regression-injection requirement is still the student/instructor's to run.

## Assumptions
Doom default keys; headless Chromium via Playwright 1.49.1; canvas id `canvas`; 320x200 HUD layout; screenshots-based inference. Usage: not available. Manual interventions: none.
