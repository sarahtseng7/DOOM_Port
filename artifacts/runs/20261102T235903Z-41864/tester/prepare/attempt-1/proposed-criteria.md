# Proposed acceptance criteria (AGENT-PROPOSED by tester; NOT student-approved)

Basis: README.md, coder's proposed-spec.md (R1-R6) and interface-contract.md. No student
artifacts/acceptance-criteria.md existed. Student may replace/freeze these; until then they are provisional.
Implemented in `tests/playtest.mjs` (IDs match). Browser: Playwright Chromium 1.49.1 (131), viewport 800x600.

| ID | Criterion (observable) | Spec |
|---|---|---|
| B0 | `make clean && make all` succeeds from clean tree; dist/index.html + doom.wasm exist | build |
| B1 | `canvas#canvas` is 640x400 | R2 |
| B2 | Non-black frame with >16 colors within 60s of load | R1 |
| B3 | Canvas pixels opaque (alpha 255) | R2 |
| B4/B6 | Mean R >= mean B on title/menu and E1M1 (catches BGR swap) | R2 |
| B5 | No console errors, page errors, failed requests, or 404s | R1 |
| T1 | >=20 rAF/s over 3s (main loop yields) | R3 |
| M1 | Enter on title changes the display (menu opens) | R4/R5 |
| G1 | Enter x4 reaches a level: big change from menu and populated status bar | R5 |
| G2 | Idle frames stable (<2% pixels differ) | R5 |
| I1/I3 | Hold Right/Left turns the view: scene shifts >=8px in the correct direction | R4 |
| I2,I5,C3 | Motion/fire ceases after key release (<2% change over 0.5s) | R4 |
| I4/I6 | Forward changes view and keeps changing while held; Backward returns closer to start | R4 |
| I7 | Window blur while key held stops motion (no stuck key) | R4 |
| C1/C2 | Ctrl fire animates the view; ammo-counter region changes persistently | R5 |
| U1-U4 | Tab toggles automap and back; Esc opens/closes menu | R4 |
| R1-R4 | 300s scripted random-input soak: no errors/aborts, rAF >=20/s, last frame visible, frames changed, no longtask >=1.5s | R6 |
| selftest | Pixel helpers reject black / channel-swapped / transparent / static / mis-shifted frames | meta |

## Explicitly UNVERIFIED (reported every run; completion must not be claimed while open)
A1 audio (scope undecided; active AudioContext proves nothing), P1 save persistence, G3 door use /
level exit, T2 35 tics/s rate (needs a coder-provided tic counter hook; proposal: export `cap_tic_count()`).
Also not covered: other browsers, mouse, touch, "faithful play" vs. original (e.g. demo/determinism checks).

## Known weaknesses of these checks
Pixel heuristics can false-fail on legit layout variation (e.g., canvas scaled with different aspect/letterbox,
HUD region assumptions) and can false-pass on identical-looking wrong gameplay. Backward-return check depends on
E1M1 geometry. Soak input is seeded pseudo-random; the player may die, so soak proves stability, not progress.

## Assumptions
Page serves from dist/ via any static server (test uses its own, no special headers); canvas has id `canvas`;
default menu path is Enter x4 with defaults; keyboard bindings are the Doom defaults in proposed-spec R4.
Change control: any later change to these criteria is recorded separately with a reason.
