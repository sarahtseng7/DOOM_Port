import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const require = createRequire(root + '/tests/package.json');
const { chromium } = require('playwright'); const { PNG } = require('pngjs');
const { diffFrac, VIEW } = await import(root + '/tests/lib/frames.mjs');
const OUT = process.argv[2]; const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
await page.goto('http://127.0.0.1:8127/'); await sleep(4000);
const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
const raw = async () => page.locator('#canvas').screenshot(); let n = 0;
const shot = async (nm) => { const buf = await raw(); fs.writeFileSync(`${OUT}/${String(++n).padStart(2,'0')}-${nm}.png`, buf); return PNG.sync.read(buf); };
await key("Enter"); await sleep(1500); for (let i = 0; i < 2; i++) { await key("Enter"); await sleep(900); } await key("Enter"); await sleep(7000);
let p = await shot('idle'); const idle = []; for (let i = 0; i < 4; i++) { await sleep(250); const c = await shot('idle'); idle.push(+diffFrac(p, c, VIEW).toFixed(3)); p = c; }
console.log('idle (no input) diffs', idle.join(' '), 'stats', JSON.stringify(await page.evaluate(() => [Module._cap_input_delivered_count(), Module._cap_input_dropped_count()])));
await key('ArrowDown', 500); const d = []; for (let i = 0; i < 12; i++) { await sleep(250); const c = await shot('back'); d.push(+diffFrac(p, c, VIEW).toFixed(3)); p = c; }
console.log('after ArrowDown 500ms', d.join(' '), JSON.stringify(await page.evaluate(() => [Module._cap_input_delivered_count(), Module._cap_input_dropped_count()])));
await b.close();
