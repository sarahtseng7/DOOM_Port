# Agent session notes 28 (2026-11-02)

Role: unassigned (same generic prompt "Follow your role prompt..." as notes 5-27)
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (loop/agents.yaml, loop/loop.sh modified; artifacts/runs/, loop/DESIGN_DECISION_QUESTIONS.md, loop/prompts/, tests/verify.sh untracked)
Status: BLOCKED

## Work performed
- Re-read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/CODER.md, loop.sh, loop.log, notes 27.
- No source changed; loop/ untouched.

## Reason for BLOCKED
The invocation names no role, task, approved specification, acceptance criteria, interface contract, or run manifest. Writable paths depend on role, so none can be assumed. loop/prompts/CODER.md says to record BLOCKED rather than invent requirements. The only existing run (20261030T202822-loop-sh) failed because ANTHROPIC_API_KEY was unset, so no agent work was done in it. Unresolved findings from notes 22-27 are unchanged.

## Next action (responsible: student/runner)
- Invoke a specific role (prompt path, RUN_ID/TASK_ID, spec/acceptance/contract paths).
- Set ANTHROPIC_API_KEY for loop.sh runs.
- Provide the Makefile and tests/playtest.mjs that tests/verify.sh expects, under proper role authority.

Usage: not available. Manual interventions: none by agent.
