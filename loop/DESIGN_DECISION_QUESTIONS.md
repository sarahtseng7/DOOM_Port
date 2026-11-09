# Design Decision Questions

- **Work:** How does a broad goal become bounded tasks? Who decides what
  happens next when agents disagree or progress stalls?
	The broad goal is to run and play the supplied DOOM engine in a browser using Emscripten. Agents break it into tasks small enough to implement and verify independently. Each task records an ID, requirement, source revision, owner, dependencies, permitted files, expected result, verification method, and remaining budget.
- **Context:** What does each role see? What information must survive when
  every agent starts with a fresh context?
	Every role reads the repository instructions, relevant README files, its own prompt, the approved specification and acceptance criteria, the current task, interface contract, and relevant prior findings. It does not need the complete conversation history. Hidden regression causes remain unavailable to repair agents.
- **Authority:** Which tools and files can each role access? Who can change
  the checks used to accept the coder's work?
	All roles may read relevant source and published evidence. 
  - Coders edit only their assigned source/build files and isolated outputs.
  - Reviewer 1 and Reviewer 2 write only their own review reports.
  - The tester edits authorized verification code under `tests/` and writes isolated
- **Evidence:** What constitutes success? How will you distinguish a plausible
  report from a verified result, and a weak check from a useful one?
	Success is compilation, screenshots, plausible explanations, measurable gameplay, rendering, timing, input, audio, etc
- **Recovery:** What happens after a tool error, failed check, interrupted
  run, or repeated unsuccessful repair?
	The runner must track individual process outcomes and clean up only processes and outputs belonging to the current attempt. Avoid unlimited loops or implicit retries that obscure failures. Failed attempts count against the budget.
- **Limits:** What are the time, token or cost, and retry budgets? How do
  success, exhaustion, and stalled progress produce different stopping decisions?
	I have 1 week, with 1 week worth of Claude tokens, and not much retry budget. 
