FINDINGS

One source edit: the static `<title>` in web/index.html. I rebuilt, and the quick playtest passed on the second run after one E2b failure on the first. The full `tests/verify.sh` was not rerun, so this stays FINDINGS.

## Work
- Read AGENTS.md, loop/prompts/CODER.md and the six reports in artifacts/reports/. The only open item in a coder-owned file was the cosmetic title flash, reported by reviewer_site, tester and both specialists.
- Changed `<title>Doom (WASM)</title>` to `<title>DOOM Shareware</title>` in web/index.html. That is the title the engine sets, so the title no longer changes at startup. Assumption: we only ship the shareware WAD.
- `make all` rc=0 (build.log). Only the index.html copy was redone, since only that file changed.

## Source identity
- New `git diff HEAD -- . ':!artifacts' | shasum -a 256` prefix is 441e441ad5dfcd52. The prior reports all had 92e25d7245a7dafd.
- dist hashes: doom.wasm 7afb94fa1ec64b5c, doom.js 0090630eeaf16a87 and doom.data 1d7d43be501e67d9 are unchanged. dist/index.html is now 43a15c63d134b538 (was 5905489e041214ce).
- Because the wasm is unchanged, the earlier gameplay and audio evidence for the engine, input and audio code still applies. The tester's 47-check verify.sh result is for the old source hash.

## Evidence (artifacts/logs/coder.oWCDg7/)
- `QUICK=1 node tests/playtest.mjs`, run twice. QUICK is partial, so it exits 3 by design.
  - Run 1 (playtest-console.log): `failed=1`. E2b.hidden-releases-keys failed with later-diff=0.0570.
  - Run 2 (playtest2-console.log): `failed=0`.
  - I did not investigate E2b beyond the rerun. It may be a flaky check or a real intermittent fault. Not diagnosed.

## Unresolved (owner)
1. E2b failed once in two runs after this change. Owner: tester, to run `tests/verify.sh` and judge flakiness. The HTML change cannot plausibly affect hide/key release, but I did not prove that.
2. G3c level exit: UNVERIFIED. It needs a coder level-exit hook, which no one has requested yet.
3. UNVERIFIED, human: A1 (audio by ear) and H1 (real hidden tab). Also Firefox, Safari and HiDPI.
4. Owner tester: the faults.sh expectations for swap-rb and drop-use are wrong.
5. Student decisions: criteria approval, WASD/mouse, OPL-faithful music, persistence.

## Assumptions
- Doom's default keys are the control requirement. Criteria are agent-proposed, not student-approved.
- Manual interventions: none. Token usage: not available.
- Writes: web/index.html, build/ and dist/ (regenerated), and this OUTPUT_DIR.

## Next action
The tester reruns `tests/verify.sh` on source hash 441e441ad5dfcd52 and checks E2b. A human runs A1 and H1.
