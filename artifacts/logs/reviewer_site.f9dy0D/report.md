FINDINGS

Startup observed and working on the current dist/; FINDINGS only for one cosmetic item and limited scope (not a full acceptance run, no clean build).

## Work
- Read AGENTS.md, artifacts/README.md, BUILD.md, loop/prompts/REVIEWER.md, prior artifacts/reports/reviewer_site.md. No spec/acceptance-criteria files were read (none checked beyond the prior report's note).
- Port 8000 was free at start (lsof empty, curl 000). I started `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` (pid in server.pid) and stopped it at the end. No build run.
- Source identity: HEAD e500c44 plus uncommitted changes. dist/* mtimes (19:46:51-52) are newer than every platform/ and web/ source and the Makefile (latest 19:10:52, index.html 19:46:35). web/{index.html,audio_web.js,input_audio.js,render_timing.js} are byte-identical to dist/. Hashes in dist-sha.txt (doom.wasm a4c68466..., same as the prior review). I did not rebuild, so the C->wasm link is inferred from timestamps only.
- Playwright MCP fresh load of http://localhost:8000/?r=f9dy. Server log: GET /, 4 JS, doom.data, doom.wasm all 200. Resource timing: all responses done by ~32 ms.
- Console: 0 errors, 2 warnings (console.txt). Engine boot log present. Page title becomes "DOOM Shareware" at runtime.
- Canvas 640x400 (CSS 640x400), 115 distinct colours, 100% non-black pixels at ~5 s; Module._rt.frames = 796 (loop advancing).
- early.png: DOOM title screen, correct colours (no R/B swap). startup.png (~5 s): attract-mode demo frame with HUD, so the loop runs without input.

## Evidence (OUTPUT_DIR)
early.png, startup.png, console.txt, server.log, dist-sha.txt; raw Playwright logs/snapshots in artifacts/browser/.

## Findings
1. Fixed since prior review: favicon 404 is gone (`<link rel="icon" href="data:,">` present; no /favicon.ico request).
2. Minor, owner coder_input_audio: two AudioContext "not allowed to start" warnings (audio_web.js:27, :53) before a user gesture. Expected under autoplay policy; resume-after-gesture left to reviewer_gameplay.
3. Cosmetic, owner coder (web/): canvas stays 640x400 CSS px, not scaled to the viewport (1280x720 viewport shows it small with large black borders). Not fixed since prior review.

## Not verified
Startup time to first frame beyond "title visible on the first screenshot after load" (no precise timing); clean build; other browsers; stale-cache second load; reload behaviour; audio after gesture.

## Assumptions
Headless Playwright Chromium via MCP. No spec/acceptance criteria used; criteria were: page loads, no failed required assets, canvas draws correct colours, loop advances. Dist freshness judged by mtimes and byte-compare of web files.
