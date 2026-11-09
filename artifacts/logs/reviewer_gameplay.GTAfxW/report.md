FINDINGS

Movement, turning, fire, menus, blur and audio were observed working on the current dist/. This is FINDINGS rather than PASS because nobody has listened to the audio, and door use, pickups, damage, a real hidden tab and non-Chromium browsers were not exercised. No defect was found in my scope, and I changed no source.

## Source identity
HEAD e500c44 plus uncommitted changes. `make -n` reports nothing to do. dist/doom.wasm sha256 prefix a4c6846627bdcb21, the same as the prior reports. I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
All six files in artifacts/reports/. The open items in my scope were the lack of human listening, OPL-inaccurate music, and unexercised door/pickup/damage/hidden-tab. None is a new defect.

## Work and evidence (this directory)
`drive.mjs` is my own script and is not a protected check. It uses headless Chromium via Playwright against a throwaway local server, and wraps AudioNode.connect/start to tap analyser output. Outputs: results.json, console.txt, screenshots 01-10 (viewed: 07-fire.png, 10-esc-menu.png).
- **Audio before gesture:** 0 sources, 0 oscillators, peak 0.
- **Menu and new game:** Enter navigated the title menu, New Game, episode and skill. E1M1 loaded with the HUD showing health 100%, ammo 50, and the pistol.
- **Audio after gesture:** the context is `running`. 18 buffer sources and 60 oscillators started. Analyser peak 0.42, so output is non-silent. By the end there were 67 sources and 304 oscillators, so SFX and music both play.
- **Turning:** right shifted the view -162 px and left +159 px, and each settled in about 0.37 s. The view is stable after release.
- **Forward movement:** 1 s held changed 70% of view pixels. After release the view settled in about 2.2 s (normal Doom momentum, inside the 4 s allowance), and afterwards diffed 0.00005 from the settled frame, so there is no drift.
- **Run (Shift+Up):** the view changed 91%, and it settled about 0.36 s after release. That is quick, probably because I ran into a wall, so I don't treat it as a stop-latency measurement.
- **Fire (Ctrl):** the weapon region changed 36%, and ammo went 50 to 49 after one shot and 46 after four total. Fire SFX started new sources (30 to 34 buffer sources).
- **Use (Space):** the key was sent and nothing broke. I did not stand at a door, so I can't confirm it opened.
- **Focus loss:** a blur event while ArrowRight was held stopped the turn. The view settled in about 0.37 s and had zero drift 0.8 s later, even though the key was still physically down.
- **Esc menu:** it opens over the live game (93% view change) and closes on a second Esc. The pointer skull and menu items render correctly (10-esc-menu.png).
- **Timing during play:** about 35 tics/s, read from `_cap_tic_count` over 2 s.
- **Console:** no page errors. console.txt holds only the engine startup log.

## Unresolved (owner)
1. UNVERIFIED, tester/student: no human has listened to the audio. Peak and node counts show non-silent output, not correct or pleasant sound.
2. Unmet, student decision: the music is an oscillator synth, not GENMIDI/OPL, as the coder_input_audio report says.
3. UNVERIFIED, tester: door use, pickups, damage and death, SFX/music balance, a real hidden tab (I used a synthetic blur event), and Safari and Firefox.
4. Limits already reported by coder_input_audio: WASD and mouse are not mapped (Doom default keys only), and the first SFX before a gesture is dropped.

## Assumptions
- Doom default keys (arrows, Ctrl, Space, Shift) are the control requirement, since there is no spec.
- Movement is judged by canvas pixel diffs (the engine exports no player position). The settle threshold is a 0.2% view diff.
- Normal momentum is allowed, up to 5 s to settle.
- Manual interventions: none. Usage: not available.
