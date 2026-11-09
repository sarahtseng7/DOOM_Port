FINDINGS

No defect found in my scope and no source files changed. I rebuilt on the current tree and re-measured audio. This is FINDINGS because nobody has listened to the output, music is not OPL-accurate, and controls were not re-run by me.

## Source identity
HEAD e500c44 plus uncommitted changes. emcc 4.0.18. Built with `make BUILD=$O/build DIST=$O/dist` (make.log, exit 0). doom.wasm sha256 prefix 6c93cbf125bd366a, which matches the coder_render_timing build. The repo `dist/` is stale (a4c6846627bdcb21) and needs a rebuild by coder. web/input_audio.js and web/audio_web.js are cmp-identical to the built copies. No artifacts/specification.md or acceptance-criteria.md exists.

## Prior findings read
All six files in artifacts/reports/. Nothing open and actionable in my scope. The tester's I6 flake is oracle-owned, and coder's position exports (bridge v4) are the fix on the tester's side.

## Evidence (this dir)
check.mjs (copied from coder_input_audio.9u4tS4; headless Chromium, no autoplay flag; not a protected check) run against $O/dist -> audio_result.json, check.err (empty), exit 0:
- Before any key: context `suspended`, 0 notes, peak 0. An initialised context is not output.
- After Enter x4 and Ctrl fire: context `running`, SFX 4 requested / 4 played / 0 suppressed / 0 bad, 3 songs started, 73 notes scheduled, 5 voices, peak 0.39, 0 music errors, 0 page errors.
- Controls were not re-run by me. I rely on the tester (fault injection, 38/39 checks) and reviewer_gameplay against the earlier wasm.

## Unresolved (owner)
1. UNVERIFIED, tester/student: no human has listened. The analyser peak only shows non-silent output.
2. Unmet, student decision: music is a GM-family oscillator synth, not GENMIDI/OPL, so timbre differs from original Doom.
3. UNVERIFIED, tester: door use, pickups, damage/death, other E1 songs, SFX/music balance, real hidden tab, Safari/Firefox.
4. Known limits: linked-sound pitch ignored; first SFX before a gesture is dropped, and that is the source of the autoplay console warnings; WASD and mouse not mapped (Doom default keys only).
5. coder: rebuild repo dist/.

## Assumptions
- I did not gate AudioContext creation behind a gesture to silence the warnings. musicPlay returns early without a context and would lose a song requested before the first key press, a regression risk for a cosmetic warning.
- Persistence is out of scope (none supplied); volumes reset on load.
- Doom default key bindings are the control requirement.
- Manual interventions: none. Usage: not available.
