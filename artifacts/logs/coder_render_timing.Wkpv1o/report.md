FINDINGS

Re-verified rendering and timing on a fresh build. I found no defect and made no source edits. This is FINDINGS rather than PASS because I did not run `tests/verify.sh`, and a real hidden tab and physical HiDPI remain unverified.

## Source identity
HEAD e500c44 plus uncommitted changes. emcc 4.0.18. Built into this OUTPUT_DIR with `make BUILD=$O/build DIST=$O/dist` (make.log, exit 0). doom.wasm sha256 prefix a4c6846627bdcb21, identical to repo dist/ and earlier runs. web/render_timing.js is byte-identical to the built copy. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
All files in artifacts/reports/. Neither reviewer nor the tester reported a rendering or timing defect. Open items in my scope: hidden-tab timing (H1) and physical HiDPI.

## Evidence (this dir)
scale.mjs (reused from coder_render_timing.i3pFKE; headless Chromium; not a protected check) -> scale-dpr1.log, scale-dpr2.log, dpr1.png, dpr2.png:
- Both DPRs: about 34.98 tics/s, about 69.96 presents/s, 0 non-opaque pixels, 178 distinct colours, no page errors.
- DPR 1 CSS sizes: 1920x1080 -> 1728x1080; 1000x700 -> 1000x625. DPR 2: 1920x1080 -> 1600x1000; 1000x700 -> 960x600. Matches earlier rounds.
- dpr1.png inspected visually: colours are correct (brown barrels, skin tones, red HUD digits) and the frame is opaque and fills the window at 16:10.

## Unresolved (owner)
1. tester (manual protocol): real hidden-tab timing (H1). Headless cannot throttle a background tab.
2. UNVERIFIED: physical Retina/HiDPI, Safari and Firefox. DPR 2 was emulated.
3. tester: no automated canvas-scaling check. Run tests/verify.sh on this revision.
4. Optional: presents run about 2x the tic rate (duplicate frames). Possible CPU saving, not a defect.

## Assumptions
No spec exists. Criteria I used: opaque correct-colour frames, about 35 tics/s, canvas fits the window at 16:10 with whole-pixel scaling when it fills at least 90% of the window. No speculative edits to passing code. Manual interventions: none. Usage: not available.
