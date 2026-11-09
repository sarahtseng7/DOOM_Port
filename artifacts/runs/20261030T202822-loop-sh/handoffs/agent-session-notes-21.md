# Agent session notes 21 (2026-11-02)

Role: unassigned (same generic prompt as notes 5-20)
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (see ../manifest.txt)
Status: BLOCKED

## Work performed
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/loop.sh, loop/agents.yaml, loop/prompts/CODER.md, notes 20. No source changed; loop/ untouched.
- platform/ and web/ are still stubs; no Makefile, no tests/playtest.mjs, no artifacts/state.json.

## Reason for BLOCKED
Invocation ("Follow your role prompt...") names no role, task, spec or acceptance criteria. Six role prompts exist; the text does not select one. loop.sh sends the identical string to every agent, and agents.yaml instructions are not visible to me. I did not guess a role, because role separation is the point of the assignment. Prior run log also shows docker agent failing for lack of ANTHROPIC_API_KEY.

## Next action (responsible: student/runner)
- Have loop.sh pass role-specific prompts naming the prompt file, RUN_ID/TASK_ID, spec and acceptance-criteria paths.
- Provide approved acceptance criteria and tests; set ANTHROPIC_API_KEY for docker agent.

Usage: not available. Manual interventions: none by agent.
