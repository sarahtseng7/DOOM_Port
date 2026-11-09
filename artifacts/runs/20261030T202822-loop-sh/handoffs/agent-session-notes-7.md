# Agent session notes 7 (2026-11-02)

Role: unassigned (prompt: "Follow your role prompt. Complete your work, address prior findings, and save results under artifacts/.")
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (see ../manifest.txt)
Status: BLOCKED

## Work performed
- Re-read AGENTS.md, the READMEs, loop/prompts/CODER.md, manifest.txt, loop.log and notes 6.
- Repo state unchanged from notes 6: platform/ and web/ hold only stubs, tests/ only a README, no build/, dist/, capstone_bridge.h or artifacts/state.json.
- No source files changed. loop/ untouched.

## Reason for BLOCKED
Same as notes 5 and 6. The invocation names no role ID, RUN_ID, TASK_ID, ATTEMPT_ID, approved spec, acceptance criteria or interface contract. CODER.md says to record BLOCKED rather than invent them. Writable paths differ per role, so guessing a role could breach permissions.

## Next action (responsible: student/runner)
- Supply the role ID, IDs and spec/criteria/contract paths in the invocation.
- Create tests/verify.sh or change what loop.sh calls.

Usage: not available. Manual interventions: none by agent.
