# Agent session notes 11 (2026-11-02)

Role: unassigned (same generic prompt as notes 5-10: "Follow your role prompt...")
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (see ../manifest.txt)
Status: BLOCKED

## Work performed
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/CODER.md, loop/loop.sh, loop/agents.yaml, manifest.txt, loop.log and notes 10.
- Re-checked repo layout: platform/ has only the stub and README, web/ has only the stub index.html, tests/ has only a README. No tests/verify.sh, build/, dist/ or artifacts/state.json.
- No source files changed. loop/ untouched.

## Reason for BLOCKED
Unchanged from notes 10. The invocation names no role ID, RUN_ID, TASK_ID, ATTEMPT_ID, approved spec, acceptance criteria or interface contract. Writable paths are role-specific, so guessing a role could breach permissions. loop/prompts/CODER.md requires BLOCKED when inputs are absent. No prior findings were supplied to address. This is the seventh consecutive session blocked on the same gap.

## Next action (responsible: student/runner)
- Pass role ID, IDs and spec/criteria/contract paths in the invocation. loop.sh does not pass them, and agents.yaml `instruction` only says "Read loop/prompts/X.md".
- Fix the prompt path in agents.yaml: coder_input_audio points to CODER_INPUT-AUDIO.md, but the file is CODER_INPUT_AUDIO.md.
- Create tests/verify.sh or change what loop.sh calls.
- Resolve the ANTHROPIC_API_KEY setup for docker agent (see logs/loop.log).
(AGENTS.md bars agents from modifying loop/, so these are student-owned.)

Usage: not available. Manual interventions: none by agent.
