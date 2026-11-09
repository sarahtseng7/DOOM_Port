# Agent session notes 9 (2026-11-02)

Role: unassigned (same generic prompt as notes 5-8)
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (see ../manifest.txt)
Status: BLOCKED

## Work performed
- Re-read AGENTS.md, READMEs, loop/prompts/CODER.md, manifest.txt, loop.log and notes 8.
- Repo state unchanged vs notes 8: platform/ and web/ are stubs; tests/ has only a README; no tests/verify.sh, build/, dist/ or artifacts/state.json.
- No source files changed. loop/ untouched.

## Reason for BLOCKED
Unchanged from notes 5-8: no role ID, RUN_ID, TASK_ID, ATTEMPT_ID, approved spec, acceptance criteria or interface contract supplied. Writable paths are role-specific, so guessing a role could breach permissions. loop.log shows earlier runs failed on a missing ANTHROPIC_API_KEY.

## Next action (responsible: student/runner)
- Pass role ID, IDs and spec/criteria/contract paths in the invocation (loop.sh does not pass the agent name).
- Create tests/verify.sh or change what loop.sh calls.
- Resolve the API key setup for docker agent.

Usage: not available. Manual interventions: none by agent.
