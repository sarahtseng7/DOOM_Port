// Rendering and timing for the WebAssembly port (coder_render_timing-owned).
// Strong definitions of the cap_render_* / cap_time_ms / cap_sleep_ms /
// cap_set_title hooks; they override the weak defaults in cap_fallback.c.
// Contract: platform/capstone_bridge.h (version 3).

#include <stdint.h>

#include <emscripten.h>

#include "capstone_bridge.h"
#include "render_timing.h"

// Engine framebuffer bytes are B,G,R,0; canvas ImageData wants R,G,B,A.
// On little-endian wasm the source word is 0x00RRGGBB and the output word
// must be 0xAABBGGRR with A forced to 255.
static uint32_t rgba[CAP_FB_WIDTH * CAP_FB_HEIGHT];

static uint32_t frames_presented;

EM_JS(int, rt_js_init, (int w, int h), {
    var c = Module.canvas || document.getElementById('canvas');
    if (!c) return 0;
    // alpha:false lets the browser skip compositing against the page.
    var ctx = c.getContext('2d', { alpha: false });
    if (!ctx) return 0;
    ctx.imageSmoothingEnabled = false;
    Module._rt = { ctx: ctx, w: w, h: h, frames: 0, lastPresent: 0 };
    // Observable by tests: Module._rt.frames increments once per DG_DrawFrame.
    return 1;
});

EM_JS(void, rt_js_put, (const void *px, int w, int h), {
    var rt = Module._rt;
    if (!rt) return;
    // Reuse the ImageData while the heap buffer and pointer are unchanged;
    // ALLOW_MEMORY_GROWTH replaces HEAPU8.buffer, which invalidates the view.
    if (!rt.img || rt.buf !== HEAPU8.buffer || rt.px !== px) {
        rt.buf = HEAPU8.buffer;
        rt.px = px;
        rt.img = new ImageData(new Uint8ClampedArray(rt.buf, px, w * h * 4), w, h);
    }
    rt.ctx.putImageData(rt.img, 0, 0);
    rt.frames++;
    rt.lastPresent = performance.now();
});

EM_JS(void, rt_js_title, (const char *t), { document.title = UTF8ToString(t); });

void cap_render_init(void)
{
    frames_presented = 0;
    rt_js_init(CAP_FB_WIDTH, CAP_FB_HEIGHT);
}

void cap_render_present(const pixel_t *fb)
{
    const uint32_t *src = (const uint32_t *)fb;
    for (int i = 0; i < CAP_FB_WIDTH * CAP_FB_HEIGHT; i++) {
        uint32_t s = src[i];
        rgba[i] = 0xFF000000u | ((s & 0xFFu) << 16) | (s & 0xFF00u) | ((s >> 16) & 0xFFu);
    }
    rt_js_put(rgba, CAP_FB_WIDTH, CAP_FB_HEIGHT);
    frames_presented++;
}

uint32_t cap_time_ms(void)
{
    // Milliseconds since page start (monotonic). +1 keeps the first call
    // nonzero: i_timer.c treats basetime==0 as unset.
    return (uint32_t)emscripten_get_now() + 1;
}

// The engine only sleeps in 1 ms polls (wipe loop in d_main.c, tic wait in
// d_loop.c) and a 100 ms retry in d_loop.c. With ASYNCIFY, emscripten_sleep
// returns control to the event loop via setTimeout, so input, rAF and
// painting keep running while the engine waits and real time advances.
void cap_sleep_ms(uint32_t ms)
{
    emscripten_sleep(ms);
}

void cap_set_title(const char *title)
{
    rt_js_title(title);
}

uint32_t cap_render_frames(void)
{
    return frames_presented;
}
