# coder_input_audio 3-input attempt-1 (run 20261103T002748Z-51080)

Status: FINDINGS. Keyboard is implemented and now behaviourally checked; audio, persistence and mouse remain unimplemented because no scope exists.

Source: commit e500c44 + uncommitted/untracked changes (source-status.txt). Spec, criteria and contract are still AGENT-PROPOSED only; artifacts/ has no specification.md, acceptance-criteria.md or interface-contract.md. I did not invent approval.

## Work done (web/input_audio.js only; platform/input_audio.{c,h} unchanged)
- Found with a new stub-Module check: pressing Left Ctrl then Right Ctrl sent two presses for one Doom key (0xa3) and one release. platform/input_audio.c already dropped the duplicate, so the engine never saw it. Fixed anyway: JS now sends a press only when no other held code maps to the same Doom key. Release logic was already correct.
- Added keycheck.mjs (ad-hoc, in OUTPUT_DIR, not a protected acceptance test). It loads web/input_audio.js into headless Chromium with a stubbed Module. It checks: repeat dropped, blur resets, repeat after blur re-presses (reviewer F2), F5 and Ctrl+R not default-prevented (F3), arrows prevented, L+R Ctrl release only at last, hidden tab resets. Result: 8/8 PASS after the fix. The Ctrl check FAILED before it (the first run showed the duplicate press). Fail then fix is in keycheck.log history above; the log in this dir is the passing run.
- This covers reviewer R2-3 for the JS side only. It does not exercise the real engine, pagehide or contextmenu.

## Evidence
- keycheck.log, keycheck-results.json, keycheck.mjs.
- node --check web/input_audio.js: ok. Snapshot: input_audio.js.snapshot.
- QUICK playtest on role-local dist (dist/20261103T002748Z-51080/coder_input_audio; hashes in dist-sha256.txt; shared dist/ NOT updated, so it holds the previous input_audio.js): failed=0, 3 UNVERIFIED (A1, P1, G3), exit 3 by design. playtest.log, playtest/. One run only; the I3 turn-left check is known flaky (reviewer R2-1), so this pass is weak evidence.

## Not done, and why
- Audio (SFX/music): no scope. Needs FEATURE_SOUND, a DG_sound_module/DG_music_module, an SDL_mixer.h workaround, and build changes (coder). MUS to PCM synthesis is a separate piece of work. A1 stays UNVERIFIED.
- Persistence: no scope. Proposal: IDBFS mount for the save directory and config, with syncfs on save and a load before main. Needs build flags (coder) and a reload test (tester). P1 stays UNVERIFIED.
- Mouse: the engine has no mouse event path; undecided.

## Findings / requests
1. coder: copy web/input_audio.js into shared dist/ on the next build (Makefile ships it). Shared dist currently has the older file (hash differs from this snapshot).
2. tester: add real-engine checks for refocus, pagehide, contextmenu and L+R Ctrl (my stub check is not a substitute); fix I3 per R2-1.
3. student: decide audio, persistence and mouse scope, then I implement them.
4. runner/coder: untracked sources are not in any patch (R2-7); record a tree hash.

Manual interventions: none. Usage: not available.
