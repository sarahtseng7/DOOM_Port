// Pixel analysis helpers for canvas screenshots (pngjs PNG objects: {width,height,data RGBA}).
// Regions are fractions {x0,y0,x1,y1} of the image so canvas CSS scaling does not matter.
export const VIEW = { x0: 0, y0: 0, x1: 1, y1: 0.80 };      // 3D view (status bar is bottom 32/200)
export const STATUSBAR = { x0: 0, y0: 0.84, x1: 1, y1: 1 };
export const AMMO = { x0: 0.0, y0: 0.86, x1: 0.20, y1: 0.99 }; // ammo counter at status bar left
export const FULL = { x0: 0, y0: 0, x1: 1, y1: 1 };

function box(p, r) {
  return [Math.floor(r.x0 * p.width), Math.floor(r.y0 * p.height),
          Math.ceil(r.x1 * p.width), Math.ceil(r.y1 * p.height)];
}

export function stats(p, r = FULL) {
  const [x0, y0, x1, y1] = box(p, r);
  const colors = new Set();
  let n = 0, R = 0, G = 0, B = 0, dark = 0, transparent = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * p.width + x) * 4;
    const [r_, g, b, a] = [p.data[i], p.data[i + 1], p.data[i + 2], p.data[i + 3]];
    n++; R += r_; G += g; B += b;
    if (a < 255) transparent++;
    if (r_ + g + b < 48) dark++;
    colors.add((r_ << 16) | (g << 8) | b);
  }
  return { n, meanR: R / n, meanG: G / n, meanB: B / n, darkFrac: dark / n,
           distinctColors: colors.size, transparentFrac: transparent / n };
}

// Fraction of pixels whose max channel delta exceeds `thr`.
export function diffFrac(a, b, r = FULL, thr = 24) {
  if (a.width !== b.width || a.height !== b.height) throw new Error('size mismatch');
  const [x0, y0, x1, y1] = box(a, r);
  let c = 0, n = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * a.width + x) * 4; n++;
    const d = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]),
                       Math.abs(a.data[i + 2] - b.data[i + 2]));
    if (d > thr) c++;
  }
  return c / n;
}

function colProfile(p, r) {
  const [x0, y0, x1, y1] = box(p, r); const prof = new Float64Array(x1 - x0);
  for (let x = x0; x < x1; x++) { let s = 0;
    for (let y = y0; y < y1; y++) { const i = (y * p.width + x) * 4; s += p.data[i] * .3 + p.data[i + 1] * .59 + p.data[i + 2] * .11; }
    prof[x - x0] = s / (y1 - y0); }
  return prof;
}

// Horizontal shift (pixels, positive = content of b moved right relative to a) minimizing
// mean abs column-profile error over +-maxShift. Turning right => negative shift.
// Returns {shift, err, err0}: err0 is the error at zero shift (to confirm real improvement).
export function bestShift(a, b, r = VIEW, maxShift = Math.floor(a.width / 3)) {
  const pa = colProfile(a, r), pb = colProfile(b, r); const w = pa.length; const m = Math.floor(w * 0.15);
  const errAt = (s) => { let e = 0, c = 0;
    for (let x = m; x < w - m; x++) { const xb = x + s; if (xb < 0 || xb >= w) continue; e += Math.abs(pa[x] - pb[xb]); c++; }
    return c ? e / c : Infinity; };
  let best = 0, be = Infinity;
  for (let s = -maxShift; s <= maxShift; s++) { const e = errAt(s); if (e < be) { be = e; best = s; } }
  return { shift: best, err: be, err0: errAt(0) };
}
