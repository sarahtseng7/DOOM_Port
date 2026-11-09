FINDINGS

Startup observed and working on the current dist/. FINDINGS (not PASS) only because time-to-first-frame, other viewports, clean rebuild, other browsers, warm-cache reload and post-gesture audio were not verified, plus one minor expected audio warning (unchanged from prior reviewer_site report).

## Work
- Read AGENTS.md, loop/prompts/REVIEWER.md, artifacts/README.md, artifacts/reports/reviewer_site.md and tester.md. No specification.md or acceptance-criteria.md exists.
- Port 8000 had no listener. I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (pid in server.pid) and stopped it afterwards (port confirmed free).
- `make`: "Nothing to be done". web/{index.html,input_audio.js,audio_web.js,render_timing.js} identical to dist/. doom.wasm sha256 6c93cbf125bd366a... (same as the prior review). Source: HEAD e500c44 plus uncommitted changes (rev.txt).
- Playwright load of /?r=site5: document + 6 resources (input_audio.js, audio_web.js, render_timing.js, doom.js, doom.data ~4.2 MB, doom.wasm ~555 KB), all HTTP 200 and all in server.log. Title "DOOM Shareware" (the served HTML source has "Doom (WASM)" as its initial title, then the page sets it).
- Canvas 640x400, displayed 1152x720 CSS (1.6 aspect). 93 distinct colours in a sparse sample. Module._rt.frames 645 -> 715 in 1 s, so the render loop runs (headless Chromium).
- startup.png (viewed): in-game view with HUD and a "YOU GOT THE SHOTGUN!" message and an imp-like enemy. This is probably the attract-mode demo, not a player-controlled game. Colours are correct (no R/B swap), no corruption, letterboxed.
- Console: 0 errors, 2 warnings (console.txt).

## Evidence (this directory)
startup.png, console.txt, server.log, server.pid, rev.txt. Playwright captures are in artifacts/browser/.

## Findings
1. Minor, owner coder_input_audio: AudioContext "not allowed to start" warnings (audio_web.js:27, :53) before a user gesture. Expected under autoplay policy; confirm audio resumes on first gesture (not verified here).

No actionable startup fault found.

## Not verified
Precise time to first frame; clean rebuild; non-Chromium browsers; warm-cache reload; other viewports; audio after a gesture; whether the first frame is a demo or the title screen (I did not check the first frame, only a screenshot ~6 s after load); movement and combat (out of scope).

## Assumptions
- Headless Playwright Chromium via MCP; no spec, so criteria were: page loads, no failed required assets, canvas draws with plausible colours, loop advances.
- "Fresh" = new query string; the browser cache was not cleared, but server.log shows every asset requested.
- Wrote nothing outside OUTPUT_DIR apart from Playwright captures in artifacts/browser/.
