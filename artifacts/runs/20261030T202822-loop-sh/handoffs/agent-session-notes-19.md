# Agent session notes 19 (2026-11-02)

Role: unassigned (same generic prompt as notes 5-18)
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (see ../manifest.txt)
Status: BLOCKED

## Work performed
- Read AGENTS.md, READMEs, loop.sh, agents.yaml, notes 18. No source changed; loop/ untouched.
- platform/ and web/ are still stubs (44 and 17 lines). No Makefile, tests/playtest.mjs, artifacts/state.json, build/ or dist/.

## Reason for BLOCKED
The invocation ("Follow your role prompt...") names no role, RUN_ID/TASK_ID, spec or acceptance criteria, so I cannot tell which of the six role prompts applies. I did not guess a role: acting as coder, reviewer or tester on a guess would break the role separation the assignment requires.

## Changes since notes 18
- agents.yaml now references CODER_INPUT_AUDIO.md correctly.
- tests/verify.sh now exists, but runs `make clean; make all; node tests/playtest.mjs`. Neither the Makefile nor playtest.mjs exists, so it fails immediately.

## Next action (responsible: student/runner)
- Make each agent's invocation name its role and task (per-agent prompts in loop.sh), or tell me the role directly.
- Provide acceptance criteria and a Makefile/build command, and playtest.mjs (tests/ is protected from the coder).
- Set ANTHROPIC_API_KEY for docker agent (see logs/loop.log).

Usage: not available. Manual interventions: none by agent.
