FINDINGS

# Coder integration report (OUTPUT_DIR artifacts/logs/coder.J22PFD)

Source: commit e500c44 + uncommitted changes. emcc 4.0.18. No artifacts/specification.md or acceptance-criteria.md exist.

## Work
Read reports: coder, coder_input_audio, coder_render_timing, tester. Integrated the specialists' unwired work via my owned files only:
- Makefile: CFLAGS += `-Iplatform/audio_compat -DFEATURE_SOUND` (audio); WEB_FILES += web/audio_web.js web/render_timing.js.
- web/index.html: added `audio_web.js` and `render_timing.js` script tags before doom.js.
- BUILD.md: documented audio flags and script order.
No specialist files, tests/, loop/ touched.

## Evidence
- `make clean && make` succeeded on the real tree; dist/ contains audio_web.js, render_timing.js.
- check.mjs / check.json (ad-hoc Playwright, headless Chromium with autoplay-policy flag; not a protected check): bridge v3, `_cap_input_impl()=1`, `_rt.frames`=541, canvas CSS 1280px at 1280x800; CapAudio: music started 2, SFX 7/7 played, maxPeak 0.38, no page errors. Screenshot play.png.

## Unresolved (owner)
1. tester: full tests/verify.sh (clean build, soak, faults) on this integrated build is NOT run; dist hashes differ from the tester's. Add A1 (CapAudio.stats) and a scaling check; I9 can now use `_cap_input_impl()`.
2. Audio: music is an approximate GM-family synth, not OPL; not heard by a human; real-browser autoplay policy untested (flag used); music volume menu untested (owner: audio specialist/student).
3. Hidden-tab timing (H1) unmitigated; criteria still agent-proposed (student).

## Assumptions
Wildcard platform/*.c picks up audio_web.c; the stub SDL_mixer.h applies engine-wide via -Iplatform/audio_compat. Manual interventions: none.
