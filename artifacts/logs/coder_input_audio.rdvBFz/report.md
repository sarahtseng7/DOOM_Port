FINDINGS

No defect found in my scope; no source files changed this run. Audio output is non-silent by measurement, but nobody has listened, and music is not OPL-accurate.

## Source identity
HEAD e500c44 + uncommitted changes. dist/doom.wasm sha256 prefix a4c6846627bdcb21 (same as all prior reports). web/input_audio.js and web/audio_web.js are byte-identical to dist/ copies (cmp). Input/audio sources are older than dist/doom.wasm; I did not rebuild. No artifacts/specification.md or acceptance-criteria.md exists.

## Prior findings read
All six files in artifacts/reports/. Nothing open and actionable in my scope.

## Evidence (this dir)
check.mjs (copied from coder_input_audio.zZGUhu; headless Chromium, no autoplay flag; not a protected check) re-run against dist/ -> audio_result.json, check.err (empty), exit 0:
- Before any key: ctx `suspended`, 0 notes, peak 0 (initialised context is not output).
- After Enter x4 and Ctrl fire: ctx `running`, SFX 4 requested/4 played/0 suppressed/0 bad, 3 songs started, 73 notes scheduled, 5 voices, peak 0.39, 0 music errors, 0 page errors.
- Controls not re-run by me; relying on the tester (fault injection 4/4, verify.sh exit 0) and reviewer_gameplay runs against the same wasm hash.

## Unresolved (owner)
1. UNVERIFIED, tester/student: no human has listened; analyser peak only shows non-silent output.
2. Unmet, student decision: music is a GM-family oscillator synth, not GENMIDI/OPL; timbre differs from original Doom.
3. UNVERIFIED, tester: door use, pickups, damage/death, other E1 songs, SFX/music balance, real hidden tab, Safari/Firefox.
4. Known limits: linked-sound pitch ignored; first SFX before a user gesture is dropped (source of the autoplay console warnings); WASD and mouse not mapped (Doom default keys only).
5. Tester: I6.backward-returns marginal (0.60-0.79 vs 0.7 limit); oracle-owned.

## Assumptions
- Persistence out of scope (none supplied); volumes reset on load.
- Doom default key bindings are the control requirement.
- No speculative edits to code that passes existing checks.
- Manual interventions: none. Usage: not available.
