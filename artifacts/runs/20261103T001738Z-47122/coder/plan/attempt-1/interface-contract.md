# Interface contract (AGENT-PROPOSED, not student-approved)

Authoritative declarations: `platform/capstone_bridge.h`, **version 2**.
Change from v1: added `cap_tic_count()` (already implemented in
platform/doomgeneric_wasm.c by the prior 1-build attempt, but the version had
not been bumped).

## Ownership
| File | Owner |
|---|---|
| platform/doomgeneric_wasm.c, platform/cap_fallback.c, platform/engine_stubs.c, platform/capstone_bridge.h, web/index.html, Makefile, BUILD.md | coder |
| platform/render_timing.{c,h}, web/render_timing.js | coder_render_timing (not yet delivered) |
| platform/input_audio.{c,h}, web/input_audio.js | coder_input_audio (not yet delivered) |
| tests/ | tester |

## Symbol table
| Symbol | Direction | Defined by | Notes |
|---|---|---|---|
| cap_bridge_version, cap_frame, cap_framebuffer_ptr, cap_tic_count, cap_ready | JS -> C (exported) | doomgeneric_wasm.c | cap_frame = one doomgeneric_Tick() |
| cap_render_init / cap_render_present(fb) / cap_time_ms / cap_sleep_ms / cap_set_title | C -> module | weak in cap_fallback.c; strong override in render_timing.c | present must not retain fb; time must be nonzero at first call |
| cap_input_init / cap_input_poll / cap_audio_init | C -> module | weak in cap_fallback.c; override in input_audio.c | poll returns 1 = event, 0 = empty |
| cap_input_event(pressed, doom_key), cap_input_reset() | JS -> C (exported) | weak in cap_fallback.c; override in input_audio.c | bounded queue; reset releases all keys |

## DG adapter mapping (doomgeneric_wasm.c)
DG_Init -> cap_render_init, cap_input_init, cap_audio_init; DG_DrawFrame ->
cap_render_present(DG_ScreenBuffer); DG_SleepMs -> cap_sleep_ms; DG_GetTicksMs
-> cap_time_ms; DG_GetKey -> cap_input_poll; DG_SetWindowTitle -> cap_set_title.

## Engine facts relied on
- DG_ScreenBuffer is 640x400 uint32 pixels, bytes B,G,R,0; alpha must be forced to 255.
- i_timer.c treats basetime==0 as unset, so DG_GetTicksMs must be nonzero on first call.
- Engine waits (d_main.c wipe loop, d_loop.c TryRunTics) call I_Sleep(1); real time
  must advance during them and the tab must not hang (current build: ASYNCIFY).
- Key codes are already Doom codes (doomkeys.h); I_GetEvent processes one release
  per call, so the queue must tolerate repeated polling.
- doomgeneric_Create() runs D_DoomMain and returns; main() calls it once and then
  drives doomgeneric_Tick() per frame.

## Weak/strong override rule
Specialist modules define the same symbols non-weak in their own platform/*.c;
the linker prefers them over cap_fallback.c. Makefile compiles platform/*.c.
Only the coder edits capstone_bridge.h; changes are requested via report.md and
require a CAP_BRIDGE_VERSION bump plus an update to this file.

## Build interface
`make clean all` -> dist/index.html, doom.js, doom.wasm, doom.data. Flags: -O2
-sASYNCIFY, --preload-file assets/doom1.wad@/doom1.wad (per prior build report).

## Open
Audio (`cap_audio_init` is a placeholder), persistence, mouse: UNDECIDED.
