// Private header for platform/render_timing.c (coder_render_timing-owned).
// The cross-module hooks are declared in capstone_bridge.h; only extras here.
#ifndef RENDER_TIMING_H
#define RENDER_TIMING_H

#include <stdint.h>

// Number of frames passed to cap_render_present since cap_render_init.
uint32_t cap_render_frames(void);

#endif // RENDER_TIMING_H
