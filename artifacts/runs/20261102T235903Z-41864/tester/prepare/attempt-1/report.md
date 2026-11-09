# Tester prepare report (attempt-1)
Run 20261102T235903Z-41864 | source commit e500c44 + dirty loop/ changes, untracked platform/capstone_bridge.h, spec artifacts.

## Work done
- Wrote `tests/playtest.mjs`, `tests/lib/frames.mjs`, `tests/selftest.mjs`, `tests/package.json` (+lock), rewrote `tests/verify.sh`, appended docs to `tests/README.md`.
- Wrote `proposed-criteria.md` (agent-proposed, not student-approved) in this directory.
- Read prior evidence: coder plan reports; run 20261030T202822-loop-sh (loop.log: both iterations failed on missing ANTHROPIC_API_KEY, no code produced). Nothing there to resolve in tests.

## Commands / results
- `node tests/selftest.mjs`: 9/9 ok (black, BGR swap, alpha 0, static, shift sign/size detected).
- `node tests/playtest.mjs` with missing dist: exit 1 (B0 FAIL). With a blank placeholder page (web/index.html + empty wasm), QUICK=1: B2 FAIL "no non-black frame in 60s" -> checks catch a non-working port. (Scratch logs in /tmp, not kept; rerun to reproduce.)
- Full `tests/verify.sh` NOT run: no Makefile and `emcc` is not installed. Real-game behavior of the playtest is therefore untested; thresholds (shifts, diffs) are unvalidated against a real build and may need tuning by the tester via a reported change.

## Findings
1. (coder / student) `emcc` absent on host; needs emsdk 4.0.18 or Docker. verify.sh exits 2 when missing.
2. (coder) No Makefile; must provide `clean`/`all` producing dist/index.html, doom.wasm (+ .js/.data), canvas `#canvas` 640x400, and key release + blur handling (`cap_input_reset`).
3. (coder, optional) Export a tic counter (e.g. `cap_tic_count`) so T2 (35 tics/s) can be verified; otherwise it stays UNVERIFIED.
4. (tester) Pre-existing untracked `tests/verify.sh` had a hard-coded absolute path, no evidence saving or identity; replaced (same make clean/make all/playtest interface). It was not student-frozen as far as the invocation indicates.
5. (student) Decide audio, persistence, mouse scope; criteria are provisional until approved.

## Assumptions
See proposed-criteria.md. `npm ci`/playwright download need network once (tests/package-lock.json committed-able; node_modules is gitignored). `tests/node_modules` and Playwright browser cache are local-only.

## Next action
Coder builds Makefile/port; tester runs `tests/verify.sh` unchanged in the test phase. Manual interventions: none. Usage: not available.
