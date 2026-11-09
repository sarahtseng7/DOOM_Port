// Fault-injection self-test for the analysis helpers: proves the pixel checks FAIL on bad frames.
// Needs no browser or build. Run: node tests/selftest.mjs
import { PNG } from 'pngjs';
import { stats, diffFrac, bestShift, VIEW } from './lib/frames.mjs';
let fails = 0;
const ok = (name, cond) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}`); if (!cond) fails++; };
function img(fn, w = 320, h = 200) { const p = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const [r, g, b, a = 255] = fn(x, y); const i = (y * w + x) * 4;
    p.data[i] = r; p.data[i + 1] = g; p.data[i + 2] = b; p.data[i + 3] = a; } return p; }
const scene = (off) => img((x, y) => { const v = ((x + off) * 7 % 200) + 30; return [v, v * .6, v * .3]; });
const base = scene(0);
ok('good frame: colourful, warm, opaque', (s => s.distinctColors > 16 && s.meanR > s.meanB && s.transparentFrac === 0)(stats(base)));
ok('black frame detected', stats(img(() => [0, 0, 0])).darkFrac > 0.99);
ok('R/B channel swap detected', (s => s.meanB > s.meanR)(stats(img((x, y) => { const v = ((x * 7) % 200) + 30; return [v * .3, v * .6, v]; }))));
ok('alpha=0 (unfixed BGR0) detected', stats(img(() => [90, 60, 30, 0])).transparentFrac === 1);
ok('identical frames: diff 0', diffFrac(base, scene(0)) === 0);
ok('different frames: diff large', diffFrac(base, scene(37)) > 0.2);
const r = bestShift(base, scene(-12)); // content moved right by 12 (x+off sampled at x-12)
ok('shift sign/size: right-moved content => +12', r.shift === 12 && r.err < r.err0);
ok('shift sign: left-moved => -12', bestShift(base, scene(12)).shift === -12);
ok('static frames: no spurious shift improvement', (q => q.shift === 0)(bestShift(base, scene(0))));
// Regression for reviewer R2-1: a shift beyond the search window aliases; the 150ms-hold shift must be well inside it.
const big = bestShift(base, scene(-240)); ok('shift beyond +-213px window is NOT reported as 240 (documents aliasing)', big.shift !== 240);
ok('150ms-class shift (~90px) measured exactly', bestShift(base, scene(-90)).shift === 90);
process.exit(fails ? 1 : 0);
