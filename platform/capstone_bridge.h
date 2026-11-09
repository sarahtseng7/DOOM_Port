// Shared bridge contract between the coder-owned DG adapters
// (platform/doomgeneric_wasm.c) and the specialist modules
// (render_timing.*, input_audio.*). AGENT-PROPOSED; not student-approved.
// Full prose: artifacts/runs/20261103T002748Z-51080/coder/plan/attempt-1/interface-contract.md
// Only the coder role edits this file; request changes via your report.
#ifndef CAPSTONE_BRIDGE_H
#define CAPSTONE_BRIDGE_H

#include <stdint.h>

#include "doomgeneric.h"

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#define CAP_EXPORT EMSCRIPTEN_KEEPALIVE
#else
#define CAP_EXPORT
#endif

#ifdef __cplusplus
extern "C" {
#endif

// v5: added cap_sector_count/floor/ceiling(i) and cap_player_sector() (read-only).
// v4: added cap_player_{valid,x,y,angle,health}() and cap_level_id() (read-only).
// v3: added cap_input_impl(), cap_input_delivered_count(), cap_input_dropped_count().
// v2: added cap_tic_count(). Specialist hooks have WEAK defaults in
// platform/cap_fallback.c; a strong definition in another platform/*.c wins.
#define CAP_BRIDGE_VERSION 5

// Framebuffer: DG_ScreenBuffer is DOOMGENERIC_RESX x DOOMGENERIC_RESY
// (640x400) pixel_t (uint32_t). Memory bytes per pixel are B,G,R,0 (alpha is
// NOT set); the render module converts to opaque RGBA for canvas ImageData.
#define CAP_FB_WIDTH   DOOMGENERIC_RESX
#define CAP_FB_HEIGHT  DOOMGENERIC_RESY
#define CAP_FB_BYTES   (CAP_FB_WIDTH * CAP_FB_HEIGHT * 4)

// Paths inside the Emscripten virtual FS.
#define CAP_WAD_PATH   "/doom1.wad"

// ---- Owner: coder (platform/doomgeneric_wasm.c) -------------------------
// The DG_* callbacks in doomgeneric.h are thin adapters that forward to the
// cap_* functions below. Only the coder defines the DG_* symbols and main().
CAP_EXPORT int      cap_bridge_version(void);        // returns CAP_BRIDGE_VERSION
CAP_EXPORT const void *cap_framebuffer_ptr(void);    // DG_ScreenBuffer address (valid after startup)
CAP_EXPORT int      cap_tic_count(void);             // engine gametic (35/s at full speed); for T2 checks
CAP_EXPORT int      cap_input_impl(void);            // 1 = input_audio.c linked, 0 = cap_fallback.c queue
CAP_EXPORT unsigned cap_input_delivered_count(void); // events handed to the engine (0 if fallback)
CAP_EXPORT unsigned cap_input_dropped_count(void);   // events refused by the queue (0 if fallback)
CAP_EXPORT int      cap_player_valid(void);          // 1 in a level with a spawned player mobj
CAP_EXPORT int      cap_player_x(void);              // map units (fixed >> 16); 0 if !valid
CAP_EXPORT int      cap_player_y(void);
CAP_EXPORT unsigned cap_player_angle(void);          // BAM angle (0..2^32)
CAP_EXPORT int      cap_player_health(void);         // -1 if !valid
CAP_EXPORT int      cap_level_id(void);              // episode*100+map, 0 if !valid
CAP_EXPORT int      cap_sector_count(void);          // v5: sectors in current level, 0 if !valid
CAP_EXPORT int      cap_sector_floor(int i);         // v5: floor height (map units), 0 if out of range
CAP_EXPORT int      cap_sector_ceiling(int i);       // v5: ceiling height; a door opens when this rises
CAP_EXPORT int      cap_player_sector(void);         // v5: sector index under the player, -1 if !valid
CAP_EXPORT int      cap_ready(void);                // 1 once doomgeneric_Create() returned

// ---- Owner: coder_render_timing (platform/render_timing.c) --------------
void     cap_render_init(void);                      // from DG_Init
void     cap_render_present(const pixel_t *fb);      // from DG_DrawFrame; must not retain fb
uint32_t cap_time_ms(void);                          // from DG_GetTicksMs; monotonic, ms
                                                     // since page start, MUST be nonzero
                                                     // by the first engine call (i_timer.c
                                                     // treats basetime==0 as unset)
void     cap_sleep_ms(uint32_t ms);                  // from DG_SleepMs (engine wipe/tic waits)
void     cap_set_title(const char *title);           // from DG_SetWindowTitle

// ---- Owner: coder_input_audio (platform/input_audio.c) ------------------
// Optional diagnostics (strong in input_audio.c; absent in the fallback):
unsigned cap_input_delivered(void) __attribute__((weak));
unsigned cap_input_dropped(void) __attribute__((weak));
void cap_input_init(void);                           // from DG_Init
int  cap_input_poll(int *pressed, unsigned char *doom_key); // from DG_GetKey; 1=event
                                                     // returned, 0=queue empty.
                                                     // doom_key is a doomkeys.h code.
CAP_EXPORT void cap_input_event(int pressed, int doom_key); // JS->C enqueue (bounded queue)
CAP_EXPORT void cap_input_reset(void);               // release all keys (blur/visibility)
void cap_audio_init(void);                           // optional; no-op until audio scope approved

#ifdef __cplusplus
}
#endif

#endif // CAPSTONE_BRIDGE_H
