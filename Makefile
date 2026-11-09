# Doom -> WebAssembly build. Requires Emscripten 4.0.18 (source emsdk_env.sh
# or use the Dockerfile image). Output: dist/{index.html,doom.js,doom.wasm,doom.data}
EMCC      ?= emcc
ENGINE    := third_party/doomgeneric
BUILD     := build
DIST      := dist
WAD       := assets/doom1.wad

# Platform-specific/unused engine files: dummy.c, i_cdmus.c, i_joystick.c are
# stubs here; net_* sources are absent from this tree.
ENGINE_EXCLUDE := $(ENGINE)/dummy.c $(ENGINE)/doomgeneric_sdl.c
ENGINE_SRC := $(filter-out $(ENGINE_EXCLUDE),$(wildcard $(ENGINE)/*.c))
PLAT_SRC   := $(wildcard platform/*.c)
OBJS       := $(patsubst %.c,$(BUILD)/%.o,$(ENGINE_SRC) $(PLAT_SRC))

CFLAGS  := -O2 -I$(ENGINE) -Iplatform -Iplatform/audio_compat -DFEATURE_SOUND -MMD -MP
ENGINE_CFLAGS := -w   # silence warnings for the supplied engine only
LDFLAGS := -O2 -sASYNCIFY -sASYNCIFY_STACK_SIZE=65536 -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=64MB \
           -sEXPORTED_FUNCTIONS=_main,_cap_ready,_cap_tic_count,_cap_input_event,_cap_input_reset,_cap_bridge_version,_cap_framebuffer_ptr,_cap_input_impl,_cap_input_delivered_count,_cap_input_dropped_count,_cap_player_valid,_cap_player_x,_cap_player_y,_cap_player_angle,_cap_player_health,_cap_level_id,_cap_sector_count,_cap_sector_floor,_cap_sector_ceiling,_cap_player_sector \
           -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,HEAPU8 \
           --preload-file $(WAD)@/doom1.wad

.PHONY: all clean
all: $(DIST)/index.html

$(BUILD)/$(ENGINE)/%.o: $(ENGINE)/%.c
	@mkdir -p $(dir $@)
	$(EMCC) $(CFLAGS) $(ENGINE_CFLAGS) -c $< -o $@

$(BUILD)/platform/%.o: platform/%.c
	@mkdir -p $(dir $@)
	$(EMCC) $(CFLAGS) -c $< -o $@

-include $(OBJS:.o=.d)

$(DIST)/doom.js: $(OBJS) $(WAD)
	@mkdir -p $(DIST)
	$(EMCC) $(OBJS) $(LDFLAGS) -o $@

WEB_FILES := web/index.html web/input_audio.js web/audio_web.js web/render_timing.js

$(DIST)/index.html: $(DIST)/doom.js $(WEB_FILES)
	cp $(WEB_FILES) $(DIST)/

clean:
	rm -rf $(BUILD) $(DIST)
