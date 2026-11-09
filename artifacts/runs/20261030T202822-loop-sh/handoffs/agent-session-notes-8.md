# Agent session notes 8 (2026-11-02)

Role: unassigned (prompt: "Follow your role prompt. Complete your work, address prior findings, and save results under artifacts/.")
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (see ../manifest.txt)
Status: BLOCKED

## Work performed
- Re-read AGENTS.md, READMEs, loop/prompts/CODER.md, manifest.txt, loop.log and notes 7.
- Repo unchanged since notes 7: platform/ and web/ are stubs, tests/ has only a README, no tests/verify.sh, build/, dist/, or artifacts/state.json.
- No source files changed. loop/ untouched.

## Reason for BLOCKED
Same as notes 5-7. The invocation names no role ID, RUN_ID, TASK_ID, ATTEMPT_ID, approved spec, acceptance criteria or interface contract. Writable paths differ per role, so guessing a role could breach permissions. The loop.log also shows earlier runs failed on a missing ANTHROPIC_API_KEY.

## Next action (responsible: student/runner)
- Supply role ID, IDs and spec/criteria/contract paths in the invocation (the agent name is not passed by loop.sh).
- Create tests/verify.sh or change what loop.sh calls.

Usage: not available. Manual interventions: none by agent.
