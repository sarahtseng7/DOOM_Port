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
    var s = Math.min(window.innerWidth / W, window.innerHeight / H);
    // Integer scale when >= 1 keeps pixel-doubled art crisp; otherwise shrink.
    if (s >= 1) s = Math.floor(s);
    c.style.width = Math.floor(W * s) + 'px';
    c.style.height = Math.floor(H * s) + 'px';
  }
  window.addEventListener('resize', fit);
  window.addEventListener('DOMContentLoaded', fit);
  fit();
})();
