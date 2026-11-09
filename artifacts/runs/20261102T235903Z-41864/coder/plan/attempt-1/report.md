# Coder plan report — attempt-1
Run 20261102T235903Z-41864, role coder, task plan. Source commit e500c44 plus
uncommitted: M loop/agents.yaml, M loop/loop.sh; untracked artifacts/runs/,
loop/DESIGN_DECISION_QUESTIONS.md, loop/prompts/, tests/verify.sh (not mine);
new by this attempt: platform/capstone_bridge.h.

## Work done
- Read AGENTS.md, READMEs, platform/README, engine sources (doomgeneric.c,
  d_main.c, d_loop.c, i_timer.c, i_input.c, i_video.c), prior run 20261030T202822-loop-sh.
- Wrote `proposed-spec.md` and `interface-contract.md` (this dir) — AGENT-PROPOSED.
- Created `platform/capstone_bridge.h` (version 1). Header compiles with host cc
  against doomgeneric.h (check only; not an Emscripten build).
- No game implementation; doomgeneric_wasm.c, web/, Makefile untouched.

## Prior findings reviewed
- Prior run notes 2–30: earlier agents were BLOCKED for lacking a role and, in
  loop.log, ANTHROPIC_API_KEY was unset. Role is now supplied; resolved for this
  invocation. Key setup remains a runner/student matter.

## Findings
1. (tester) tests/verify.sh hard-codes an absolute path and needs `make` and
   tests/playtest.mjs, neither of which exists yet. Expected until the build task.
2. (student/runner) emcc is not on PATH on this host; install emsdk 4.0.18 or use
   the Dockerfile before the build task.
3. (student) Audio, persistence, mouse, non-Chromium browsers are UNDECIDED.
   Faithful-play acceptance cannot be called complete until decided.
4. (note) Fallback criteria path (tester/prepare/attempt-1/proposed-criteria.md)
   is tester-owned and did not exist; I did not create it.
5. (note) manifest.txt says permission isolation is not implemented; role
   boundaries here are instructions only.

## Commands
- `cc -Iplatform -Ithird_party/doomgeneric /tmp/hdrchk.c` — passed (HDR_OK).
- `which emcc` — not found.

## Next action
Coder build task: implement DG adapters + main in doomgeneric_wasm.c, Makefile
(clean/all), web/index.html loader, BUILD.md; integrate render_timing and
input_audio modules once their owners deliver. Specialists proceed against
platform/capstone_bridge.h.

Usage: not available. Manual interventions by agent: none. Student approval: none claimed.
