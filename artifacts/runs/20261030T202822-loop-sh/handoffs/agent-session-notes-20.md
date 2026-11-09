# Agent session notes 20 (2026-11-02)

Role: unassigned (same generic prompt as notes 5-19)
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (see ../manifest.txt)
Status: BLOCKED

## Work performed
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/CODER.md, loop.sh, notes 19. No source changed; loop/ untouched.
- Makefile, tests/playtest.mjs and artifacts/state.json still do not exist; platform/ and web/ are still stubs.

## Reason for BLOCKED
The invocation ("Follow your role prompt...") names no role, task, spec or acceptance criteria. Six role prompts exist in loop/prompts/. The generic invocation text in loop/loop.sh does not select one. I did not guess a role, because the role separation is the point of the assignment.

## Next action (responsible: student/runner)
- Have loop.sh pass a role-specific prompt to each agent, naming the role prompt file, RUN_ID/TASK_ID, spec and acceptance-criteria paths.
- Provide the Makefile/build command and tests/playtest.mjs (tests/ is protected from the coder).
- Set ANTHROPIC_API_KEY for docker agent.

Usage: not available. Manual interventions: none by agent.
