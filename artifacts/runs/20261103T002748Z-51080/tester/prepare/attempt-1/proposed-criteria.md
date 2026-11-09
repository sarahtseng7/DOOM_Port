# Proposed acceptance criteria (AGENT-PROPOSED by tester; NOT student-approved) - revision 2 carried forward, run 20261103T002748Z-51080

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
| I2,I5,C3 | Motion/fire ceases after key release: I5 polls until settled (two consecutive 300ms steps <2%) within 4s, since Doom momentum decays ~1.5-2s | R4 |
| I4/I6 | Forward changes view and keeps changing while held; Backward returns closer to start | R4 |
| I7a/I7 | Holds ArrowRight (turn; wall-proof): I7a precondition view keeps changing; after blur the view settles within 4s and stays stable | R4 |
| T2 | `Module._cap_tic_count()` advances 35 tics/s +/-10% over 4s; missing export => UNVERIFIED | R3 |
| C1/C2 | Ctrl fire animates the view; ammo-counter region changes persistently | R5 |
| U1-U4 | Tab toggles automap and back; Esc opens/closes menu | R4 |
| R1-R4 | 300s scripted random-input soak: no errors/aborts, rAF >=20/s, last frame visible, frames changed, no longtask >=1.5s | R6 |
| selftest | Pixel helpers reject black / channel-swapped / transparent / static / mis-shifted frames | meta |

## Explicitly UNVERIFIED (reported every run; completion must not be claimed while open)
A1 audio (scope undecided; active AudioContext proves nothing), P1 save persistence, G3 door use /
level exit.
Also not covered: other browsers, mouse, touch, "faithful play" vs. original (e.g. demo/determinism checks).

## Known weaknesses of these checks
Pixel heuristics can false-fail on legit layout variation (e.g., canvas scaled with different aspect/letterbox,
HUD region assumptions) and can false-pass on identical-looking wrong gameplay. Backward-return check depends on
E1M1 geometry. Soak input is seeded pseudo-random; the player may die, so soak proves stability, not progress.

## Assumptions
Page serves from dist/ via any static server (test uses its own, no special headers); canvas has id `canvas`;
default menu path is Enter x4 with defaults; keyboard bindings are the Doom defaults in proposed-spec R4.
Change control: any later change to these criteria is recorded separately with a reason.

## Change log
- rev 2 (run 20261103T001738Z-47122): I5/I6/I7 settle polling instead of fixed delays; I7 uses a turn key; T2 checked via `Module._cap_tic_count` (reason: prior I5/I7 failures were timing, not game bugs).
- rev 2 carried forward UNCHANGED in this run (20261103T002748Z-51080); copied here because this OUTPUT_DIR had no criteria file. No thresholds were altered. Still no student artifacts/acceptance-criteria.md.
