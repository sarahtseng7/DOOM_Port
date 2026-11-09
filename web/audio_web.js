// Web Audio backend for the Doom port (coder_input_audio-owned).
// Called from platform/audio_web.c through window.CapAudio.
//   SFX  : DMX lumps (8-bit unsigned PCM) -> AudioBuffer -> gain/pan -> bus.
//   Music: MIDI (converted from MUS in C) -> sequencer -> oscillator synth.
// The synth is a generic subtractive approximation, NOT an OPL/GENMIDI
// emulation: timbres follow General MIDI program families only.
// Self-installing; load with <script src="audio_web.js"></script> (any order).
// Diagnostics for tests: CapAudio.stats() (counters, context state, measured
// output level on the master bus) -- an initialised context alone proves nothing.
(function () {
  'use strict';

  var ctx = null, master = null, sfxBus = null, musicBus = null, analyser = null;
  var anaBuf = null;
  var sfxVol = 1, musicVol = 1;
  var st = {
    sfxRequested: 0, sfxPlayed: 0, sfxSuppressed: 0, sfxBad: 0,
    musicRequested: 0, musicStarted: 0, notesScheduled: 0, musicErrors: 0,
    maxPeak: 0, lastPeak: 0
  };

  function heap() { return window.Module && window.Module.HEAPU8; }

  function ensureCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { ctx = null; return null; }
    master = ctx.createGain();
    master.gain.value = 0.8;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    anaBuf = new Float32Array(analyser.fftSize);
    var comp = ctx.createDynamicsCompressor(); // keep many simultaneous voices from clipping
    master.connect(comp); comp.connect(analyser); comp.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = musicVol * 0.5; musicBus.connect(master);
    setInterval(meter, 50);
    return ctx;
  }

  function meter() {
    if (!ctx || ctx.state !== 'running') return;
    analyser.getFloatTimeDomainData(anaBuf);
    var p = 0;
    for (var i = 0; i < anaBuf.length; i++) { var a = Math.abs(anaBuf[i]); if (a > p) p = a; }
    st.lastPeak = p;
    if (p > st.maxPeak) st.maxPeak = p;
  }

  // Browsers keep the context suspended until a user gesture.
  function resume() {
    if (!ensureCtx()) return;
    if (ctx.state === 'suspended') ctx.resume().catch(function () {});
  }
  ['keydown', 'pointerdown', 'mousedown', 'touchstart'].forEach(function (n) {
    window.addEventListener(n, resume, true);
  });

  // ---- sound effects ---------------------------------------------------
  var bufCache = {};        // lump -> AudioBuffer | null (bad lump)
  var chans = {};           // channel -> {src, gain, pan, end}

  function decode(lump, p, len) {
    if (lump in bufCache) return bufCache[lump];
    var H = heap(), buf = null;
    if (H && len > 8 + 32) {
      var fmt = H[p] | (H[p + 1] << 8);
      var rate = H[p + 2] | (H[p + 3] << 8);
      var n = (H[p + 4] | (H[p + 5] << 8) | (H[p + 6] << 16) | (H[p + 7] << 24)) >>> 0;
      n = Math.min(n, len - 8);
      // DMX: n counts 16 padding bytes at each end of the sample data.
      if (fmt === 3 && rate >= 3000 && rate <= 96000 && n > 32) {
        var cnt = n - 32;
        buf = ctx.createBuffer(1, cnt, rate);
        var ch = buf.getChannelData(0);
        for (var i = 0; i < cnt; i++) ch[i] = (H[p + 8 + 16 + i] - 128) / 128;
      }
    }
    if (!buf) st.sfxBad++;
    bufCache[lump] = buf;
    return buf;
  }

  function panOf(sep) { return Math.max(-1, Math.min(1, (sep - 128) / 128)); }
  function gainOf(vol) { return Math.max(0, Math.min(1, vol / 127)); }

  function sfxStop(ch) {
    var c = chans[ch];
    if (!c) return;
    delete chans[ch];
    try { c.src.onended = null; c.src.stop(); c.src.disconnect(); c.gain.disconnect(); } catch (e) {}
  }

  function sfxStart(ch, lump, p, len, vol, sep) {
    st.sfxRequested++;
    if (!ensureCtx()) { st.sfxSuppressed++; return 1; }
    sfxStop(ch);
    if (ctx.state !== 'running') { st.sfxSuppressed++; resume(); return 1; } // not audible yet
    var buf = decode(lump, p, len);
    if (!buf) return 0;
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var g = ctx.createGain(); g.gain.value = gainOf(vol);
    var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) { pan.pan.value = panOf(sep); src.connect(g); g.connect(pan); pan.connect(sfxBus); }
    else { src.connect(g); g.connect(sfxBus); }
    var c = { src: src, gain: g, pan: pan, end: performance.now() + buf.duration * 1000 };
    chans[ch] = c;
    src.onended = function () { if (chans[ch] === c) delete chans[ch]; };
    src.start();
    st.sfxPlayed++;
    return 1;
  }

  function sfxParams(ch, vol, sep) {
    var c = chans[ch];
    if (!c) return;
    c.gain.gain.value = gainOf(vol);
    if (c.pan) c.pan.pan.value = panOf(sep);
  }

  function sfxPlaying(ch) {
    var c = chans[ch];
    return !!c && performance.now() < c.end;
  }

  // ---- MIDI parsing ----------------------------------------------------
  function parseMidi(b) {
    var pos = 0;
    function u16() { var v = (b[pos] << 8) | b[pos + 1]; pos += 2; return v; }
    function u32() { var v = ((b[pos] << 24) | (b[pos + 1] << 16) | (b[pos + 2] << 8) | b[pos + 3]) >>> 0; pos += 4; return v; }
    if (b.length < 14 || b[0] !== 0x4d || b[1] !== 0x54 || b[2] !== 0x68 || b[3] !== 0x64) throw new Error('not MIDI');
    pos = 4; u32();
    u16(); var ntr = u16(); var div = u16();
    if (div & 0x8000) throw new Error('SMPTE division unsupported');
    var evs = [], tempos = [];
    for (var t = 0; t < ntr; t++) {
      if (pos + 8 > b.length) break;
      pos += 4; var tl = u32(), end = Math.min(pos + tl, b.length), tick = 0, run = 0;
      while (pos < end) {
        var d = 0, c;
        do { c = b[pos++]; d = (d << 7) | (c & 0x7f); } while ((c & 0x80) && pos < end);
        tick += d;
        var s = b[pos];
        if (s === 0xff) {
          var type = b[pos + 1]; pos += 2;
          var l = 0; do { c = b[pos++]; l = (l << 7) | (c & 0x7f); } while (c & 0x80);
          if (type === 0x51 && l === 3) tempos.push({ tick: tick, us: (b[pos] << 16) | (b[pos + 1] << 8) | b[pos + 2] });
          pos += l;
        } else if (s === 0xf0 || s === 0xf7) {
          pos++; var sl = 0; do { c = b[pos++]; sl = (sl << 7) | (c & 0x7f); } while (c & 0x80); pos += sl;
        } else {
          if (s & 0x80) { run = s; pos++; }
          var kind = run & 0xf0, ch = run & 0x0f, a = b[pos++], v = 0;
          if (kind !== 0xc0 && kind !== 0xd0) v = b[pos++];
          if (kind === 0x90 && v === 0) kind = 0x80;
          evs.push({ tick: tick, k: kind, ch: ch, a: a, v: v });
        }
      }
    }
    evs.sort(function (x, y) { return x.tick - y.tick; }); // stable in modern engines
    tempos.sort(function (x, y) { return x.tick - y.tick; });
    // ticks -> seconds through the tempo map
    var ti = 0, curTick = 0, curSec = 0, us = 500000;
    for (var i = 0; i < evs.length; i++) {
      var e = evs[i];
      while (ti < tempos.length && tempos[ti].tick <= e.tick) {
        curSec += (tempos[ti].tick - curTick) * us / 1e6 / div;
        curTick = tempos[ti].tick; us = tempos[ti].us; ti++;
      }
      e.t = curSec + (e.tick - curTick) * us / 1e6 / div;
    }
    return { events: evs, length: evs.length ? evs[evs.length - 1].t + 0.05 : 0 };
  }

  // ---- synth -----------------------------------------------------------
  // [wave, attack, decay, sustain level (0 = percussive), release, lowpass x freq, gain]
  var FAMILY = [
    ['triangle', 0.005, 0.9, 0.0, 0.15, 6, 0.8],   // 0 piano
    ['sine', 0.002, 0.5, 0.0, 0.2, 8, 0.8],        // 1 chromatic perc
    ['square', 0.01, 0.1, 0.7, 0.06, 3, 0.3],      // 2 organ
    ['sawtooth', 0.003, 0.5, 0.15, 0.1, 4, 0.35],  // 3 guitar
    ['sawtooth', 0.005, 0.4, 0.4, 0.08, 3, 0.45],  // 4 bass
    ['sawtooth', 0.08, 0.2, 0.8, 0.2, 4, 0.3],     // 5 strings
    ['sawtooth', 0.06, 0.2, 0.8, 0.2, 4, 0.3],     // 6 ensemble
    ['sawtooth', 0.03, 0.2, 0.8, 0.1, 5, 0.3],     // 7 brass
    ['square', 0.03, 0.2, 0.7, 0.1, 4, 0.25],      // 8 reed
    ['sine', 0.04, 0.1, 0.9, 0.1, 8, 0.6],         // 9 pipe
    ['square', 0.01, 0.1, 0.8, 0.08, 5, 0.25],     // 10 synth lead
    ['triangle', 0.1, 0.2, 0.8, 0.3, 6, 0.6],      // 11 pad
    ['sawtooth', 0.02, 0.3, 0.5, 0.2, 3, 0.3],     // 12 synth fx
    ['triangle', 0.005, 0.5, 0.1, 0.1, 6, 0.6],    // 13 ethnic
    ['square', 0.002, 0.2, 0.0, 0.1, 6, 0.3],      // 14 percussive
    ['sawtooth', 0.01, 0.4, 0.2, 0.2, 3, 0.3]      // 15 sound fx
  ];
  var MAX_VOICES = 48;

  var noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  var M = null; // current song state
  function newChannels() {
    var c = [];
    for (var i = 0; i < 16; i++) c.push({ prog: 0, vol: 100, expr: 127, pan: 64, bend: 0, node: null, panner: null });
    return c;
  }

  function chanNode(i) {
    var c = M.ch[i];
    if (!c.node) {
      c.node = ctx.createGain();
      c.panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      c.node.gain.value = Math.pow(c.vol / 127, 2) * Math.pow(c.expr / 127, 2);
      if (c.panner) { c.panner.pan.value = (c.pan - 64) / 64; c.node.connect(c.panner); c.panner.connect(M.bus); }
      else c.node.connect(M.bus);
    }
    return c.node;
  }

  function reapExpiry(now) {
    M.voices = M.voices.filter(function (v) { return v.endAt > now; });
  }

  function noteOn(ci, note, vel, when) {
    var c = M.ch[ci], out = chanNode(ci);
    var amp = Math.pow(vel / 127, 1.5);
    var now = ctx.currentTime;
    if (when < now) when = now;
    reapExpiry(now);
    if (M.voices.length >= MAX_VOICES) { var old = M.voices.shift(); killVoice(old, when); }
    var v = { ch: ci, note: note, nodes: [], oscs: [], endAt: when + 30, rel: 0.1, gain: null };
    var env = ctx.createGain();
    env.gain.value = 0;
    env.connect(out);
    v.gain = env;
    if (ci === 9) { drum(v, note, amp, when, env); }
    else {
      var f = FAMILY[(c.prog >> 3) & 15];
      var freq = 440 * Math.pow(2, (note - 69) / 12);
      var o = ctx.createOscillator();
      o.type = f[0];
      o.frequency.value = freq;
      o.detune.value = c.bend * 200;
      var lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = Math.min(12000, freq * f[5] + 400);
      o.connect(lp); lp.connect(env);
      var peak = amp * f[6], sus = f[3] * peak;
      env.gain.setValueAtTime(0, when);
      env.gain.linearRampToValueAtTime(peak, when + f[1]);
      env.gain.setTargetAtTime(sus, when + f[1], f[2] / 3);
      v.rel = f[4]; v.sustained = f[3] > 0;
      o.start(when);
      v.oscs.push(o);
      v.pitch = o;
      if (!v.sustained) { v.endAt = when + f[1] + f[2] * 2.5 + 0.05; o.stop(v.endAt); }
    }
    st.notesScheduled++;
    M.voices.push(v);
    M.lastOn[ci * 128 + note] = v;
  }

  function drum(v, note, amp, when, env) {
    var dur = 0.12, src;
    if (note === 35 || note === 36 || (note >= 41 && note <= 50 && note !== 42 && note !== 44 && note !== 46 && note !== 49)) {
      var base = note < 38 ? 110 : 80 + (note - 41) * 14;
      src = ctx.createOscillator(); src.type = 'sine';
      src.frequency.setValueAtTime(base * 2.2, when);
      src.frequency.exponentialRampToValueAtTime(base, when + 0.08);
      dur = note < 38 ? 0.25 : 0.3;
      amp *= 1.1;
      src.connect(env);
    } else {
      src = ctx.createBufferSource(); src.buffer = noise(); src.loop = true;
      var f = ctx.createBiquadFilter();
      if (note === 42 || note === 44 || note === 46) { f.type = 'highpass'; f.frequency.value = 7000; dur = note === 46 ? 0.25 : 0.05; }
      else if (note === 49 || note === 51 || note === 57 || note === 55 || note === 52) { f.type = 'highpass'; f.frequency.value = 5000; dur = 0.8; }
      else if (note === 38 || note === 40) { f.type = 'bandpass'; f.frequency.value = 2000; dur = 0.18; }
      else { f.type = 'bandpass'; f.frequency.value = 3000; dur = 0.1; }
      src.connect(f); f.connect(env);
      amp *= 0.7;
    }
    env.gain.setValueAtTime(amp, when);
    env.gain.exponentialRampToValueAtTime(0.001, when + dur);
    src.start(when);
    v.endAt = when + dur + 0.02;
    src.stop(v.endAt);
    v.oscs.push(src); v.sustained = false; v.drum = true;
  }

  function noteOff(ci, note, when) {
    var v = M.lastOn[ci * 128 + note];
    if (!v || v.drum || !v.sustained || v.released) return;
    v.released = true;
    var now = ctx.currentTime; if (when < now) when = now;
    v.gain.gain.cancelScheduledValues(when);
    v.gain.gain.setTargetAtTime(0, when, v.rel / 3);
    v.endAt = when + v.rel * 2 + 0.05;
    v.oscs.forEach(function (o) { try { o.stop(v.endAt); } catch (e) {} });
  }

  function killVoice(v, when) {
    try {
      v.gain.gain.cancelScheduledValues(when);
      v.gain.gain.setTargetAtTime(0, when, 0.01);
      v.oscs.forEach(function (o) { o.stop(when + 0.06); });
    } catch (e) {}
  }

  function applyEvent(e, when) {
    var c = M.ch[e.ch];
    if (e.k === 0x90) noteOn(e.ch, e.a, e.v, when);
    else if (e.k === 0x80) noteOff(e.ch, e.a, when);
    else if (e.k === 0xc0) c.prog = e.a;
    else if (e.k === 0xe0) {
      c.bend = (((e.v << 7) | e.a) - 8192) / 8192;
      M.voices.forEach(function (v) { if (v.ch === e.ch && v.pitch) v.pitch.detune.setValueAtTime(c.bend * 200, Math.max(when, ctx.currentTime)); });
    } else if (e.k === 0xb0) {
      var n = e.a, val = e.v;
      if (n === 7) c.vol = val; else if (n === 11) c.expr = val; else if (n === 10) c.pan = val;
      else if (n === 121) { c.vol = 100; c.expr = 127; c.pan = 64; c.bend = 0; }
      else if (n === 120 || n === 123) { allNotesOff(e.ch, when); return; }
      else return;
      var node = chanNode(e.ch), t = Math.max(when, ctx.currentTime);
      node.gain.setTargetAtTime(Math.pow(c.vol / 127, 2) * Math.pow(c.expr / 127, 2), t, 0.005);
      if (c.panner) c.panner.pan.setTargetAtTime((c.pan - 64) / 64, t, 0.005);
    }
  }

  function allNotesOff(ci, when) {
    M.voices.forEach(function (v) {
      if (v.ch !== ci) return;
      if (v.sustained && !v.released) noteOff(ci, v.note, when);
    });
  }

  function newBus() {
    var b = ctx.createGain();
    b.gain.value = 1;
    b.connect(musicBus);
    return b;
  }

  function teardown(m, fade) {
    if (!m) return;
    m.dead = true;
    if (m.timer) { clearInterval(m.timer); m.timer = null; }
    var now = ctx.currentTime;
    m.bus.gain.cancelScheduledValues(now);
    m.bus.gain.setValueAtTime(m.bus.gain.value, now);
    m.bus.gain.linearRampToValueAtTime(0, now + fade);
    m.voices.forEach(function (v) { try { v.oscs.forEach(function (o) { o.stop(now + fade + 0.01); }); } catch (e) {} });
    setTimeout(function () { try { m.bus.disconnect(); } catch (e) {} }, (fade + 0.1) * 1000);
  }

  function tick() {
    if (!M || M.dead || M.paused || !ctx || ctx.state !== 'running') return;
    var now = ctx.currentTime, horizon = now + 0.2, S = M.song;
    for (;;) {
      if (M.idx >= S.events.length) {
        if (now < M.base + S.length) return;      // let the last notes finish
        if (M.loop) { M.base += S.length; M.idx = 0; continue; }
        M.playing = false; clearInterval(M.timer); M.timer = null; return;
      }
      var e = S.events[M.idx], when = M.base + e.t;
      if (when > horizon) return;
      applyEvent(e, when);
      M.idx++;
    }
  }

  function startSequencer(song, loop, atPos) {
    var bus = newBus();
    bus.gain.setValueAtTime(0, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.02);
    var old = M;
    var ch = old ? old.ch : newChannels();
    ch.forEach(function (c) { c.node = null; c.panner = null; });
    M = { song: song, loop: loop, idx: 0, base: ctx.currentTime - (atPos || 0), bus: bus, ch: ch,
          voices: [], lastOn: {}, playing: true, paused: false, dead: false, timer: null };
    if (atPos) while (M.idx < song.events.length && song.events[M.idx].t < atPos) {
      var e = song.events[M.idx]; if (e.k !== 0x90 && e.k !== 0x80) applyEvent(e, ctx.currentTime); M.idx++;
    }
    M.timer = setInterval(tick, 25);
    tick();
  }

  function musicPlay(p, len, loop) {
    st.musicRequested++;
    if (!ensureCtx()) return;
    var H = heap();
    try {
      var song = parseMidi(H.slice(p, p + len));
      if (M) { teardown(M, 0.03); M = null; }
      musicDesired = { song: song, loop: !!loop };
      resume();
      startSequencer(song, !!loop, 0);
      st.musicStarted++;
    } catch (e) { st.musicErrors++; console.warn('CapAudio music:', e.message); }
  }
  var musicDesired = null;

  // op: 0 stop, 1 volume (0-127), 2 pause, 3 resume
  function musicOp(op, arg) {
    if (!ensureCtx()) { if (op === 1) musicVol = arg / 127; return; }
    if (op === 0) { if (M) { teardown(M, 0.03); M = null; } musicDesired = null; }
    else if (op === 1) {
      musicVol = Math.max(0, Math.min(1, arg / 127));
      musicBus.gain.setTargetAtTime(musicVol * 0.5, ctx.currentTime, 0.01);
    } else if (op === 2) {
      if (M && !M.paused) {
        M.pausedAt = ctx.currentTime - M.base; M.paused = true;
        var old = M; var song = old.song, loop = old.loop;
        teardown(old, 0.03);
        M = { dead: true, paused: true, pausedAt: old.pausedAt, song: song, loop: loop, ch: old.ch, voices: [], bus: old.bus, playing: true };
      }
    } else if (op === 3) {
      if (M && M.paused && M.song) { var pm = M; startSequencer(pm.song, pm.loop, pm.pausedAt % Math.max(pm.song.length, 0.001)); }
    }
  }

  function musicPlaying() { return !!(M && M.playing); }

  // ---- diagnostics -----------------------------------------------------
  function stats() {
    var o = {};
    for (var k in st) o[k] = st[k];
    o.ctxState = ctx ? ctx.state : 'none';
    o.sampleRate = ctx ? ctx.sampleRate : 0;
    o.sfxChannelsActive = Object.keys(chans).length;
    o.musicPlaying = musicPlaying();
    o.musicVoices = M && M.voices ? M.voices.length : 0;
    return o;
  }

  window.CapAudio = {
    sfxStart: sfxStart, sfxParams: sfxParams, sfxStop: sfxStop, sfxPlaying: sfxPlaying,
    musicPlay: musicPlay, musicOp: musicOp, musicPlaying: musicPlaying,
    stats: stats, resume: resume,
    resetPeak: function () { st.maxPeak = 0; },
    // Test hook: play a lump-independent tone and report the measured level.
    _ctx: function () { return ctx; }
  };
})();
