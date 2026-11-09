FINDINGS

Startup observed and working on the current dist/. FINDINGS (not PASS) only because time-to-first-frame, other viewports, clean rebuild, other browsers and post-gesture audio were not verified, plus one minor audio warning (unchanged from the prior run).

## Work
- Read AGENTS.md, loop/prompts/REVIEWER.md, README.md and artifacts/reports/ (reviewer_site, tester). artifacts/specification.md and acceptance-criteria.md do not exist.
- Port 8000 had no listener (lsof empty), so I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (pid 6970) and stopped it at the end (curl now gets no response).
- `make`: "Nothing to be done" (make.log). web/*.{html,js} are byte-identical to dist/ (cmp.txt). Source: HEAD e500c44 plus uncommitted changes (rev.txt).
- Playwright load of /?r=fresh2: document plus 6 resources (input_audio.js, audio_web.js, render_timing.js, doom.js, doom.data ~4.2 MB, doom.wasm ~555 KB), all 200 (server.log). Title "DOOM Shareware".
- Canvas 640x400, displayed 1152x720 CSS (aspect 1.6 kept). 91 distinct colours in a sparse pixel sample. Module._rt.frames went 497 -> 567 in 1 s, so the main loop runs.
- startup.png (viewed): attract-demo gameplay with HUD and "YOU GOT THE SHOTGUN!". Colours look correct (no R/B swap), no corruption, letterboxed.
- Console: 0 errors, 2 warnings (console.txt).

## Evidence (this directory)
startup.png, console.txt, make.log, cmp.txt, rev.txt, server.log, server.pid. Playwright captures are in artifacts/browser/.

## Findings
1. Minor, owner coder_input_audio: AudioContext "not allowed to start" warnings (audio_web.js:27, :53) before a user gesture. Expected under autoplay policy. Whether audio resumes after a gesture belongs to reviewer_gameplay.

No actionable startup fault found. Earlier reports' findings are unchanged.

## Not verified
Precise time to first frame; clean rebuild (make clean && make; the tester's verify.sh did this); non-Chromium browsers; warm-cache reload; other viewport sizes; audio after a gesture; movement and combat (out of scope).

## Assumptions
- Headless Playwright Chromium via MCP.
- No spec was supplied, so the criteria were: page loads, no failed required assets, canvas draws with plausible colours, loop advances.
- "Fresh" means a new query string. The Playwright profile cache was not cleared, so doom.* may have been cache-assisted. The server log shows all assets requested, so they were not served from cache.
- Wrote nothing outside OUTPUT_DIR apart from Playwright captures in artifacts/browser/.
