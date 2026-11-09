FINDINGS

Movement, momentum, turning, strafe, run, fire, menu freeze, blur and timing behaved correctly in headless Chromium on the existing dist/. Audio ran and was non-silent (peak 0.46), but nobody has listened to it, so audio correctness is UNVERIFIED. Real hidden-tab behaviour is also UNVERIFIED.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix c9b3c829ca2c5a67 and dist/doom.wasm prefix 7afb94fa1ec64b5c, both the same as the earlier reports. `make -n`: nothing to be done, so I did not rebuild. artifacts/specification.md and artifacts/acceptance-criteria.md do not exist.

## Work
Read AGENTS.md, README.md, my role prompt and the six reports in artifacts/reports/. Copied the previous review.mjs into this OUTPUT_DIR and ran it against a local server (port 8187, stopped afterwards) in headless Chromium, 800x600, with no autoplay-policy flag. I changed one check, explained below. Source files were not touched.

## Results (evidence: review.log, review-results.json, screens/)
All 13 checks PASS:
- ctx suspended before the gesture, running after Enter (browser policy honoured)
- title music started (peak 0.23); level music switched (3 starts)
- 35.0 tics/s
- forward coast: post-release frame diffs 0.495 0.352 0.191 0.12 then 0 for 8 samples (decays, then stops)
- "." strafes (diff 0.50), Shift+Up runs (0.69)
- Ctrl fire: ammo changed, SFX 4->5; held fire 5->9 SFX
- Esc menu freezes the world (diff 0.000 over 1.5 s)
- audio clock advanced 2.005 s per 2.003 s wall
- window blur while turning stops the turn (diff 0.000)
- tics return to 35.0/s after a second page is foregrounded and then closed
- 0 page or console errors; final audio stats sfxPlayed 11/11, sfxBad 0, musicErrors 0, maxPeak 0.461

## Check changed (test correction, my own script)
`A.menu-sfx-and-music-heard` failed every earlier run because it required an SFX on the first title-screen Enter. Doom plays none there. It is now `A.title-music-heard` (musicStarted > 0 and peak > 0.01). The expectation was wrong and the product was not; it is still a weaker check than "SFX heard".

## Unresolved (owner)
1. UNVERIFIED, human: SFX and music by ear on a real audio output (A1). Peak levels only show non-silence.
2. UNVERIFIED, tester/human: a real hidden tab (H1). In headless, `document.hidden` stayed false (vis=visible) when a second page was opened, so my tab-switch step did not hide the page and says nothing about catch-up. Follow tester H1 protocol in tests/README.md.
3. UNVERIFIED: Use (Space) produced no SFX at the spawn point (delta 0), which is expected with nothing to use. Door use is covered by the tester's G3a, not by me.
4. Carried over, student decision: music is an oscillator synth, not GENMIDI/OPL-faithful (owner coder_input_audio if made a requirement). WASD and mouse are not mapped. Volume settings are not persisted. Firefox and Safari untested.
5. No new defects found; nothing to assign to coder_input_audio, coder_render_timing or coder.

## Assumptions
- Doom default keys (arrows, Ctrl fire, Space use, Esc menu, Shift run, "." strafe) are the control requirement.
- Pixel diffs on the 3D view stand in for movement because the engine state is not read here; "stops" means diff < 0.02 for the last three 250 ms samples.
- Criteria are agent-proposed, not student-approved. Manual interventions: none. Token usage: not available.
- Wrote only into this OUTPUT_DIR (review.mjs, review.log, screens/, server.log, server.pid, report.md).

## Next action
Human: run headed with working audio, listen to SFX and music, and test a real hidden tab. If WASD, mouse, OPL music or persistence become requirements, the owner implements them, the coder rebuilds, and this review reruns.
