# coder_input_audio 1-input attempt-1 (run 20261103T002748Z-51080)

Source: commit e500c44 + uncommitted changes (source-status.txt). Criteria/spec are AGENT-PROPOSED (coder/plan, tester/prepare); no student-approved specification, acceptance-criteria, or interface-contract exists. Only the proposed R4 (keyboard) is in scope; audio/storage scope is absent.

## Work done (owned files only)
- `platform/input_audio.c` (new): strong overrides of the weak hooks in cap_fallback.c: `cap_input_init`, `cap_input_poll`, `cap_input_event`, `cap_input_reset`, `cap_audio_init` (empty). Strictly alternating press/release per key: auto-repeat presses and stray releases are dropped; releases can never be lost to a full queue (press limit 256 of 512 slots); reset queues a release for every key still down.
- `platform/input_audio.h` (new): diagnostics `cap_input_dropped()/cap_input_delivered()` (not exported to JS).
- `web/input_audio.js` (new): self-installing keyboard capture. KeyboardEvent.code -> doomkeys.h (arrows, Ctrl/Space/Shift/Alt, `,` `.` strafe, Enter, Esc, Tab, F1-F12, letters, digits, Backspace, Pause, -, =, Home/End/PgUp/PgDn/Ins/Del, numpad arrows). Tracks held physical codes so keyup always matches its keydown; L/R Ctrl share one doom key (released only when both up). Releases all on blur, visibilitychange(hidden), pagehide, contextmenu, and Meta keydown (macOS swallows keyups under Cmd). Meta combos are not hijacked. Resolves `window.Module` lazily (script order independent).
- Mouse: NOT implemented (engine mouse generation is commented out in i_input.c; needs engine-level work outside my ownership).
- Audio (SFX/music) and save/config persistence: NOT implemented. Scope is undecided, so per role prompt they stay visible acceptance limitations (proposed-spec UNDECIDED list).

## Evidence
- Native queue unit test (scratch, build/.../qtest.c): `qtest.log` PASS (repeat drop, stray release, bad keys, reset, flood with all 255 releases preserved, no key left down after saturated queue).
- emcc 4.0.18 build into role-owned dirs (`make BUILD=build/<RUN>/coder_input_audio/obj DIST=dist/<RUN>/coder_input_audio`): build.log, exit 0. Shared build/ and dist/ untouched.
- Role-local page = web/index.html with inline key handlers removed and `<script src="input_audio.js">` added (made by script in dist/<RUN>/coder_input_audio/, not committed to web/index.html). Existing `tests/playtest.mjs` with `QUICK=1 DIST_DIR=...`: all 31 checks PASS incl. I1-I7 (turn/move/blur-release), C1-C3, U1-U4, T2; failed=0; exit 3 is the by-design QUICK exit. See `playtest.log`, `playtest/`. dist-sha256.txt lists hashes.

## Limits
- QUICK 15s soak only, headless Chromium only, single run; not a full verify.sh run and not independently reviewed. A test that passes with the old inline handlers already existed, so these checks show no regression, not that my JS is the better of the two.
- Not tested: keyboard layouts/IME, Meta/context-menu release paths, two-physical-keys-one-doom-key, real focus loss in a headed browser (playtest I7 simulates blur only).
- Unrequested input_audio.js is not yet loaded by the shipped page.

## Findings / requests (owner)
1. **coder**: add `<script src="input_audio.js"></script>` to web/index.html (before doom.js), delete its inline key code, and make the Makefile copy `web/input_audio.js` to `dist/` (currently only index.html is copied). Until then my JS is unused and the page's inline handler feeds the C queue (still correct: C dedupes).
2. **coder**: optionally export `_cap_input_dropped,_cap_input_delivered` for diagnostics.
3. **student**: decide audio scope. Proposed next work: (a) SFX via Web Audio: implement `DG_sound_module` (i_sound.h) in C, decode DMX lumps (8-bit PCM, 11025 Hz) into AudioBuffers, per-channel gain/pan from engine volume/sep; requires `FEATURE_SOUND` plus avoiding the `SDL_mixer.h` include (coder/build change); gate on user gesture for AudioContext. (b) Music: MUS->MIDI via mus2mid.c plus a GENMIDI-based synth; much larger; propose deferring. (c) Persistence: mount IDBFS at a save dir, set savegamedir/config path, `syncfs` after saves/config writes; checks need a reload test. Tester must define oracles (an active AudioContext proves nothing).
4. **tester**: add checks for held-key release on tab hide and for repeated keydown not double-firing; A1/P1 remain UNVERIFIED.

Manual interventions: none. Usage: not available.
