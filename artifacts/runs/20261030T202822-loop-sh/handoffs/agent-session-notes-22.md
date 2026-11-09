# Agent session notes 22 (2026-11-02)

Role: unassigned (same generic prompt as notes 5-21)
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (see ../manifest.txt)
Status: BLOCKED

## Work performed
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/CODER.md, notes 21, manifest and loop.log tail. No source changed; loop/ untouched.
- platform/ and web/ remain stubs; no Makefile, no dist/, no artifacts/state.json.

## Reason for BLOCKED
Invocation ("Follow your role prompt...") names no role, task, spec, acceptance criteria or interface contract. Six role prompts exist in loop/prompts/; none is selected. CODER.md itself says to record BLOCKED when required inputs are absent. Prior findings (notes 21) are unaddressed because nothing upstream changed.

## Next action (responsible: student/runner)
- Make loop.sh pass role-specific prompts naming the prompt file, RUN_ID/TASK_ID, spec, acceptance-criteria and contract paths.
- Set ANTHROPIC_API_KEY for docker agent (loop.log shows it missing).

Usage: not available. Manual interventions: none by agent.
