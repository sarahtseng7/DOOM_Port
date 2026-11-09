# Proposed specification (AGENT-PROPOSED, not student-approved)

Source: commit e500c44 + uncommitted working tree (see initial-source-status.txt).
No student-authored artifacts/specification.md exists; this is a fallback. It
carries forward run 20261102T235903Z-41864's proposed spec, updated for the
state of the tree (a build already exists from that run's 1-build attempt).

## Scope
- Port supplied doomgeneric (C) to WebAssembly with Emscripten 4.0.18.
  Browser target: current stable Chromium (Playwright).
- Only assets/doom1.wad, packaged with `--preload-file` at `/doom1.wad`,
  launched with `-iwad /doom1.wad`.
- Output dist/{index.html,doom.js,doom.wasm,doom.data}; served by
  `python3 -m http.server --bind 127.0.0.1 --directory dist`.
- Build: root `Makefile` (`make clean all`), documented in BUILD.md (not yet written).

## Functional requirements (proposed)
- R1 Boot: no console errors; title/menu appear.
- R2 Display: 640x400 `#canvas`; B,G,R,0 memory order converted to opaque RGBA.
- R3 Timing: ~35 tics/s real time; loop yields to the browser; wipe/tic waits do not freeze the tab.
- R4 Input: keyboard (arrows, Ctrl fire, Space use, Shift run, Alt strafe, Enter/Esc,
  digits, Tab automap, Y/N). Releases delivered; blur/visibility releases all keys.
- R5 Gameplay: New Game -> E1M1; move, shoot, use doors, state visibly changes.
- R6 Robustness: no crash/abort in a >= 5 minute scripted session.

## UNDECIDED (student decision needed; not claimed done)
- Audio (SFX/music), save/config persistence (IDBFS), mouse input,
  non-Chromium browsers, mobile/touch, hosting headers, and the definition of
  "faithful play" beyond R1-R6 (e.g. demo/determinism checks).
Faithful-play acceptance MUST NOT be reported complete while these are open.

## Assumptions
- emcc is not on the default PATH; a previous run found it by sourcing
  ~/Developer/emsdk/emsdk_env.sh. Version pin 4.0.18 must be confirmed with
  `emcc --version` at build time (not checked in this plan task).
- Single-threaded, ASYNCIFY build (no SharedArrayBuffer; no COOP/COEP needed).
- Fallback criteria live at tester/prepare/attempt-1/proposed-criteria.md in
  run 20261102T235903Z-41864 (tester-owned; this run has none). I did not
  create or edit criteria.
- Role isolation is instruction-only (manifest.txt); nothing here is enforced.
