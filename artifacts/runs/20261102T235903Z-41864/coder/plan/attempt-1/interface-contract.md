# Interface contract (AGENT-PROPOSED, not student-approved)

Authoritative declarations: `platform/capstone_bridge.h` (version 1).

## Ownership
| File | Owner |
|---|---|
| platform/doomgeneric_wasm.c (DG_* adapters, main), platform/capstone_bridge.h, web/index.html, Makefile, BUILD.md | coder |
| platform/render_timing.{c,h}, web/render_timing.js | coder_render_timing |
| platform/input_audio.{c,h}, web/input_audio.js | coder_input_audio |
| tests/ | tester |

## DG adapter mapping (coder implements; specialists supply the cap_* side)
| Engine callback | Forwards to |
|---|---|
| DG_Init | cap_render_init(); cap_input_init(); cap_audio_init() |
| DG_DrawFrame | cap_render_present(DG_ScreenBuffer) |
| DG_SleepMs | cap_sleep_ms |
| DG_GetTicksMs | cap_time_ms |
| DG_GetKey | cap_input_poll |
| DG_SetWindowTitle | cap_set_title |

## Engine facts the modules rely on (verified in source)
- DG_ScreenBuffer is malloc'd inside doomgeneric_Create before DG_Init; 640x400x4.
- Pixel bytes in memory: B,G,R,0. Alpha is 0 -> must be forced to 255.
- I_GetTime() uses basetime==0 as "unset"; DG_GetTicksMs must be nonzero on
  first call or the time base re-latches.
- Blocking waits exist: d_main.c wipe loop (`do { I_GetTime(); I_Sleep(1); }
  while (tics<=0)`) and d_loop.c TryRunTics (`I_Sleep(1)` until a tic elapses).
  cap_sleep_ms must therefore not busy-hang: it may spin on the real clock for
  <= ~1-2 ms or yield via Asyncify/ASYNCIFY_SLEEP; the render_timing owner picks
  the mechanism and tells coder the needed flags (e.g. -sASYNCIFY). Real time
  MUST advance during these waits.
- DG_GetKey: key codes are already Doom codes (TranslateKey is identity); see
  doomkeys.h. I_GetEvent stops after the first release event per call, so the
  queue must tolerate being polled repeatedly. Return 0 when empty.
- Shift state is tracked from KEY_RSHIFT events only.

## Control flow
1. main(): mount/preload WAD, call doomgeneric_Create(argc, argv) with
   argv = {"doom","-iwad","/doom1.wad"} (add "-nosound"-equivalent not needed;
   FEATURE_SOUND is off by default).
2. Browser drives `cap_frame()` per animation frame (emscripten_set_main_loop
   or JS rAF); each call is one doomgeneric_Tick(), presenting via DG_DrawFrame.
3. JS -> C input only via cap_input_event / cap_input_reset (browser events are
   queued, never call engine directly).

## Build interface (coder)
`make clean`, `make all` -> dist/index.html, doom.js, doom.wasm, doom.data.
Sources: third_party/doomgeneric/*.c excluding platform-specific/unneeded
(dummy.c handling, i_cdmus, i_joystick, net_* to be confirmed at build time),
plus platform/*.c, with `-I third_party/doomgeneric -I platform`. Specialists
request flags/files from coder through their report.md; coder integrates.

## Open items / change process
Contract changes: specialist describes the exact change in report.md; coder
bumps CAP_BRIDGE_VERSION and updates this file in a later attempt.
Audio (DG_sound_module/DG_music_module, SDL_mixer include in i_sound.c) is
UNDECIDED scope; `cap_audio_init` is a placeholder only.
