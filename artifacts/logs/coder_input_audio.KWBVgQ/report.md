FINDINGS

# coder_input_audio report (OUTPUT_DIR artifacts/logs/coder_input_audio.KWBVgQ)

Source: commit e500c44 + uncommitted changes. emcc 4.0.18. artifacts/specification.md and acceptance-criteria.md do not exist.
Why FINDINGS: audio is implemented and measured in headless Chromium, but it is NOT wired into the real build (needs coder edits), music is not OPL-accurate, and nothing was heard by a human or run through tests/verify.sh.

## Work
- Prior reports read (coder, coder_render_timing, tester). Controls (input_audio.c / web/input_audio.js) were already in place and passed the tester's checks; no defect found, left unchanged apart from removing the empty `cap_audio_init` (moved to audio_web.c).
- New `platform/audio_web.c`: engine `DG_sound_module` + `DG_music_module` (the hooks i_sound.c expects under FEATURE_SOUND), plus `use_libsamplerate`/`libsamplerate_scale` that m_config.c references. SFX lumps (DMX) go to JS; MUS lumps are converted to MIDI with the engine's `mus2mid` and passed to JS.
- New `web/audio_web.js` (`window.CapAudio`): SFX decode (8-bit PCM, 16-byte DMX padding trimmed) -> per-channel gain + stereo pan (engine vol/sep honoured, `SoundIsPlaying` driven by wall-clock so a suspended context cannot wedge engine channels); MIDI parser with tempo map; look-ahead sequencer; oscillator synth by GM family; noise/sine percussion on channel 9; per-channel volume/expression/pan/pitch-bend; looping; pause/resume; music volume. The context is resumed on keydown/pointerdown.
- New `platform/audio_compat/SDL_mixer.h`: empty stand-in, because i_sound.c includes `<SDL_mixer.h>` under FEATURE_SOUND and third_party/ is read-only.
- Bug found and fixed while testing: `mus2mid()` returns true on FAILURE (comment says "0 on success"); my first version inverted this and no song was ever registered.

## Genuine output vs initialised context
`CapAudio.stats()` reports counters plus `maxPeak`/`lastPeak`, measured with an AnalyserNode on the master bus (after the compressor, before `destination`). `ctxState: running` alone is not evidence.

## Evidence (this dir; scratch build, real dist/ untouched)
Built with `make BUILD=$O/build DIST=$O/dist CFLAGS="-O2 -Ithird_party/doomgeneric -Iplatform -Iplatform/audio_compat -DFEATURE_SOUND -MMD -MP"`, then audio_web.js copied and its script tag added to the dist copy's index.html. Scripts: audio_check.mjs, audio_check2.mjs (ad-hoc Playwright, headless Chromium with `--autoplay-policy=no-user-gesture-required`; not protected checks). Results: run2/audio_result.json, run2/audio_check2.json, run1/ (pre-fix: music 0 requests, SFX only), screenshots run2/title.png, play.png.
- Title screen after 3 s: music started (1 song, 37 notes scheduled, 9 voices), master peak 0.19, no page errors.
- New game: music switched to the E1M1 song (2 songs started, 123 notes by end of run); pistol/door/menu SFX 7 of 7 played, 0 suppressed, 0 bad lumps; peak 0.39.
- Music only: peak 0.28. Engine pause: peak 0 (voices 0). Unpause: peak 0.29, 14 voices. Music volume uses the same path as the slider but was not exercised from the menu.
- Controls still work on this build: `_cap_input_delivered_count()` 8 -> 12 after ArrowUp/ArrowLeft, 53 tics advanced.
- `emcc -O2 -Ithird_party/doomgeneric -Iplatform -c platform/audio_web.c` (default flags, no FEATURE_SOUND) compiles, so the wildcard Makefile will not break before the coder's edits land.

## Unresolved (owner)
1. **coder: wire it in.** (a) Makefile CFLAGS: add `-DFEATURE_SOUND -Iplatform/audio_compat` (applies to engine and platform; i_sound.c, m_config.c and s_sound.c need FEATURE_SOUND). (b) `WEB_FILES += web/audio_web.js`. (c) `<script src="audio_web.js"></script>` in web/index.html, before doom.js. Without (a) the engine silently has no sound module and the port stays silent.
2. **tester:** A1 can be checked with `CapAudio.stats()` (`sfxPlayed`, `musicStarted`, `maxPeak` > 0 after a keypress gesture); the real-browser autoplay policy was not tested, as headless was run with the flag that disables it. Also not covered: music volume from the options menu, and fault injection for audio.
3. **Music fidelity (unmet):** the synth is a generic approximation by General MIDI program family. GENMIDI/OPL instrument definitions are not used, so it will not sound like OPL Doom. The other E1 songs were not individually checked (only the title and E1M1 song were started). Not heard by a human.
4. **SFX limits:** pitch of linked sounds is ignored; nothing is resampled in C (the browser resamples the 11/22 kHz buffers); a first sound requested while the context is still suspended is dropped (counted in `sfxSuppressed`) until a gesture arrives.
5. Not run: tests/verify.sh, headed browser, Safari/Firefox, background-tab behaviour, loudness balance between music and SFX (music bus is simply 0.5).

## Assumptions
- Persistence is out of scope (no scope was supplied); volumes use engine defaults each load and nothing is stored.
- Sound devices list is permissive (SB/ADLIB/GENMIDI etc.) so the engine's default `snd_sfxdevice` selects my module.
- Music is allowed to differ in timbre from OPL; the task prompt permits a practical backend with honest reporting.
- Manual interventions: none.
