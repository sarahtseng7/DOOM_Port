# Agent session notes 25 (2026-11-02)

Role: unassigned (same generic prompt "Follow your role prompt..." as notes 5-24)
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (same set as notes 24)
Status: BLOCKED

## Work performed
- Re-read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/CODER.md, loop.sh, notes 24, loop.log.
- Checked repo state: no Makefile, no tests/playtest.mjs, platform/ and web/ still stubs. No source changed; loop/ untouched.

## Reason for BLOCKED
Invocation names no role, task, approved spec, acceptance criteria, interface contract, or run manifest. Without a role I cannot determine writable paths. CODER.md says to record BLOCKED rather than invent requirements. Findings from notes 22-24 are unchanged and unresolved. loop.log also shows ANTHROPIC_API_KEY was missing for the earlier run.

## Next action (responsible: student/runner)
- Pass role prompt path, RUN_ID/TASK_ID, and spec/acceptance/contract paths per invocation (loop.sh sends one generic message to all agents).
- Set ANTHROPIC_API_KEY for loop.sh runs.
- Provide the Makefile and tests/playtest.mjs that tests/verify.sh expects, under proper role authority.

Usage: not available. Manual interventions: none by agent.
