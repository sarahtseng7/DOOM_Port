# Agent session notes 27 (2026-11-02)

Role: unassigned (same generic prompt "Follow your role prompt..." as notes 5-26)
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (loop/agents.yaml, loop/loop.sh modified; artifacts/runs/, loop/DESIGN_DECISION_QUESTIONS.md, loop/prompts/, tests/verify.sh untracked)
Status: BLOCKED

## Work performed
- Re-read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/CODER.md, agents.yaml, notes 26, loop.log.
- No source changed; loop/ untouched.

## Reason for BLOCKED
Invocation names no role, task, approved spec, acceptance criteria, interface contract, or run manifest. Writable paths depend on role, so none can be assumed; prompts say to record BLOCKED rather than invent requirements. Findings from notes 22-26 are unchanged and unresolved. No prior findings could be addressed because none are specific to an assignable role.

## Next action (responsible: student/runner)
- Make the invocation role-specific (prompt path, RUN_ID/TASK_ID, spec/acceptance/contract paths).
- Set ANTHROPIC_API_KEY for loop.sh runs (missing in loop.log).
- Provide the Makefile and tests/playtest.mjs that tests/verify.sh expects, under proper role authority.

Usage: not available. Manual interventions: none by agent.
