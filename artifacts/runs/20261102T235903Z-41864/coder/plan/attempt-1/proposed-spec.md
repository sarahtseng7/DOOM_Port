# Proposed specification (AGENT-PROPOSED, not student-approved)

Source: commit e500c44 + uncommitted loop/ changes. No student-authored
artifacts/specification.md existed at planning time; this is a fallback.

## Scope
- Port supplied doomgeneric (C) to WebAssembly with Emscripten 4.0.18 (pinned
  per README/Dockerfile). Browser target: Chromium (current stable).
- Use only assets/doom1.wad (shareware Episode 1), packaged into the module
  (`--preload-file`) at `/doom1.wad`; launched with `-iwad /doom1.wad`.
- Output: dist/{index.html,doom.js,doom.wasm,doom.data}; served from a local
  static server (`python3 -m http.server --directory dist`).
- Build: root `Makefile` with `clean` and `all`; documented in BUILD.md.

## Functional requirements (proposed)
- R1 Boot: page loads with no console errors; title screen/menu appear.
- R2 Display: 640x400 canvas, correct colors (B,G,R,0 -> opaque RGBA), no
  tearing or channel swap.
- R3 Timing: engine runs at ~35 tics/s of real time; main loop yields to the
  browser every frame (requestAnimationFrame / emscripten main loop); screen
  melt wipe and tic-sync waits do not freeze the tab.
- R4 Input: keyboard only. Arrows move/turn, Ctrl fire, Space use, Shift run,
  Alt/comma/period strafe, Enter/Esc/menu navigation, digits weapon select,
  Tab automap, Y/N prompts. Key release is delivered; focus loss releases keys.
- R5 Gameplay: New Game -> E1M1 reachable via menu; player can move, shoot,
  open doors, take damage, and progress state changes visibly.
- R6 Robustness: no crash/abort in a >= 5 minute scripted session.

## Explicitly UNDECIDED (student decision needed; not claimed done)
- Audio (SFX via Web Audio, music synthesis): not in default scope.
- Save/config persistence across reload (IDBFS).
- Mouse input (engine mouse events are commented out in i_input.c).
- Browsers other than Chromium; mobile/touch; deployment hosting headers.
- "Faithful play" definition beyond R1-R6 (e.g., demo/determinism checks).
Faithful-play acceptance MUST NOT be reported complete while these remain open.

## Assumptions
- emcc is not installed on this host (`which emcc` -> not found); Docker or
  emsdk 4.0.18 is needed before any build. Planning did not require it.
- tests/verify.sh (tester-owned) runs `make clean; make all; node
  tests/playtest.mjs`, with a hard-coded absolute cd path; neither Makefile
  nor playtest.mjs exists yet. Reported as a finding, not edited.
- Single-threaded build (no SharedArrayBuffer), so no COOP/COEP headers.
- Engine startup: doomgeneric_Create() runs D_DoomMain, which ends by calling
  doomgeneric_Tick() once and returns; so main() calls Create once then
  drives doomgeneric_Tick per frame.
