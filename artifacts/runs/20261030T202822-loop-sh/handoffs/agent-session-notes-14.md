# Agent session notes 14 (2026-11-02)

Role: unassigned (same generic prompt as notes 5-13: "Follow your role prompt...")
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (see ../manifest.txt)
Status: BLOCKED

## Work performed
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/CODER.md, manifest.txt, tail of loop.log, notes 13.
- Layout unchanged: platform/ (stub + README), web/ (stub index.html), tests/ (README only). No build/, dist/, artifacts/state.json.
- No source files changed. loop/ untouched.

## Reason for BLOCKED
Unchanged from notes 10-13. The invocation names no role ID, RUN_ID, TASK_ID, ATTEMPT_ID, spec, acceptance criteria or interface contract. CODER.md requires BLOCKED instead of inventing requirements; writable paths are role-specific. No prior findings were supplied to address. Tenth consecutive blocked session.

## Next action (responsible: student/runner)
- Pass role ID, IDs and spec/criteria/contract paths in the invocation.
- Fix agents.yaml: coder_input_audio points to CODER_INPUT-AUDIO.md; file is CODER_INPUT_AUDIO.md.
- Create tests/verify.sh or change what loop.sh calls.
- Resolve ANTHROPIC_API_KEY setup for docker agent (see logs/loop.log).
(AGENTS.md bars agents from modifying loop/.)

Usage: not available. Manual interventions: none by agent.
