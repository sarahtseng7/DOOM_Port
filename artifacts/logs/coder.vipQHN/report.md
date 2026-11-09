FINDINGS

No source edits this run. No report in artifacts/reports/ names a defect in a coder-owned file (Makefile, BUILD.md, web/index.html, platform/doomgeneric_wasm.c, capstone_bridge.h, cap_fallback.c, engine_stubs.c). Build and startup were re-checked by identity and `make -n` only; I ran no browser. Four behaviors remain UNVERIFIED, so this is FINDINGS.

## Source identity (checked this session)
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` prefix 92e25d7245a7dafd, the same as every report in artifacts/reports/.
- emcc 4.0.18 (matches the pinned version). dist/doom.wasm prefix 7afb94fa1ec64b5c.
- `find platform web Makefile -newer dist/doom.wasm` is empty and `make -n` prints "Nothing to be done for `all'". dist/ is current; I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md do not exist.

## Work and evidence
- Read AGENTS.md, README.md, loop/README.md, artifacts/README.md, loop/prompts/CODER.md, BUILD.md, Makefile and the six reports in artifacts/reports/.
- BUILD.md matches the Makefile (WAD packaging, script load order, bridge exports, serving dist/ on port 8000).
- Relied on, not rerun: tester `tests/verify.sh` exit 0 with 7/7 faults caught; reviewer_site startup PASS (0 console errors, ~35 tics/s); reviewer_gameplay five probes pass.
- Any change to platform/, web/ or the Makefile changes the dist hash and invalidates that evidence, so I made none.

## Unresolved (owner)
1. G3c level exit: UNVERIFIED. Needs a coder-added level-exit hook (bridge version bump), then a tester check. Owner: coder, then tester. Not added because nothing requested it.
2. A1 (audio by ear) and H1 (real hidden tab): UNVERIFIED. Owner: human, protocol in tests/README.md.
3. Student decisions: approval of criteria, WASD/mouse, OPL-faithful music, P1 persistence.
4. Tester: `faults.sh` expectations for swap-rb (B6 overstated) and drop-use (G3b omitted) do not match the fault log.
5. Not covered: pickups, damage/death, Firefox, Safari, HiDPI.
6. Cosmetic, owner coder, deliberately left: static `<title>` "Doom (WASM)" in web/index.html shows ~300 ms. Bundle with the next functional change, since it forces a rebuild and full tester rerun.

## Assumptions
- Criteria are agent-proposed, not student-approved. Results apply only to wasm hash 7afb94fa1ec64b5c.
- Doom's default keys are the control requirement.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only.

## Next action
Wait for a request from a specialist, the tester or the student. If G3c is wanted, add the hook plus the title fix, rebuild, and have the tester rerun `tests/verify.sh` (timeout of at least 30 minutes). A human runs A1 and H1.
