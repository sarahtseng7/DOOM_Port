// Browser audio backend for the Doom port (coder_input_audio-owned).
// Provides DG_sound_module / DG_music_module (engine built with -DFEATURE_SOUND).
// SFX: DMX lumps from the WAD are handed to web/audio_web.js (Web Audio).
// Music: MUS lumps are converted to MIDI with the engine's mus2mid, then
// sequenced and synthesised in JS. Not OPL-accurate (GENMIDI is not used).
// Requires window.CapAudio from web/audio_web.js; without it the calls are no-ops.

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <emscripten.h>

#include "capstone_bridge.h"
#include "doomtype.h"
#include "i_sound.h"
#include "memio.h"
#include "mus2mid.h"
#include "w_wad.h"
#include "z_zone.h"

// Referenced by m_config.c's config table when FEATURE_SOUND is defined.
int use_libsamplerate = 0;
float libsamplerate_scale = 0.65f;

EM_JS(int, cap_js_sfx_start, (int ch, int lump, const unsigned char *p, int len, int vol, int sep), {
    return (window.CapAudio) ? window.CapAudio.sfxStart(ch, lump, p, len, vol, sep) : 0;
});
EM_JS(void, cap_js_sfx_params, (int ch, int vol, int sep), {
    if (window.CapAudio) window.CapAudio.sfxParams(ch, vol, sep);
});
EM_JS(void, cap_js_sfx_stop, (int ch), {
    if (window.CapAudio) window.CapAudio.sfxStop(ch);
});
EM_JS(int, cap_js_sfx_playing, (int ch), {
    return (window.CapAudio && window.CapAudio.sfxPlaying(ch)) ? 1 : 0;
});
EM_JS(void, cap_js_music_play, (const unsigned char *p, int len, int loop), {
    if (window.CapAudio) window.CapAudio.musicPlay(p, len, loop);
});
EM_JS(void, cap_js_music_call, (int op, int arg), {
    if (window.CapAudio) window.CapAudio.musicOp(op, arg);
});
EM_JS(int, cap_js_music_playing, (void), {
    return (window.CapAudio && window.CapAudio.musicPlaying()) ? 1 : 0;
});

// ---- sound effects ------------------------------------------------------

static snddevice_t sfx_devices[] = {
    SNDDEVICE_SB, SNDDEVICE_PAS, SNDDEVICE_GUS, SNDDEVICE_WAVEBLASTER,
    SNDDEVICE_SOUNDCANVAS, SNDDEVICE_AWE32, SNDDEVICE_ADLIB, SNDDEVICE_GENMIDI,
};

static boolean use_prefix;

static boolean sfx_init(boolean use_sfx_prefix)
{
    use_prefix = use_sfx_prefix;
    return true;
}

static void sfx_shutdown(void) {}

static int sfx_get_lump(sfxinfo_t *sfx)
{
    char name[16];
    snprintf(name, sizeof name, use_prefix ? "ds%s" : "%s", sfx->name);
    return W_GetNumForName(name);
}

static void sfx_update(void) {}

static void sfx_update_params(int channel, int vol, int sep)
{
    cap_js_sfx_params(channel, vol, sep);
}

static int sfx_start(sfxinfo_t *sfx, int channel, int vol, int sep)
{
    int lump = sfx->lumpnum;
    if (lump < 0)
        return -1;
    const unsigned char *d = W_CacheLumpNum(lump, PU_STATIC); // stays resident: JS decodes once per lump
    int len = W_LumpLength(lump);
    if (!cap_js_sfx_start(channel, lump, d, len, vol, sep))
        return -1;
    return channel;
}

static void sfx_stop(int channel) { cap_js_sfx_stop(channel); }
static boolean sfx_is_playing(int channel) { return cap_js_sfx_playing(channel); }

sound_module_t DG_sound_module = {
    sfx_devices, sizeof sfx_devices / sizeof sfx_devices[0],
    sfx_init, sfx_shutdown, sfx_get_lump, sfx_update, sfx_update_params,
    sfx_start, sfx_stop, sfx_is_playing, NULL,
};

// ---- music --------------------------------------------------------------

typedef struct { unsigned char *midi; int len; } song_t;

static boolean mus_init(void) { return true; }
static void mus_shutdown(void) { cap_js_music_call(0, 0); }
static void mus_set_volume(int volume) { cap_js_music_call(1, volume); }
static void mus_pause(void) { cap_js_music_call(2, 0); }
static void mus_resume(void) { cap_js_music_call(3, 0); }

static void *mus_register(void *data, int len)
{
    song_t *s = calloc(1, sizeof *s);
    if (!s)
        return NULL;
    if (len >= 4 && memcmp(data, "MThd", 4) == 0) { // already MIDI
        s->midi = malloc(len);
        if (s->midi) { memcpy(s->midi, data, len); s->len = len; }
    } else {
        MEMFILE *in = mem_fopen_read(data, len);
        MEMFILE *out = mem_fopen_write();
        void *buf; size_t blen;
        if (!mus2mid(in, out)) { // mus2mid returns true on FAILURE
            mem_get_buf(out, &buf, &blen);
            s->midi = malloc(blen);
            if (s->midi) { memcpy(s->midi, buf, blen); s->len = (int)blen; }
        }
        mem_fclose(in);
        mem_fclose(out);
    }
    if (!s->midi) { free(s); return NULL; }
    return s;
}

static void mus_unregister(void *handle)
{
    song_t *s = handle;
    if (s) { free(s->midi); free(s); }
}

static void mus_play(void *handle, boolean looping)
{
    song_t *s = handle;
    if (s) cap_js_music_play(s->midi, s->len, looping ? 1 : 0); // JS parses/copies immediately
}

static void mus_stop(void) { cap_js_music_call(0, 0); }
static boolean mus_is_playing(void) { return cap_js_music_playing(); }

static snddevice_t mus_devices[] = { SNDDEVICE_SB, SNDDEVICE_ADLIB, SNDDEVICE_GENMIDI, SNDDEVICE_SOUNDCANVAS, SNDDEVICE_GUS, SNDDEVICE_AWE32, SNDDEVICE_WAVEBLASTER };

music_module_t DG_music_module = {
    mus_devices, sizeof mus_devices / sizeof mus_devices[0],
    mus_init, mus_shutdown, mus_set_volume, mus_pause, mus_resume,
    mus_register, mus_unregister, mus_play, mus_stop, mus_is_playing, NULL,
};

void cap_audio_init(void) {}
