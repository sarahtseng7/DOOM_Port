# Agent session notes 17 (2026-11-02)

Role: unassigned (same generic prompt as notes 5-16)
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (see ../manifest.txt)
Status: BLOCKED

## Work performed
- Read AGENTS.md, READMEs, manifest, loop.log tail, notes 16. Repo unchanged (platform/ and web/ are still stubs, tests/ has README only, no build/, dist/, tests/verify.sh, artifacts/state.json). No source changed; loop/ untouched.

## Reason for BLOCKED
Invocation says "Follow your role prompt" but names no role, RUN_ID, TASK_ID, spec or prior findings. Guessing a role risks breaking role separation (e.g. a coder touching acceptance checks). Thirteenth consecutive blocked session.

## Next action (responsible: student/runner)
- Pass the role ID (coder / reviewer / tester ...) and task/spec paths in the invocation, or have loop.sh pass per-agent prompts.
- Fix agents.yaml: coder_input_audio references CODER_INPUT-AUDIO.md; file is CODER_INPUT_AUDIO.md.
- Create tests/verify.sh or change what loop.sh calls.
- Set ANTHROPIC_API_KEY for docker agent (see logs/loop.log).
(AGENTS.md bars agents from modifying loop/.)

Usage: not available. Manual interventions: none by agent.
