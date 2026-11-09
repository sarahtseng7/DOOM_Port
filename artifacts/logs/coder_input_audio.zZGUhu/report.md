FINDINGS

Audio is now wired into the real build and measured output is non-silent, but nothing was heard by a human, music is not OPL-accurate, and tests/verify.sh was not run. No source files were changed this run; only this OUTPUT_DIR was written.

## Source identity
HEAD e500c44 + uncommitted changes. emcc from ~/Developer/emsdk. No artifacts/specification.md or acceptance-criteria.md.

## Prior findings read
reports: coder_input_audio (previous run), reviewer_gameplay, reviewer_site, tester, coder*. The previous blocker (unwired build) is resolved: Makefile now has `-DFEATURE_SOUND -Iplatform/audio_compat`, `web/audio_web.js` in WEB_FILES, and index.html loads audio_web.js (coder's edits).

## Work / evidence (this dir)
- `make BUILD=$O/build DIST=$O/dist` with the repo Makefile as-is: clean build, no errors; dist has audio_web.js.
- check.mjs (ad-hoc headless Chromium, NO autoplay flag, not a protected check) -> audio_result.json:
  - before any key: ctx `suspended`, music requested, 0 notes, peak 0 (an initialised context is not output).
  - after Enter x4 and Ctrl fire: ctx `running`, SFX 4 requested / 4 played / 0 suppressed / 0 bad, 3 songs started, 73 notes scheduled, 5 voices, master-bus peak 0.39, 0 page errors.
- Controls: no defect found; reviewer_gameplay and tester results for movement, fire, menu, blur release stand. Not re-run here.

## Unresolved (owner)
1. UNVERIFIED, tester/student: no human listened; the analyser peak shows non-silent output only.
2. Unmet, student decision: music is a General MIDI-family oscillator synth, not GENMIDI/OPL. Timbre differs from original Doom.
3. UNVERIFIED, tester: door use, pickups, damage/death, other E1 songs, music/SFX balance (music bus 0.5), real hidden tab, Safari/Firefox.
4. Known limits: linked-sound pitch ignored; first SFX before a gesture is dropped; WASD/mouse not mapped (Doom defaults only; scope for student).
5. Tester: tests/verify.sh not run against this build.

## Assumptions
- Persistence out of scope (no scope supplied); volumes reset to engine defaults each load.
- Doom default key bindings are the control requirement.
- Manual interventions: none.
