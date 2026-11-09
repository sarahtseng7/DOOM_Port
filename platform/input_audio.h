// Private header for platform/input_audio.c (coder_input_audio-owned).
// The cross-module hooks are declared in capstone_bridge.h; only extras here.
#ifndef INPUT_AUDIO_H
#define INPUT_AUDIO_H

// Diagnostics for tests/reports (not exported to JS unless the coder adds
// them to EXPORTED_FUNCTIONS).
unsigned cap_input_dropped(void);   // events rejected (queue full, repeat, bad key)
unsigned cap_input_delivered(void); // events handed to the engine

#endif // INPUT_AUDIO_H
