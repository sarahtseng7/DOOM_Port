FINDINGS

Startup observed and working on the current dist/. FINDINGS (not PASS) only because time-to-first-frame precision, other viewports, clean rebuild, and post-gesture audio were not verified, plus one minor audio warning.

## Work
- Read AGENTS.md, loop/prompts/REVIEWER.md, artifacts/reports/reviewer_site.md (prior run). artifacts/specification.md and acceptance-criteria.md were not consulted/not present in prior run.
- Port 8000 was free (lsof empty). `make`: "Nothing to be done" (make.log). web/*.{html,js} byte-identical to dist/ (cmp). Source: HEAD e500c44 plus uncommitted changes.
- Started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (pid 1651); stopped it at the end (curl afterwards returns no response).
- Playwright fresh load of /?r=fresh1: 6 resources (input_audio.js, audio_web.js, render_timing.js, doom.js, doom.data, doom.wasm) + document, all 200 (server.log). Title "DOOM Shareware". loadEventEnd ~32 ms (page load, not time to first frame).
- Canvas 640x400, displayed 1152x720 CSS (aspect 1.6 kept). Sampled ~158 distinct colours. Module._rt.frames advanced 317 -> 365 in 1 s, so the main loop runs.
- startup.png: attract-demo gameplay with HUD, correct colours (no R/B swap), no corruption.
- Console: 0 errors, 2 warnings (console.txt).

## Evidence (this directory)
startup.png, console.txt, make.log, server.log, rev.txt, server.pid.

## Findings
1. Minor, owner coder_input_audio: AudioContext "not allowed to start" warnings (audio_web.js:27, :53) before a user gesture. Expected under autoplay policy; resume after gesture left to reviewer_gameplay.

No actionable startup fault found. Prior report's findings are unchanged.

## Not verified
Precise time to first frame; clean rebuild (make clean && make); non-Chromium browsers; warm-cache reload; other viewport sizes; audio after a gesture; movement/combat (out of scope).

## Assumptions
Headless Playwright Chromium via MCP. No spec was supplied, so criteria: page loads, no failed required assets, canvas draws with correct colours, loop advances. "Fresh" = new query string on a fresh browser load; the browser cache state of the Playwright profile was not cleared. Wrote nothing outside OUTPUT_DIR, apart from Playwright captures in artifacts/browser/.
