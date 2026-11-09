# reviewer 2-review attempt-1 (run 20261103T002748Z-51080)

Status: FINDINGS (not PASS). Technical review of the integrated candidate. I re-ran the browser playtest on the current dist and reproduced a failing check.

## Basis and assumptions
- Source: commit e500c44 + uncommitted changes (manifest). Untracked platform/*, web/input_audio.js, Makefile and tests/* are not in any preserved patch (finding R2-7).
- No artifacts/specification.md, acceptance-criteria.md or interface-contract.md exists. I used the AGENT-PROPOSED coder/plan and tester/prepare proposals. None is student-approved; I did not approve them.
- Candidate under review is the shared `dist/` built 17:19. Its sha256 values equal `coder/2-integrate/attempt-1/dist-sha256.txt` (my copy: `dist-sha256-at-review.txt`). The earlier `coder/1-build/attempt-1` report and hashes describe an older tree (before render_timing.c and input_audio.js) and are superseded. Do not cite them for the current candidate.
- I did not rebuild (emcc is not on this shell's PATH; `verification-1.log` shows the runner hit the same). I reviewed the source and ran the existing playtest against the existing dist.
- Prior reviewer findings F1, F3, F4, F6, F7, F8 are addressed in source (cap_frame removed, stack 64K, scoped -w, -MMD, shortcut passthrough, pixelated CSS). I re-read the code and found no regression in them. F2, F5, F9 are still open (R2-3, R2-4, R2-7).

## Verified correct by reading source (no action)
- Pixel path: `render_timing.c` turns word 0x00RRGGBB into 0xFFBBGGRR, so bytes are R,G,B,A and alpha is 255. The 1 MB view is rebuilt per frame, so ALLOW_MEMORY_GROWTH cannot leave a detached buffer. Frame `B3/B4/B6` checks agree, and the screenshots I viewed have correct colours.
- WAD: `--preload-file assets/doom1.wad@/doom1.wad`, `main` passes `-iwad /doom1.wad`. The game boots to E1M1 in every run.
- Timing: `cap_time_ms` is nonzero on the first call (i_timer.c `basetime==0` rule). `cap_sleep_ms` uses `emscripten_sleep`, so the wipe and tic waits yield. T2 measured 35 tics/s.
- Input queue: `input_audio.c` keeps strict press/release alternation. The 256-press limit plus at most 255 outstanding releases fits the 512 slots, so a release is never dropped. `I_GetEvent` breaks after each release; extra queued events wait for the next tick, which is harmless.
- Key table in `web/input_audio.js` matches `doomkeys.h`. Weak fallbacks in `cap_fallback.c` are overridden by the strong definitions (confirmed by earlier role reports; `rt_js_put` is present in doom.js).

## Findings (most severe first)

### R2-1 (high, owner: tester) I3.turn-left is flaky because of the check, and the "PASS" gate is unreliable
- Evidence: three QUICK playtests on the identical current dist. Run 1 and 2: `FAIL I3.turn-left shift=-116px`, exit 1. Run 3: `PASS I3 shift=204px`. Logs: `quick-1.log`, `quick-2.log`, `quick-3.log`. Coder 2-integrate saw 1 failure in 5 runs; I saw 2 in 3. I1 was `-200px` every time.
- Root cause (read from `tests/lib/frames.mjs:54` and `tests/playtest.mjs:104-112`, and from screenshots): the check holds a key for a fixed 350 ms. The scene shift then depends on how many tics ran in that window, and it is about 200-240 px. `bestShift` only searches ±`width/3` = ±213 px. When the real shift exceeds 213 px the search lands on an alias (-116 px). In `quick-1/screens/008-turn-right.png` the blood pool is at x≈70. In `010-turn-left.png` it is at x≈310, which is +240 px and in the correct direction. The engine turned the right way; the check measured it wrongly. This is a hypothesis supported by the frames; I did not instrument `bestShift` to confirm the alias.
- Consequence: a full `verify.sh` exit 0 does not establish the input checks. It passed on a coin flip. The same flaw can mask or fake a regression in the required regression-injection evaluation.
- Expected validation: shorten the hold (about 150 ms) or widen the search, then run at least 10 consecutive playtests with 0 failures. Tests are tester-owned and this review did not change them.

### R2-2 (medium, owner: student decision, then coder_input_audio/coder) The port has no audio
`FEATURE_SOUND` is not defined and `cap_audio_init` is empty. README.md and platform/README.md describe audio (sound effects and music) as part of the port, and the WAD already contains them. The tester lists A1 as UNVERIFIED. This means the build is a silent Doom. If the student wants audio in scope, it needs a `DG_sound_module` and an `SDL_mixer.h` workaround, plus an oracle that proves sound was produced (an active AudioContext does not). If it is out of scope, record that decision in artifacts/. Do not describe the port as faithful until then.

### R2-3 (medium, owner: tester) Key-handling fixes remain unproven
F2 (re-press of a key still held after refocus) and F3 (F5/F11/F12 and Ctrl+letter not default-prevented) are in `web/input_audio.js` but no check exercises them. Still untested: `visibilitychange`, `pagehide`, `contextmenu`, Meta, L+R Ctrl, auto-repeat. Expected validation: Playwright cases that dispatch `keydown{repeat:true}` after blur and assert `defaultPrevented===false` for F5 and Ctrl+R.

### R2-4 (medium, owner: tester, with coder) Silent fallback hides a regression
`cap_fallback.c` still ships a complete second renderer and queue. If `render_timing.c` or `input_audio.c` stops linking, the build passes and no check notices. Expected validation: a test asserting `Module._rt` exists (render module) and an exported diagnostic from `input_audio.c` such as `cap_input_delivered`. This matters for the injected-regression evaluation, because dropping a module is an obvious fault to inject.

### R2-5 (medium, owner: coder_input_audio / student) Save and config persistence is absent
Files go to the in-memory FS and are lost on reload. P1 is UNVERIFIED and unscoped. I did not exercise saving in this review, so I make no claim about whether in-session save and load work.

### R2-6 (low-medium, owner: tester) Hidden-tab behaviour is unchecked
The main loop is ASYNCIFY with `setTimeout`-based sleeps. Browsers throttle timers in background tabs, so the game will run slowly or stall while hidden and catch up on return. The input code releases keys on hide, but nothing tests timing after a hide/show cycle. Report it as unverified, not as a defect.

### R2-7 (low, owner: coder / runner) Candidate source is not reproducible from artifacts
`coder/2-integrate/.../source-dirty.patch` covers tracked files only. platform/*.c, web/input_audio.js, Makefile and tests/* are untracked, so another agent cannot recreate the exact tested tree. This was prior finding F9 and is only partly fixed. Expected: a snapshot or tree hash that includes untracked files, or a commit.

### R2-8 (low, owner: coder_render_timing) Per-frame allocation
`rt_js_put` allocates a new `Uint8ClampedArray` and `ImageData` every frame, and `cap_render_present` also copies 256k pixels in C. T2 and rAF checks show it keeps up (35 tics/s, 60 rAF/s headless), so this is only a GC and efficiency note. Not measured on slower hardware.

### R2-9 (process, owner: student/runner) Runner verification failed to run
`verification-1.log` reads `VERIFY FAIL: emcc missing (source emsdk 4.0.18 env)` and the run continued. `loop/` is read-only for me, so I only report it: the runner's own verify step does not source emsdk, so its independent check produced no evidence for this run.

## Coverage limits
This review does not certify gameplay or the final submission. Not established: audio, persistence, door use and level exit (G3), mouse, browsers other than headless Chromium, HiDPI, flakiness beyond the runs listed, and fidelity to original Doom (no demo or determinism oracle). The student has not approved any criteria.

## Commands and results
- `shasum -a 256 dist/*` compared with `coder/2-integrate` hashes: identical.
- `QUICK=1 OUT_DIR=<abs> node tests/playtest.mjs` ×3 on that dist: exit 1, 1, 3. Failures only in I3, as above. Evidence: `quick-N.log`, `quick-N/` (screens, results json).
- Read: platform/*, web/*, Makefile, tests/lib/frames.mjs, tests/playtest.mjs (lines 100-113), i_input.c, i_timer.c, doomfeatures.h, all role reports under this run.

## Next action
Tester: fix I3 (R2-1) and repeat 10 runs; add R2-3 and R2-4 checks. Student: decide audio/persistence scope (R2-2, R2-5) and approve criteria. Coder: preserve a full source snapshot (R2-7). Reviewer re-check after those land. Manual interventions: none. Usage: not available.
