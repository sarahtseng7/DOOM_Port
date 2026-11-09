FINDINGS

Movement, fire, menus, focus-loss and audio output were observed working in headless Chromium. FINDINGS (not PASS) because real audibility, a real hidden tab, OPL music fidelity, door/use and level exit are unverified, and criteria remain agent-proposed.

## Source identity
HEAD e500c44 + uncommitted changes. Tested the existing dist/ (not rebuilt; emsdk not used). doom.wasm sha256 prefix a4c6846627bdcb21 (same as reviewer_site's). Server: `python3 -m http.server 8123 --directory dist`, started and stopped by me (port was free).

## Prior reports read
coder, coder_input_audio, coder_render_timing, reviewer_site, tester. Startup concerns left to reviewer_site; I did not repeat them. Their claims on controls/audio were re-observed, not assumed.

## Work and evidence (this dir)
review.mjs -> run1.log, run1/screens, run1/review-results.json. vol.mjs -> vol.log, vol/. Ad-hoc Playwright, headless Chromium, 800x600, NO --autoplay-policy flag (prior audio checks used it). Not protected checks.
- Autoplay: before any gesture AudioContext is `suspended` (music requested, 0 notes, peak 0). After one Enter keydown it is `running`, notes scheduled, master-bus peak 0.23. This closes the gap in coder_input_audio's item 5.
- Level entry via menu (Enter x4): status bar and E1M1 view correct (01-level.png), 35.0 tics/s measured via `_cap_tic_count`.
- Momentum: forward held 500 ms, then view change per 250 ms after release was 0.50, 0.34, 0.19, 0.09, then 0 for 2 s. It coasts about 1 s and then stops, which is normal Doom friction, not a stuck key.
- Period (strafe) and Shift+Up (run) both move the view (diff 0.50, 0.69). Held ArrowRight with an injected `blur`: view stopped (diff 0.001).
- Fire: Ctrl once decrements ammo (50 -> 45 after 5 shots in total), the ammo region changes (0.14), and an SFX is played per shot. Holding Ctrl 1.5 s gave 4 more shots with SFX 5 -> 9.
- Menu: Esc opens the main menu (23-esc-menu.png) with correct colours and cursor.
- Music: title music starts after the gesture; E1M1 song switches in (musicStarted 3). SFX counters: 11 requested, 11 played, 0 suppressed, 0 bad lumps, 0 music errors. maxPeak 0.51 over the run.
- Options > Sound Volume (arrow keys): music volume at 0 gives master peak 0 (SFX idle), restoring gives 0.36. The volume slider reaches the audio path (vol.log).
- Console/page errors: none.

## Not a defect (my first checks were wrong)
- "menu SFX after first Enter" FAILed: sfxRequested was 0 right after the title-screen Enter. The engine plays no sound for that key; later menu Enters did request SFX (4 by the time of fire). I judge this expected Doom behavior, but did not confirm it from engine source.
- "menu pauses game" FAILed on `_cap_tic_count` (34 tics/s with menu open). That counter is the engine gametic, which keeps advancing while the world is paused, so it cannot show pause. Pause was not shown either way by pixels (E1M1 start is mostly static). UNVERIFIED.

## Unresolved (owner)
1. UNVERIFIED, tester/student: sound was never heard by a human. Evidence is the analyser peak only, which proves non-silent output on the Web Audio graph, not correct or pleasant sound. Music is a GM-family oscillator approximation, not OPL (known; owner coder_input_audio/student).
2. UNVERIFIED, tester: hidden-tab behaviour. Playwright headless reports `document.hidden=false` even with another tab foregrounded, so throttling, audio during background and key release on a real hide were not exercised (H1 remains; coder_render_timing).
3. UNVERIFIED, tester: Use key on a door, pick-ups, damage/death, level exit, saving; the Space press found no door (no SFX delta) and I did not navigate to one. Mouse and WASD are not mapped (Doom defaults only; the arrows/Ctrl/Space/Shift/comma/period set works). Mapping WASD would be a student scope decision.
4. UNVERIFIED: the other E1 songs, loudness balance of music vs SFX, Safari/Firefox, headed browser, HiDPI.
5. Minor (reviewer_site's items stand): first SFX requested while the context is suspended is dropped by design (sfxSuppressed 0 in my runs because I pressed Enter first).

## Assumptions
- Doom default key bindings are the requirement; there is no specification.md or acceptance-criteria.md.
- Screenshot differences stand in for player position (no engine position export).
- "Stops after release" allows about 1 s of Doom friction; the pass limit I used is <2% frame diff for the last 3 samples.
- A non-silent master-bus peak is the strongest audio evidence available without a human listener.
- Manual interventions: none.
