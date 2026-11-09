// Keyboard input queue for the WebAssembly port (coder_input_audio-owned).
// JS (web/input_audio.js) calls cap_input_event(); the engine drains events via
// DG_GetKey -> cap_input_poll(). Strong definitions override cap_fallback.c.
//
// Invariants:
//  - Events are doomkeys.h codes 1..255.
//  - A press for a key already down (auto-repeat) is dropped; a release for a
//    key that is not down is dropped. The engine therefore sees strictly
//    alternating press/release per key.
//  - A release is never lost to a full queue: presses are refused once
//    PRESS_LIMIT entries are pending, and at most 255 releases can be
//    outstanding, so the queue (2*PRESS_LIMIT) always has room for them.
//  - cap_input_reset() queues a release for every key still down.
// Audio lives in audio_web.c / web/audio_web.js. Persistence is not implemented (see report).

#include <string.h>

#include "capstone_bridge.h"
#include "input_audio.h"

#define PRESS_LIMIT 256
#define QSIZE       512 /* power of two */

static struct { unsigned char pressed, key; } q[QSIZE];
static unsigned qhead, qtail;
static unsigned char down[256];
static unsigned dropped, delivered;

static void push(int pressed, int key)
{
    q[qtail % QSIZE].pressed = (unsigned char)pressed;
    q[qtail % QSIZE].key = (unsigned char)key;
    qtail++;
}

void cap_input_init(void)
{
    qhead = qtail = 0;
    memset(down, 0, sizeof down);
}

int cap_input_poll(int *pressed, unsigned char *doom_key)
{
    if (qhead == qtail)
        return 0;
    *pressed = q[qhead % QSIZE].pressed;
    *doom_key = q[qhead % QSIZE].key;
    qhead++;
    delivered++;
    return 1;
}

void cap_input_event(int pressed, int doom_key)
{
    if (doom_key <= 0 || doom_key > 255) {
        dropped++;
        return;
    }
    pressed = pressed != 0;
    if (pressed == down[doom_key]) { // repeat press or stray release
        dropped++;
        return;
    }
    if (pressed && qtail - qhead >= PRESS_LIMIT) {
        dropped++;
        return;
    }
    down[doom_key] = (unsigned char)pressed;
    push(pressed, doom_key);
}

void cap_input_reset(void)
{
    for (int k = 1; k < 256; k++) {
        if (down[k])
            cap_input_event(0, k);
    }
}

unsigned cap_input_dropped(void)   { return dropped; }
unsigned cap_input_delivered(void) { return delivered; }
