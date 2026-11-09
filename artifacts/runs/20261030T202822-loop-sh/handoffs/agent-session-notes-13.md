# Agent session notes 13 (2026-11-02)

Role: unassigned (same generic prompt as notes 5-12: "Follow your role prompt...")
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (see ../manifest.txt)
Status: BLOCKED

## Work performed
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/CODER.md, manifest.txt, tail of loop.log, notes 12.
- Layout unchanged: platform/ (stub + README), web/ (stub index.html), tests/ (README only). No build/, dist/, tests/verify.sh, artifacts/state.json.
- No source files changed. loop/ untouched.

## Reason for BLOCKED
Unchanged from notes 10-12. The invocation names no role ID, RUN_ID, TASK_ID, ATTEMPT_ID, spec, acceptance criteria or interface contract. CODER.md says to record BLOCKED rather than invent requirements, and writable paths are role-specific. No prior findings were supplied to address. Ninth consecutive session blocked on the same gap.

## Next action (responsible: student/runner)
- Pass role ID, IDs and spec/criteria/contract paths in the invocation.
- Fix agents.yaml: coder_input_audio points to CODER_INPUT-AUDIO.md; file is CODER_INPUT_AUDIO.md.
- Create tests/verify.sh or change what loop.sh calls.
- Resolve ANTHROPIC_API_KEY setup for docker agent (see logs/loop.log).
(AGENTS.md bars agents from modifying loop/.)

Usage: not available. Manual interventions: none by agent.
