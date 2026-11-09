import { createRequire } from 'node:module'; import fs from 'node:fs';
const req = createRequire('/Users/sarahtseng/Projects/fellowship-loop-capstone/tests/package.json'); const { PNG } = req('pngjs');
const [a, b] = process.argv.slice(2).map(f => PNG.sync.read(fs.readFileSync(f)));
let n = 0, minx = 1e9, maxx = -1, miny = 1e9, maxy = -1; const H = Math.min(a.height, Math.round(a.height * 0.84));
for (let y = 0; y < H; y++) for (let x = 0; x < a.width; x++) { const i = (y * a.width + x) * 4;
  if (Math.abs(a.data[i]-b.data[i]) + Math.abs(a.data[i+1]-b.data[i+1]) + Math.abs(a.data[i+2]-b.data[i+2]) > 30) { n++; minx=Math.min(minx,x); maxx=Math.max(maxx,x); miny=Math.min(miny,y); maxy=Math.max(maxy,y); } }
console.log(JSON.stringify({ size: [a.width, a.height], viewRowsChecked: H, changedPx: n, frac: +(n / (a.width * H)).toFixed(4), bbox: { x: [minx, maxx], y: [miny, maxy] } }));
