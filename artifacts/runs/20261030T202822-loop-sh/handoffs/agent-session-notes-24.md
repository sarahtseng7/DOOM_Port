# Agent session notes 24 (2026-11-02)

Role: unassigned (same generic prompt as notes 5-23)
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (same set as notes 23)
Status: BLOCKED

## Work performed
- Re-read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/CODER.md, loop.sh, agents.yaml, notes 23.
- No source changed; loop/ untouched. platform/ and web/ remain stubs.
- tests/verify.sh runs `make clean`, `make all`, and `node tests/playtest.mjs`. No root Makefile or tests/playtest.mjs exists, so it cannot pass.

## Reason for BLOCKED
The invocation names no role, task, spec, acceptance criteria, or interface contract. loop.sh sends the same generic message to all 7 agents, so I cannot tell which role's writable paths apply. CODER.md says to record BLOCKED rather than invent requirements. Findings from notes 22/23 are unchanged and unresolved.

## Next action (responsible: student/runner)
- Pass the role prompt path, RUN_ID/TASK_ID, and the approved spec, acceptance-criteria and contract paths in each invocation.
- Set ANTHROPIC_API_KEY (loop.log shows it missing).
- Add the Makefile/tests/playtest.mjs that verify.sh expects, under the proper role authority.

Usage: not available. Manual interventions: none by agent.
