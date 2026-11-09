# Agent session notes 18 (2026-11-02)

Role: unassigned (same generic prompt as notes 5-17)
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (see ../manifest.txt)
Status: BLOCKED

## Work performed
- Read AGENTS.md, READMEs, loop.sh, agents.yaml, loop/prompts/CODER.md, manifest, loop.log, notes 17.
- No source changed. platform/ and web/ are still stubs, tests/ has README only, no tests/verify.sh, artifacts/state.json, build/ or dist/. loop/ untouched.

## Reason for BLOCKED
Invocation names no role, RUN_ID, TASK_ID, ATTEMPT_ID, spec, acceptance criteria or interface contract. Role prompts (e.g. CODER.md) say to record BLOCKED when inputs are absent. loop.sh passes the same generic string to every agent, so the role cannot be inferred from the invocation.

## Next action (responsible: student/runner)
- Pass role ID, RUN_ID/TASK_ID/ATTEMPT_ID and spec/contract paths in the invocation (per-agent prompts in loop.sh).
- Fix agents.yaml: coder_input_audio references CODER_INPUT-AUDIO.md; file is CODER_INPUT_AUDIO.md.
- Create tests/verify.sh or change what loop.sh calls.
- Set ANTHROPIC_API_KEY for docker agent (see logs/loop.log).
(AGENTS.md bars agents from modifying loop/.)

Usage: not available. Manual interventions: none by agent.
