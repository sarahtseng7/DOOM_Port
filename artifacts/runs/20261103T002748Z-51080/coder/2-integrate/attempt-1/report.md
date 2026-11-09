# coder 2-integrate attempt-1 (run 20261103T002748Z-51080)
Status: FINDINGS. The final full verify passed, but one earlier full run failed on I3, A1/P1/G3 are UNVERIFIED, and the criteria are agent-proposed.
Source: commit e500c44 + uncommitted changes (source-commit.txt, source-status.txt). source-dirty.patch holds the diff of tracked files only; untracked files (platform/*, web/input_audio.js, tests/*, Makefile) are not in it (reviewer F9 only partly addressed). Hashes of the tested dist: dist-sha256.txt. Identity: verify-full*/identity.txt.
Assumption: no artifacts/specification.md, acceptance-criteria.md or interface-contract.md exists, so I used the agent-proposed coder/plan and tester/prepare proposals. I treated none as approved.

## Handoffs read
coder/1-integrate, coder/2-build, coder_input_audio/2-input, coder_render_timing/2-render, tester/1-test, reviewer/1-review, reviewer_requirements/1-audit.

## Integration state found
The shared dist/input_audio.js (sha 75a7bc3c…) was STALE. It lacked the reviewer F2 (refocus-held key) and F3 (browser shortcuts) fixes that coder_input_audio/2-input put in web/input_audio.js (sha 8308f801…). The earlier passing verify runs therefore did not exercise those fixes. The clean rebuild now ships the current file (dist and web hashes match).

## Changes (owned files only)
- web/index.html: added `image-rendering: pixelated; image-rendering: crisp-edges;` to the canvas (reviewer F8). Chromium honours `pixelated`; `crisp-edges` is a fallback for browsers that lack it. Not visually checked at HiDPI.
- platform/input_audio.c: comment now states that sound is off because the Makefile does not define FEATURE_SOUND (reviewer F7). No behaviour change.
- No changes to loop/, tests/, assets/, third_party/.
- Already done by earlier coders (I confirmed they are present): F1 cap_frame removed, F4 ASYNCIFY stack 64K, F6 scoped -w and -MMD.

## Evidence
- Run 1 `tests/verify.sh` (verify-full.log, verify-exit.txt = 1): clean build OK, **FAIL I3.turn-left shift=-116px**, all other checks passed, failed=1. Kept as is.
- 3 QUICK playtest reruns on the same dist (rerun-1..3.log): I3 passed each time, shift=204px. They exit 3 by design, so they are not a pass.
- Run 2 full `tests/verify.sh` (verify-full-2.log, verify-exit-2.txt = 0): clean build, `playtest: PASS failed=0 unverified=3`, 300 s soak included.
- Result: I3 failed 1 of 5 runs on an identical build. I have not found the cause. A guess is that bestShift aliases once the left-turn shift (~200 px) gets near the search range limit, or that turn timing varies. That is unconfirmed. The check lives in tests/ (tester-owned) and I did not change it.

## Limits
- The shipped F2/F3 input fixes still have no behavioural test, so they are verified by inspection only. The full pass shows no regression, not that the fixes work.
- Headless Chromium only. Hidden-tab timing, other browsers, mouse, IME and HiDPI are untested.
- A1 audio, P1 persistence and G3 door/exit are UNVERIFIED (scope undecided / no oracle).
- No independent review has covered F8, the F7 comment or this rebuild.
- Do not report PASS while I3 is flaky and the criteria are unapproved.

## Findings / owners
1. tester: investigate the intermittent I3 failure (run 1 evidence in verify-full/playtest*); repeat runs to measure the rate; add F2/F3 and implementation-identity checks.
2. reviewer: re-check F8, F7 and the stale-dist finding.
3. student: approve the criteria; decide audio/persistence/mouse scope.
4. coder (later): commit or snapshot untracked source for F9.

## Next action
Tester triages I3 flakiness on the current tree. Manual interventions: none. Usage: not available.
