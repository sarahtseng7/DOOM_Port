# Agent session notes 15 (2026-11-02)

Role: unassigned (same generic prompt as notes 5-14: "Follow your role prompt...")
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (see ../manifest.txt)
Status: BLOCKED

## Work performed
- Re-read AGENTS.md, READMEs, notes 14, manifest, loop.log tail. Repo layout unchanged (no build/, dist/, tests/verify.sh, artifacts/state.json). No source files changed; loop/ untouched.

## Reason for BLOCKED
Unchanged from notes 10-14: invocation names no role ID, RUN_ID, TASK_ID, spec, acceptance criteria or interface contract, and supplies no prior findings. Inventing them would violate the role prompts' BLOCKED rule. Eleventh consecutive blocked session.

## Next action (responsible: student/runner)
- Pass role ID, IDs and spec/criteria/contract paths in the invocation.
- Fix agents.yaml: coder_input_audio references CODER_INPUT-AUDIO.md; file is CODER_INPUT_AUDIO.md.
- Create tests/verify.sh or change what loop.sh calls.
- Set up ANTHROPIC_API_KEY for docker agent (see logs/loop.log).
(AGENTS.md bars agents from modifying loop/.)

Usage: not available. Manual interventions: none by agent.
