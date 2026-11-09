# reviewer 1-review attempt-1 (run 20261103T002748Z-51080)

Status: FINDINGS (not PASS). Static review of platform/ and web/ plus a check of the coder's evidence. I did not rebuild or rerun the browser tests.

## Basis and assumptions
- Source: commit e500c44 + uncommitted changes (manifest source_commit). The shipped `dist/` hashes match `coder/1-integrate/attempt-1/verify-full/dist-sha256.txt` (doom.js, doom.wasm, doom.data, index.html, input_audio.js), so that evidence describes the current build.
- No `artifacts/specification.md`, `acceptance-criteria.md` or `interface-contract.md` exists. I used the AGENT-PROPOSED `coder/plan/attempt-1/{proposed-spec,interface-contract}.md` and `tester/prepare/attempt-1/proposed-criteria.md`. None is student-approved; I did not approve them.
- No earlier reviewer findings exist under `artifacts/runs/`.
- Files read: platform/{capstone_bridge.h,doomgeneric_wasm.c,cap_fallback.c,input_audio.{c,h},render_timing.{c,h},engine_stubs.c}, web/{index.html,input_audio.js}, Makefile. Checked against third_party/doomgeneric `doomkeys.h`, `i_input.c`, `doomfeatures.h`.

## Verified correct (no action)
- BGR(0) -> RGBA conversion in render_timing.c: the word is 0x00RRGGBB, output is 0xFF BB GG RR, which is R,G,B,A in memory. Alpha is forced to 255.
- Every `web/input_audio.js` key code matches `doomkeys.h`: arrows, Ctrl=KEY_FIRE 0xa3, Space=KEY_USE 0xa2, Shift 0xb6, Alt 0xb8, strafe 0xa0/0xa1, F-keys, Home/End/PgUp/PgDn/Ins/Del, Esc/Tab/Enter, `-`/`=`.
- The `input_audio.c` queue invariant holds: pending presses are capped at 256 and at most 255 releases can be outstanding, so the 512-slot queue never drops a release.
- Weak (`cap_fallback.c`) / strong (`input_audio.c`, `render_timing.c`) overrides resolve correctly. The built page loads `input_audio.js`, and playtest I1-I7, C1-C3, U1-U4 and T2 passed on that build.
- `cap_time_ms` is nonzero on first call, as `i_timer.c` requires.

## Findings (most severe first)

### F1 (medium, correctness/robustness) Exported `cap_frame` is unsafe alongside the ASYNCIFY main loop
`main()` (platform/doomgeneric_wasm.c) runs `for(;;){doomgeneric_Tick(); emscripten_sleep(0);}`. `cap_frame` is also exported (Makefile EXPORTED_FUNCTIONS) and the interface contract says "JS calls once per animation frame". If any JS calls `_cap_frame` while main is suspended inside an ASYNCIFY sleep, it re-enters `doomgeneric_Tick` in the middle of an unwound async operation. That aborts or corrupts engine state. Nothing calls it today (no JS/test caller), so it is dormant. Action: remove the export and `cap_frame`, or document and test that exactly one driver exists. Fix the contract text either way.

### F2 (medium, test gap) Key-handling edge cases have no behavioural coverage
The playtest simulates blur only through Playwright. Not exercised: `visibilitychange`, `pagehide`, `contextmenu` and Meta releases. Also untested: two physical keys on one Doom key (L+R Ctrl), keydown auto-repeat, and a key held across a refocus. After refocus a still-held key is silently ignored, because `e.repeat` returns before `held` is repopulated. The player must release and re-press it. Tester should add these checks. The coder_input_audio report lists the same gaps.

### F3 (low-medium, usability) `web/input_audio.js` swallows browser shortcuts
`preventDefault` is called for any mapped key unless Meta is held. On Windows/Linux this blocks Ctrl+R, F5 reload, F12 devtools, F11 fullscreen, and Ctrl+letter shortcuts (letters are mapped). Tab traps keyboard focus. Action: do not hijack F5/F11/F12 (the F-key table maps them), and skip `preventDefault` when `e.ctrlKey` and the key is a letter, or document this as intended.

### F4 (low, robustness) ASYNCIFY stack size is untested
The link flags use `-sASYNCIFY` with the default `ASYNCIFY_STACK_SIZE` (4096 bytes) and no `ASYNCIFY_ADD`/`ASYNCIFY_IGNORE`. The sleeps happen at shallow depth (TryRunTics, the wipe loop), and the 300 s soak passed. But a deeper path that sleeps, such as a startup/WAD-load error path or a menu path, could overflow the stack and abort with "unreachable". Action: set `-sASYNCIFY_STACK_SIZE` explicitly with margin, and add a test that reaches the E1M1 wipe, the intermission screen and the end of the demo loop.

### F5 (low, maintainability) Duplicate weak/strong implementations hide a regression
`cap_fallback.c` carries a second input queue and a second renderer, each different in behaviour from the strong ones. If `input_audio.c` or `render_timing.c` fails to be linked (rename, glob change), the build still succeeds and silently uses the fallback. There is no check of which implementation is active. Action: have a test assert the active implementation. For example, export a diagnostic such as `_cap_input_dropped`, or check `Module._rt` for the render module. This also matters for the required regression-injection evaluation.

### F6 (low, build hygiene)
- `CFLAGS` contains `-w`, which silences every warning for the platform code as well as the engine. Apply it only to `third_party` objects.
- Object rules depend only on `capstone_bridge.h`. Edits to `input_audio.h`, `render_timing.h` or engine headers do not trigger a rebuild. Use `-MMD -MP`. The documented `make clean all` is unaffected.

### F7 (low, documentation drift)
- `coder/plan/.../interface-contract.md` lists `web/render_timing.js` and says the specialist modules are "not yet delivered". `web/render_timing.js` does not exist, and both modules are delivered and linked.
- `input_audio.c` says "sound disabled in engine". That is true because the Makefile does not define `FEATURE_SOUND`, but `doomfeatures.h` has the `#undef FEATURE_SOUND` line commented out. State where sound is turned off.

### F8 (low, presentation)
The canvas is a fixed 640x400 CSS size with no `image-rendering: pixelated`. It looks small and soft on large or HiDPI displays. The tests run at deviceScaleFactor 1 and cannot see this. The coder already listed it as not done.

### F9 (process) Source revision is not reproducible
All code under review is uncommitted. The evidence identifies `commit + dirty_diff_sha256`, but that diff is not preserved, only the status list. Action: save the patch under `artifacts/` (earlier runs did, as `initial-source.patch`), or commit.

## Coverage limits (what this review and the passing evidence do not show)
- Audio (A1), save persistence (P1), door use and level exit (G3), mouse, non-Chromium browsers and touch are unimplemented or UNVERIFIED. "Faithful play" has no oracle such as demo or determinism comparison. A verify pass proves none of these.
- One headless Chromium run. Flakiness, hidden-tab timing (setTimeout throttling slows the ASYNCIFY loop in background tabs), IME/keyboard layouts and real headed focus loss are unassessed.
- I did not rebuild, run the tests, or run fault injection. No claim is made that the checks catch faults beyond the tester's selftest.

## Next action
Coder: F1, F3, F4, F5, F6, F9. Tester: F2 plus an implementation-identity check (F5). Student: approve or replace the proposed criteria, and decide the audio/persistence scope. Manual interventions: none. Usage: not available.
