# Building the Doom WebAssembly port

Toolchain: Emscripten **4.0.18** (`source ~/Developer/emsdk/emsdk_env.sh`), GNU make, Node (tests only).

    make        # builds build/*.o and dist/{index.html,doom.js,doom.wasm,doom.data}
    make clean  # removes build/ and dist/

- Engine sources: all `third_party/doomgeneric/*.c` except `dummy.c`, `doomgeneric_sdl.c`; platform code: `platform/*.c`.
- WAD packaging: `assets/doom1.wad` is embedded via `--preload-file` at `/doom1.wad` in `dist/doom.data`.
- `web/index.html` is copied to `dist/index.html`. Serve `dist/` over HTTP (not `file://`).
- Audio: built with `-DFEATURE_SOUND -Iplatform/audio_compat` (stub SDL_mixer.h); `web/audio_web.js` provides the Web Audio backend. Scripts load before doom.js: input_audio.js, audio_web.js, render_timing.js.
- JS/C bridge exports are listed in the Makefile `EXPORTED_FUNCTIONS`; see `platform/capstone_bridge.h`.
- Bridge v4 adds read-only player diagnostics (`_cap_player_valid/x/y/angle/health`, `_cap_level_id`) for position-based checks.
- Bridge v5 adds read-only sector exports (`_cap_sector_count/floor/ceiling(i)`, `_cap_player_sector`) so a tester can detect a door opening (ceiling rises) or a lift moving.
- Acceptance: `tests/verify.sh` (tester-owned); `QUICK=1` is partial and never exits 0.

## Serving

After `make`, serve `dist/` on port 8000 and open <http://localhost:8000/>:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```
