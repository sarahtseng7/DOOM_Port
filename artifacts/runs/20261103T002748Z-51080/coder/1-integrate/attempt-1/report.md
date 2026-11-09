# coder 1-integrate attempt-1 (run 20261103T002748Z-51080)
Source: commit e500c44 + uncommitted changes (source-status.txt; verify-full/identity.txt). Criteria are AGENT-PROPOSED (tester/prepare, coder/plan); no student-approved specification / acceptance-criteria / interface-contract exists (assumption: proposals used as-is, not treated as approved).

## Handoffs read
coder_input_audio/1-input, coder_render_timing/1-render, coder/1-build, tester/prepare, coder/plan.

## Changes (owned files only)
- `web/index.html`: removed inline key handlers (duplicate of web/input_audio.js); added `<script src="input_audio.js">` before doom.js. `Module` setup kept inline.
- `Makefile`: dist step now copies `web/index.html` and `web/input_audio.js` to `dist/`.
- No changes to loop/, tests/, assets/, third_party/. render_timing.c / input_audio.c already linked via the `platform/*.c` glob (no change needed).
- Not done: optional diagnostic exports (_cap_input_dropped/_delivered); CSS image-rendering: pixelated (canvas not upscaled).

## Evidence
Full `tests/verify.sh` (selftest, clean build with emcc 4.0.18, playtest, 300 s soak), exit 0, `playtest: PASS failed=0`. See verify-full.log, verify-full/ (identity.txt, playtest.log, screens, browser-console.log), dist-sha256.txt. dist/index.html references input_audio.js, contains no inline KEYS table, and dist/input_audio.js is identical to web/input_audio.js, so the new JS path was the one exercised (I1-I7, C1-C3, U1-U4 pass).

## Limits / open
1. A1 audio, P1 persistence, G3 door/level-exit remain UNVERIFIED (scope undecided / no oracle). Mouse input not implemented (engine-level). A pass does not cover them.
2. Headless Chromium only; one run; flakiness not assessed. Playtest passed before this change too, so it shows no regression, not improvement.
3. No independent reviewer pass has occurred on input_audio.*, render_timing.*, or this wiring.
4. Untested: keyboard layouts/IME, Meta/context-menu release, hidden-tab timing.

## Decisions needed (student)
Audio (SFX/music) and save persistence scope; approval of acceptance criteria.

## Next action
Reviewer reviews platform/ and web/ changes; tester adds held-key-on-tab-hide and repeat-keydown checks. Manual interventions: none. Usage: not available.
