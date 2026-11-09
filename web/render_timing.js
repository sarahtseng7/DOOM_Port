// Display scaling for the Doom canvas (coder_render_timing-owned).
// Pixel conversion and timing live in platform/render_timing.c; this file only
// changes the canvas CSS size so the fixed 640x400 backing store fills the
// window at its 16:10 aspect. It never touches the canvas width/height, so
// frame contents and the 640x400 framebuffer contract are unchanged.
(function () {
  var W = 640, H = 400;
  function fit() {
    var c = document.getElementById('canvas');
    if (!c) return;
    // Work in device pixels so HiDPI displays also get whole-pixel scaling.
    var dpr = window.devicePixelRatio || 1;
    var s = Math.min(window.innerWidth / W, window.innerHeight / H) * dpr;
    // Prefer an integer scale (crisp pixel-doubled art) only when it uses most
    // of the window; otherwise fill at the fractional fit (e.g. 1280x720 would
    // floor 1.8x to 1x and leave large borders).
    var si = Math.floor(s);
    if (si >= 1 && si >= s * 0.9) s = si;
    c.style.width = Math.floor(W * s) / dpr + 'px';
    c.style.height = Math.floor(H * s) / dpr + 'px';
  }
  window.addEventListener('resize', fit);
  window.addEventListener('DOMContentLoaded', fit);
  fit();
})();
