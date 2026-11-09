FINDINGS

No source edits. Two fresh audio runs showed the analyser peak at 0, unlike the prior run (0.388). I could not explain this, so I do not call the audio verified.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix 2c74d74fd2c699f9 and dist/doom.wasm prefix 7afb94fa1ec64b5c, both identical to the previous runs. I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
README.md, loop/README.md, artifacts/README.md, AGENTS.md, my role prompt, and all six files in artifacts/reports/. None asks for a change in my owned files.

## Evidence (this dir)
check.mjs is copied from coder_input_audio.kjW35H (headless Chromium, no autoplay flag, not a protected check). check2.mjs is the same with a polling loop (up to 5 s) after the last key. Outputs are check.out/err and check2.out/err.
- Before any key: ctx `suspended`, 0 SFX, 0 notes, peak 0. A song was requested and started.
- After keys (run 1): ctx `running`, SFX 5 requested / 5 played / 0 bad, 3 songs started, 16 notes scheduled, 6 music voices, 0 music errors, no page errors. **maxPeak 0.**
- Run 2 (polling): ctx `running`, SFX 4 played, 16 notes, **maxPeak 0 after 5 s of polling**, no page errors.
- Prior run (kjW35H, same hashes): 73 notes, peak 0.388.

## Unresolved (owner)
1. UNEXPLAINED, coder_input_audio/tester: peak 0 and 16 notes in both runs, versus 0.388 and 73 before, on identical source. Machine load average was about 4 and the node runs were slow (over 120 s wall time, against about 12 s of scripted waits). My guess is that the headless audio clock stalled under load, but I did not test this. A real failure of the output path is not ruled out. Next step: rerun on an idle machine, or headed. The tester's 'A1' check should say whether it asserts on peak.
2. UNVERIFIED, student/human: no one has listened (SFX identity, music, balance).
3. Unmet, student decision: music is a GM-family oscillator synth, not GENMIDI/OPL.
4. UNVERIFIED, tester: other E1 songs, real hidden tab, Firefox/Safari. I did not re-run controls this run and rely on tester.puK0iM on the same hashes.
5. Known limits (mine, unfixed): linked-sound pitch ignored; first SFX before a gesture is dropped (autoplay policy); WASD and mouse not mapped.

## Assumptions
- Doom default keys are the control requirement. Persistence is out of scope (none supplied); volumes reset on load.
- AudioContext is created early and resumes on the first gesture.
- Manual interventions: none. Usage: not available. I wrote only in this directory.

## Next action
Rerun check2.mjs when the machine is idle to separate load from a real output fault. Human listens to SFX and music.
