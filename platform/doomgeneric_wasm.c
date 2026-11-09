// WebAssembly platform layer for doomgeneric (coder-owned).
// DG_* callbacks forward to the cap_* functions declared in capstone_bridge.h.
// Default (weak) cap_* implementations live in cap_fallback.c; specialist
// modules override them with strong definitions.

#include <stdint.h>

#include <emscripten.h>

#include "capstone_bridge.h"
#include "doomdef.h"
#include "doomstat.h"
#include "d_player.h"
#include "r_state.h"

extern int gametic;

static int cap_started;

void DG_Init()
{
    cap_render_init();
    cap_input_init();
    cap_audio_init();
}

void DG_DrawFrame()
{
    cap_render_present(DG_ScreenBuffer);
}

void DG_SleepMs(uint32_t ms)
{
    cap_sleep_ms(ms);
}

uint32_t DG_GetTicksMs()
{
    return cap_time_ms();
}

int DG_GetKey(int *pressed, unsigned char *key)
{
    return cap_input_poll(pressed, key);
}

void DG_SetWindowTitle(const char *title)
{
    cap_set_title(title);
}

int cap_bridge_version(void)
{
    return CAP_BRIDGE_VERSION;
}

int cap_ready(void)
{
    return cap_started;
}

int cap_input_impl(void)
{
    return cap_input_delivered != NULL;
}

unsigned cap_input_delivered_count(void)
{
    return cap_input_delivered ? cap_input_delivered() : 0;
}

unsigned cap_input_dropped_count(void)
{
    return cap_input_dropped ? cap_input_dropped() : 0;
}

const void *cap_framebuffer_ptr(void)
{
    return DG_ScreenBuffer;
}

int cap_tic_count(void)
{
    return gametic;
}

// Read-only player diagnostics (v4) for position-based checks; -1 / 0 when no
// player mobj exists (title screen, demo before spawn).
int cap_player_valid(void)
{
    return gamestate == GS_LEVEL && players[consoleplayer].mo != NULL;
}

int cap_player_x(void)
{
    return cap_player_valid() ? players[consoleplayer].mo->x >> 16 : 0;
}

int cap_player_y(void)
{
    return cap_player_valid() ? players[consoleplayer].mo->y >> 16 : 0;
}

unsigned cap_player_angle(void)
{
    return cap_player_valid() ? (unsigned)players[consoleplayer].mo->angle : 0;
}

int cap_player_health(void)
{
    return cap_player_valid() ? players[consoleplayer].health : -1;
}

int cap_level_id(void)
{
    return cap_player_valid() ? gameepisode * 100 + gamemap : 0;
}

// Read-only sector diagnostics (v5) for door / lift checks. Heights are map
// units (fixed >> 16). Out-of-range or no-level queries return 0 / -1.
int cap_sector_count(void)
{
    return cap_player_valid() ? numsectors : 0;
}

int cap_sector_floor(int i)
{
    return (cap_player_valid() && i >= 0 && i < numsectors) ? sectors[i].floorheight >> 16 : 0;
}

int cap_sector_ceiling(int i)
{
    return (cap_player_valid() && i >= 0 && i < numsectors) ? sectors[i].ceilingheight >> 16 : 0;
}

int cap_player_sector(void)
{
    return cap_player_valid() ? (int)(players[consoleplayer].mo->subsector->sector - sectors) : -1;
}

int main(int argc, char **argv)
{
    static char *args[] = { "doom", "-iwad", CAP_WAD_PATH, NULL };
    (void)argc;
    (void)argv;

    doomgeneric_Create(3, args);
    cap_started = 1;

    // ASYNCIFY build: cap_sleep_ms yields to the browser inside the engine's
    // tic waits; the explicit sleep(0) yields once per frame otherwise.
    for (;;) {
        doomgeneric_Tick();
        emscripten_sleep(0);
    }
    return 0;
}
