# Agent session notes 30 (2026-11-02)

Role: unassigned (generic prompt "Follow your role prompt..." again; same as notes 5-29)
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (loop/agents.yaml, loop/loop.sh modified; artifacts/runs/, loop/DESIGN_DECISION_QUESTIONS.md, loop/prompts/, tests/verify.sh untracked)
Status: BLOCKED

## Work performed
- Re-read AGENTS.md, READMEs, loop.sh, agents.yaml, loop.log, notes 29. No source changed; loop/ untouched.

## Reason for BLOCKED
Unchanged from notes 29: the invocation names no role, so I cannot tell which files I may write or which prompt applies. Latest state: dist/ absent; platform/ has only the stub, web/ only the stub HTML; no Makefile; tests/verify.sh exists but depends on missing files.

## Next action (responsible: student/runner)
- Run a specific role via `docker agent run loop/agents.yaml --agent <name>` (the invocation must select the agent so the role prompt loads), with ANTHROPIC_API_KEY set.

Usage: not available. Manual interventions: none by agent.
