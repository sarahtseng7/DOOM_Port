FINDINGS

No defect found in my scope; no source files changed. Audio output is non-silent by measurement, but nobody has listened, and music is not OPL-accurate.

## Source identity
HEAD e500c44 + uncommitted changes. `dist/doom.wasm` sha256 prefix a4c6846627bdcb21, same as all earlier reports. web/input_audio.js and web/audio_web.js are byte-identical to their dist/ copies (cmp). I did not rebuild. No artifacts/specification.md or acceptance-criteria.md exists.

## Prior findings read
All six files in artifacts/reports/. Nothing open in my scope. Latest tester run: verify.sh exit 0, controls fault injection caught 4/4. Latest gameplay review: movement, fire, Esc pause, blur release and volume 0 behave correctly.

## Evidence (this dir)
check.mjs (copied from coder_input_audio.zZGUhu; headless Chromium, no autoplay flag; not a protected check) -> audio_result.json, check.err (empty, exit 0):
- Before any key: ctx `suspended`, 0 notes, peak 0. An initialised context is not output.
- After Enter x4 and Ctrl fire: ctx `running`, SFX 4 requested / 4 played / 0 suppressed / 0 bad, 3 songs started, 73 notes scheduled, 5 voices, peak 0.39, 0 music errors, 0 page errors.
- Controls not re-run by me; relying on tester and reviewer runs against the same wasm hash.

## Unresolved (owner)
1. UNVERIFIED, tester/student: no human has listened; analyser peak shows non-silent output only.
2. Unmet, student decision: music is a GM-family oscillator synth, not GENMIDI/OPL, so timbre differs from original Doom.
3. UNVERIFIED, tester: door use, pickups, damage/death, other E1 songs, SFX/music balance, real hidden tab, Safari/Firefox.
4. Known limits: linked-sound pitch ignored; the first SFX before a user gesture is dropped (this also causes the autoplay console warnings reviewer_site noted); WASD and mouse not mapped (Doom default keys only).
5. Tester: I6.backward-returns is marginal (0.60-0.79 vs 0.7 limit); tester-owned.

## Assumptions
- Persistence out of scope (none supplied); volumes reset on load.
- Doom default key bindings are the control requirement.
- No speculative edits to code that passes existing checks.
- Manual interventions: none. Usage: not available.
