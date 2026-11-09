FINDINGS

Startup observed and working on the current dist/. FINDINGS (not PASS) only because time-to-first-frame, other viewports, clean rebuild, other browsers and post-gesture audio were not verified, plus one minor expected audio warning (unchanged from prior run).

## Work
- Read AGENTS.md, loop/prompts/REVIEWER.md and artifacts/reports/ (reviewer_site, reviewer_gameplay, tester). No specification.md or acceptance-criteria.md exists.
- Port 8000 had no listener, so I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (pid 13203) and stopped it at the end (port confirmed free).
- `make`: "Nothing to be done". web/*.{html,js} cmp-identical to dist/. doom.wasm sha256 prefix a4c6846627bdcb21 (same as the gameplay report). Source: HEAD e500c44 plus uncommitted changes (rev.txt).
- Playwright load of /?r=site3: document + 6 resources (input_audio.js, audio_web.js, render_timing.js, doom.js, doom.data ~4.2 MB, doom.wasm ~555 KB), all 200 (server.log). Title "DOOM Shareware".
- Canvas 640x400, shown at 1152x720 CSS (aspect 1.6 kept). 194 distinct colours in a sparse pixel sample. Module._rt.frames 285 -> 349 in 1 s, so the main loop runs.
- startup.png (viewed): attract-demo gameplay view with HUD (ammo 50, health 100%). Colours look correct (no R/B swap), no corruption, letterboxed.
- Console: 0 errors, 2 warnings (console.txt).

## Evidence (this directory)
startup.png, console.txt, server.log, server.pid, rev.txt. Playwright captures are in artifacts/browser/.

## Findings
1. Minor, owner coder_input_audio: AudioContext "not allowed to start" warnings (audio_web.js:27, :53) before a user gesture. Expected under autoplay policy; the gameplay report saw it resume after a gesture.

No actionable startup fault found.

## Not verified
Precise time to first frame; clean rebuild (tester's verify.sh did this); non-Chromium browsers; warm-cache reload; other viewports; audio after a gesture; movement and combat (out of scope).

## Assumptions
- Headless Playwright Chromium via MCP; no spec, so criteria were: page loads, no failed required assets, canvas draws with plausible colours, loop advances.
- "Fresh" = new query string; the browser profile cache was not cleared, but the server log shows every asset was requested.
- Wrote nothing outside OUTPUT_DIR apart from Playwright captures in artifacts/browser/.
