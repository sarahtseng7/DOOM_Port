# coder_input_audio 2-input attempt-1 (run 20261103T002748Z-51080)

Source: commit e500c44 + uncommitted changes (source-status.txt; web/input_audio.js sha256 8308f801…091d2, snapshot in this dir). Spec/criteria/contract are AGENT-PROPOSED only; no student-approved scope exists. No audio/storage scope was supplied, so audio and persistence remain unimplemented and visible as limitations.

## Work done (web/input_audio.js only)
- Reviewer F2 (refocus): after releaseAll() a still-held key sent `repeat=true` keydowns that were dropped, so the player had to release and re-press. Now a repeat for a key not in `held` is treated as a fresh press; repeats of held keys are still dropped.
- Reviewer F3 (shortcuts): F5/F11/F12 and Ctrl+letter/digit are still forwarded to Doom but no longer `preventDefault`ed, so reload, fullscreen, devtools and Ctrl shortcuts work. Meta combos were already left alone.
- Not done: F1/F4/F5/F6/F9 are coder-owned; mouse needs engine work; audio/persistence undecided.

## Evidence
- `node --check web/input_audio.js` ok.
- QUICK playtest on role-local dist (dist/20261103T002748Z-51080/coder_input_audio, hashes in dist-sha256.txt; shared dist untouched, only input_audio.js differs from it): failed=0, 3 UNVERIFIED (A1, P1, G3), exit 3 by design. See playtest.log, playtest/.

## Limits
- The playtest has no check for the refocus-repeat case or for shortcut pass-through, so neither fix is behaviourally verified; they are by code inspection only. Headless Chromium, 15 s soak, single run. Not a full verify, not reviewed.

## Findings / requests
1. tester: add checks for refocus-while-held (keydown repeat=true after blur must re-press) and for F5/Ctrl+letter not being default-prevented, plus visibilitychange/pagehide/contextmenu/Meta releases.
2. coder: copy the updated web/input_audio.js into dist/ on the next build (Makefile already ships it).
3. student: decide audio (SFX/music), persistence and mouse scope. Proposals in 1-input report.

Manual interventions: none. Usage: not available.
