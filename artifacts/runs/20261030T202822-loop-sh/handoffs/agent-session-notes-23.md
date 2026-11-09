# Agent session notes 23 (2026-11-02)

Role: unassigned (same generic prompt as notes 5-22)
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (git status: M loop/agents.yaml, M loop/loop.sh; untracked artifacts/runs/, loop/DESIGN_DECISION_QUESTIONS.md, loop/prompts/, tests/verify.sh)
Status: BLOCKED

## Work performed
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/CODER.md, notes 22, manifest, loop.log tail. No source changed; loop/ untouched.
- platform/ and web/ still stubs; no artifacts/state.json; no spec/acceptance-criteria/contract files supplied.

## Reason for BLOCKED
Invocation names no role, task, spec, acceptance criteria, or interface contract. CODER.md says to record BLOCKED when required inputs are absent. Notes 22's findings are unchanged; nothing upstream changed except new untracked tests/verify.sh and loop/DESIGN_DECISION_QUESTIONS.md (not an approved spec).

## Next action (responsible: student/runner)
- Pass role-specific prompt file, RUN_ID/TASK_ID, spec, acceptance-criteria and contract paths in each invocation (loop.sh currently sends one identical generic message to all 7 agents).
- Set ANTHROPIC_API_KEY (loop.log shows it missing).

Usage: not available. Manual interventions: none by agent.
