// Browser keyboard capture for the Doom port (coder_input_audio-owned).
// Maps KeyboardEvent.code -> doomkeys.h codes and forwards to the C queue
// (cap_input_event / cap_input_reset). Self-installing; resolves `Module`
// lazily, so script order relative to the Emscripten glue does not matter.
// Load with: <script src="input_audio.js"></script>
// Audio and persistence are not implemented here (scope undecided).
(function () {
  'use strict';

  var KEYS = {
    ArrowLeft: 0xac, ArrowRight: 0xae, ArrowUp: 0xad, ArrowDown: 0xaf,
    ControlLeft: 0xa3, ControlRight: 0xa3, Space: 0xa2,
    ShiftLeft: 0xb6, ShiftRight: 0xb6, AltLeft: 0xb8, AltRight: 0xb8,
    Comma: 0xa0, Period: 0xa1, Enter: 13, NumpadEnter: 13, Escape: 27,
    Tab: 9, Backspace: 0x7f, Pause: 0xff, Minus: 0x2d, Equal: 0x3d,
    NumpadSubtract: 0x2d, NumpadAdd: 0x3d, Slash: 0x2f,
    Home: 0xc7, End: 0xcf, PageUp: 0xc9, PageDown: 0xd1,
    Insert: 0xd2, Delete: 0xd3,
    Numpad8: 0xad, Numpad2: 0xaf, Numpad4: 0xac, Numpad6: 0xae,
    F1: 0xbb, F2: 0xbc, F3: 0xbd, F4: 0xbe, F5: 0xbf, F6: 0xc0,
    F7: 0xc1, F8: 0xc2, F9: 0xc3, F10: 0xc4, F11: 0xd7, F12: 0xd8
  };

  // KeyboardEvent.code -> doom key; 0 if unmapped.
  function doomKey(code) {
    if (Object.prototype.hasOwnProperty.call(KEYS, code)) return KEYS[code];
    var m = /^Key([A-Z])$/.exec(code);
    if (m) return m[1].toLowerCase().charCodeAt(0);
    m = /^Digit(\d)$/.exec(code);
    return m ? m[1].charCodeAt(0) : 0;
  }

  // Physical codes currently held (so keyup always matches its keydown even
  // if the layout/modifiers changed in between).
  var held = {};

  function mod() { return window.Module; }
  function ready() {
    var M = mod();
    return !!(M && M.calledRun && M._cap_input_event);
  }

  function send(pressed, key) {
    if (ready()) mod()._cap_input_event(pressed, key);
  }

  // Keys the browser needs: reload/fullscreen/devtools, and Ctrl+letter/digit
  // (Ctrl is also Doom fire, so the key is still forwarded, just not blocked).
  function browserShortcut(e) {
    if (e.code === 'F5' || e.code === 'F11' || e.code === 'F12') return true;
    return e.ctrlKey && /^(Key[A-Z]|Digit\d)$/.test(e.code);
  }

  function onKeyDown(e) {
    var key = doomKey(e.code);
    // Leave browser/OS shortcuts (Cmd+R, Ctrl is fire so only Meta is checked).
    if (!key || e.metaKey) return;
    if (!browserShortcut(e)) e.preventDefault();
    // Auto-repeat of a key we already hold: Doom repeats itself. A repeat for
    // a key we do NOT hold means releaseAll() ran while it was still down
    // (refocus), so treat it as a fresh press.
    if (held[e.code]) return;
    var already = false;
    for (var c in held) if (held[c] === key) already = true;
    held[e.code] = key;
    if (!already) send(1, key); // L+R Ctrl map to one doom key: one press
  }

  function onKeyUp(e) {
    var key = held[e.code];
    if (!key) {
      if (doomKey(e.code)) e.preventDefault();
      return;
    }
    delete held[e.code];
    e.preventDefault();
    // Two physical keys can map to one doom key (left/right Ctrl): release
    // only when no other held code maps to it.
    for (var c in held) if (held[c] === key) return;
    send(0, key);
  }

  // Focus/visibility loss: browsers drop keyups, so release everything.
  function releaseAll() {
    held = {};
    if (ready() && mod()._cap_input_reset) mod()._cap_input_reset();
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', releaseAll);
  window.addEventListener('pagehide', releaseAll);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) releaseAll();
  });
  // Ctrl+click / right-click opens a menu and swallows the matching keyup.
  window.addEventListener('contextmenu', function (e) { e.preventDefault(); releaseAll(); });
  // Cmd (macOS) swallows keyups for other keys while held.
  window.addEventListener('keydown', function (e) { if (e.key === 'Meta') releaseAll(); });

  window.CapInput = { doomKey: doomKey, releaseAll: releaseAll, held: function () { return Object.keys(held); } };
})();
