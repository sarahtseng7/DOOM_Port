# Agent session notes 26 (2026-11-02)

Role: unassigned (same generic prompt "Follow your role prompt..." as notes 5-25)
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (same set as notes 25)
Status: BLOCKED

## Work performed
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/CODER.md, loop.sh, agents.yaml, notes 25, loop.log.
- No source changed; loop/ untouched.

## Reason for BLOCKED
Invocation names no role, task, approved spec, acceptance criteria, interface contract, or run manifest. Writable paths depend on role, so none can be assumed. CODER.md says to record BLOCKED rather than invent requirements. Findings from notes 22-25 are unchanged and unresolved.

## Next action (responsible: student/runner)
- Make the invocation role-specific (prompt path, RUN_ID/TASK_ID, spec/acceptance/contract paths). loop.sh sends one identical message to every agent.
- Set ANTHROPIC_API_KEY for loop.sh runs (missing in earlier loop.log).
- Provide the Makefile and tests/playtest.mjs that tests/verify.sh expects, under proper role authority.

Usage: not available. Manual interventions: none by agent.
