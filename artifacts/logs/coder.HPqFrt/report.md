FINDINGS

No coder-owned defect found; I made no source edits. FINDINGS (not PASS) because I did not re-run the full suite and the open items from earlier reports are still UNVERIFIED.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix 2c74d74fd2c699f9, the same as the latest coder and tester reports. dist/doom.wasm sha256 prefix 7afb94fa1ec64b5c. emcc 4.0.18. `make -n` prints "Nothing to be done", so dist/ is current.

## Work
- Read AGENTS.md, README.md, loop/prompts/CODER.md, BUILD.md and all six files in artifacts/reports/.
- Checked that the build is reproducible and current (the hashes above).
- Reviewer_site finding 3 (first screenshot showed mid-gameplay): read `main()` in platform/doomgeneric_wasm.c. It starts the engine normally with `-iwad /doom1.wad` and no `-warp` or `-nodemo`, so Doom's standard title and attract-demo loop runs. The shareware demo is the likely source of that frame. The tester's playtest captures a `title` shot before opening the menu, which also indicates normal startup. I did not capture the first frame myself, so this stays "likely", not verified.
- Reviewer_site finding 2 (wasm hash differs from the older reports): the hash changed because the build did. The current hash matches the latest tester and coder reports.

## Evidence
- Command output only: emcc version, `make -n`, the two hashes. Nothing is saved besides this report.
- Latest full-suite evidence: artifacts/logs/tester.bajOBH/ and artifacts/logs/coder.H58uUd/ (selftest, clean build, playtest failed=0, 5/5 fault injections caught).

## Unresolved (owner)
1. UNVERIFIED G3 door use / level exit (tester): the v5 sector exports exist, but tests/playtest.mjs does not use them yet.
2. UNVERIFIED A1 audio by ear (student/human).
3. UNVERIFIED H1 real hidden-tab timing (human).
4. UNVERIFIED P1 save persistence (student scope).
5. Reviewer_site finding 1 (AudioContext warnings before a gesture) is expected under autoplay policy. Owner: coder_input_audio, who has not yet shown audio resumes after a gesture.

## Assumptions
- The attract-demo startup is intended default Doom behaviour. Criteria are agent-proposed, not student-approved. Manual interventions: none. Usage: not available.

## Next action
Tester writes the sector-based G3 scenario using the v5 exports. A human listens for A1 and runs the H1 protocol in tests/README.md.
