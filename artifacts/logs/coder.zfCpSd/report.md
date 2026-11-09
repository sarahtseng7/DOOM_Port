FINDINGS

I made no source edits. The build and startup are healthy and reproducible, but the one open item (intermittent E2b failure) is not diagnosed and lies outside coder-owned files, so this stays FINDINGS.

## Work
- Read AGENTS.md, loop/prompts/coder.md, README.md and the reports in artifacts/reports/ (tester, coder, reviewer_site, reviewer_gameplay, specialists).
- Ran `make all` (rc=0, "Nothing to be done") and then `make clean && make all` (rc=0). Both are in this directory (build.log, build-clean.log).
- The clean rebuild reproduced the dist hashes that the earlier reports recorded (dist-hashes.txt): doom.wasm 7afb94fa, doom.js 0090630e, doom.data 1d7d43be, index.html 43a15c63. So the build is deterministic with the emcc at /Users/sarahtseng/Developer/emsdk (not re-checked against 4.0.18 here).
- Read the visibility path in web/input_audio.js:83-95. `visibilitychange` with `document.hidden` calls `releaseAll()`, which clears the held map and calls `_cap_input_reset`. The code looks correct; I found no defect by inspection.

## Source identity
- `git diff HEAD -- . ':!artifacts' | shasum -a 256` is in source-identity.txt. HEAD is e500c44 plus uncommitted changes. It is unchanged since the last tester run's source (441e441a…).

## Evidence
- Not run: tests/verify.sh and the playtest. I only rebuilt, so the earlier 47-check result still applies to the unchanged wasm. I did not re-test E2b.

## Unresolved (owner)
1. E2b (`hidden-releases-keys`) failed 2 of 6 recorded runs, with later-diff of about 0.055 against a 0.02 threshold. It passed in short reruns. The cause is undiagnosed. Candidate causes, none verified:
   - an engine-side reset race in `_cap_input_reset` (platform/input_audio.c);
   - residual turning momentum in the engine;
   - a flaky frame-diff in the test.
   Owners: the input_audio coder for the first two, and the tester for a repeat-N E2b mode. I did not touch either file.
2. G3c level exit is UNVERIFIED. It needs a level-exit hook. `cap_level_id` is exported, but I did not add a hook, because no one has specified one. Owner: coder, once the tester states the requirement.
3. A1 (audio by ear) and H1 (real hidden tab) need a human.
4. The faults.sh expectations for swap-rb:B4/B6 and drop-use:G3a are overstated. Owner: tester.
5. Student decisions: criteria approval, persistence, WASD and mouse.

## Assumptions
- Doom's default keys are the control requirement. The criteria in artifacts/ are agent-proposed. artifacts/specification.md and acceptance-criteria.md are absent.
- Manual interventions: none. Token usage: not available.
- Writes: build/ and dist/ (regenerated) and this OUTPUT_DIR only.

## Next action
Tester: add an E2b repeat-N mode and rerun `tests/verify.sh` (including faults.sh) on this source. The input_audio coder: check `_cap_input_reset` against queued key-ups.
