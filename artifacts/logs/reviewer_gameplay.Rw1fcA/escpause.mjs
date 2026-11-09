import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const require = createRequire(root + '/tests/package.json');
const { chromium } = require('playwright'); const { PNG } = require('pngjs');
const { diffFrac } = await import(root + '/tests/lib/frames.mjs');
const OUT = process.argv[2]; fs.mkdirSync(OUT + '/screens', { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto('http://127.0.0.1:8124/'); await sleep(4000);
const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
for (let i = 0; i < 4; i++) { await key('Enter'); await sleep(900); } await sleep(7000);
let n = 0; const shot = async nm => { const buf = await page.locator('#canvas').screenshot(); fs.writeFileSync(`${OUT}/screens/${String(++n).padStart(2,'0')}-${nm}.png`, buf); return PNG.sync.read(buf); };
const LEFT = { x0: 0, y0: 0.1, x1: 0.2, y1: 0.8 }; // away from centred menu
const tic = () => page.evaluate(() => Module._cap_tic_count());
// start moving, then open menu while key held
await page.keyboard.down('ArrowUp'); await sleep(700);
await key('Escape'); await sleep(500);
const a = await shot('menu-a'); await sleep(1500); const c = await shot('menu-b');
const d1 = diffFrac(a, c, LEFT);
console.log('menu open, ArrowUp still held: left-region diff over 1.5s', d1.toFixed(4));
await page.keyboard.up('ArrowUp'); await sleep(1000);
const e = await shot('menu-c'); console.log('after release, still in menu diff', diffFrac(c, e, LEFT).toFixed(4));
await key('Escape'); await sleep(300);
const f = await shot('closed-a'); await page.keyboard.down('ArrowUp'); await sleep(600); await page.keyboard.up('ArrowUp'); await sleep(300);
const g = await shot('closed-b'); console.log('after closing menu, forward moves: diff', diffFrac(f, g, LEFT).toFixed(4));
console.log('errors', JSON.stringify(errs)); await b.close();
