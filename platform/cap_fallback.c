// Weak default implementations of the specialist-owned cap_* hooks so the
// port links and plays before render_timing.c / input_audio.c exist.
// A strong definition in another platform/*.c file overrides each one.
// Coder-owned. Input events arrive from web/index.html via cap_input_event.

#include <string.h>

#include <emscripten.h>

#include "capstone_bridge.h"

#define WEAK __attribute__((weak))

EM_JS(void, cap_js_present, (const void *fb), {
    var c = Module.canvas || document.getElementById('canvas');
    if (!c) return;
    if (!Module._capCtx) {
        Module._capCtx = c.getContext('2d');
        Module._capImg = Module._capCtx.createImageData(640, 400);
    }
    var src = HEAPU8.subarray(fb, fb + 640 * 400 * 4);
    var dst = Module._capImg.data;
    for (var i = 0; i < src.length; i += 4) {
        dst[i] = src[i + 2];
        dst[i + 1] = src[i + 1];
        dst[i + 2] = src[i];
        dst[i + 3] = 255;
    }
    Module._capCtx.putImageData(Module._capImg, 0, 0);
});

EM_JS(void, cap_js_title, (const char *t), { document.title = UTF8ToString(t); });

WEAK void cap_render_init(void) {}

WEAK void cap_render_present(const pixel_t *fb)
{
    cap_js_present(fb);
}

WEAK uint32_t cap_time_ms(void)
{
    // +1 keeps the value nonzero: i_timer.c treats basetime==0 as unset.
    return (uint32_t)emscripten_get_now() + 1;
}

WEAK void cap_sleep_ms(uint32_t ms)
{
    emscripten_sleep(ms);
}

WEAK void cap_set_title(const char *title)
{
    cap_js_title(title);
}

#define QSIZE 256
static struct { unsigned char pressed, key; } q[QSIZE];
static unsigned qhead, qtail;
static unsigned char down[256];

WEAK void cap_input_init(void) {}
WEAK void cap_audio_init(void) {}

WEAK int cap_input_poll(int *pressed, unsigned char *doom_key)
{
    if (qhead == qtail)
        return 0;
    *pressed = q[qhead % QSIZE].pressed;
    *doom_key = q[qhead % QSIZE].key;
    qhead++;
    return 1;
}

WEAK void cap_input_event(int pressed, int doom_key)
{
    if (doom_key <= 0 || doom_key > 255 || qtail - qhead >= QSIZE)
        return;
    down[doom_key] = pressed != 0;
    q[qtail % QSIZE].pressed = pressed != 0;
    q[qtail % QSIZE].key = (unsigned char)doom_key;
    qtail++;
}

WEAK void cap_input_reset(void)
{
    for (int k = 1; k < 256; k++) {
        if (down[k])
            cap_input_event(0, k);
    }
}
