# Agent session notes 5 (2026-11-02)

Role: unassigned (prompt was "Follow your role prompt. Complete your work, address prior findings, and save results under artifacts/.")
Source revision: e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (see ../manifest.txt)
Status: BLOCKED

## Work performed
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/CODER.md, loop.log, manifest, notes 1-4, and the loop.sh / agents.yaml diffs.
- No source files changed; loop/ untouched.

## Reason for BLOCKED
- The invocation names no role. Neither the prompt nor the harness says which role this is: coder-build, coder-render-timing, coder-input-audio, reviewer, reviewer-requirements or tester. The prompt in loop/agents.yaml is generic. Each role has different writable paths, so guessing could break the permission boundaries.
- RUN_ID, TASK_ID, ATTEMPT_ID, the approved spec, acceptance criteria and interface contract were not supplied. CODER.md says to record BLOCKED instead of inventing them.
- tests/ holds only a README. tests/verify.sh, which loop.sh calls, does not exist. platform/capstone_bridge.h does not exist. artifacts/state.json does not exist.
- "Prior findings": the only ones are notes 1-4 and loop.log. They are all the same blocker, plus a missing ANTHROPIC_API_KEY in the original run. Nothing is resolvable by an agent.
- The loop never passes a role, task or attempt ID to the agents. Every iteration will hit this same BLOCKED state until it does. This is for the student to decide; agents may not design or edit loop/.

## Next action (responsible: student/runner)
- Pass the role ID, RUN_ID/TASK_ID/ATTEMPT_ID and the paths to the approved spec, acceptance criteria and contract in each invocation.
- Create tests/verify.sh, or change what loop.sh calls, through the student-owned process.

Usage: not available. Manual interventions: none by agent.
