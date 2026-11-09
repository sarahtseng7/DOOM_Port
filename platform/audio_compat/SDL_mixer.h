// Empty stand-in for <SDL_mixer.h>. i_sound.c includes it when FEATURE_SOUND
// is defined, but this port plays audio through Web Audio (platform/audio_web.c,
// web/audio_web.js) and uses no SDL_mixer symbols. Needs -Iplatform/audio_compat.
#ifndef CAP_SDL_MIXER_STUB_H
#define CAP_SDL_MIXER_STUB_H
#endif
