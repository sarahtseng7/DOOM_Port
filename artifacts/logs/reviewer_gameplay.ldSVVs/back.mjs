import { createRequire } from 'node:module';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const require = createRequire(root + '/tests/package.json');
const { chromium } = require('playwright'); const { PNG } = require('pngjs');
const { diffFrac, VIEW } = await import(root + '/tests/lib/frames.mjs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
await page.goto('http://127.0.0.1:8126/'); await sleep(4000);
const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
const shot = async () => PNG.sync.read(await page.locator('#canvas').screenshot());
for (let i = 0; i < 3; i++) { await key('Enter'); await sleep(900); } await sleep(7000);
for (let t = 1; t <= 3; t++) {
  const a = await shot(); await key('ArrowDown', 500); const d = []; let p = a;
  for (let i = 0; i < 10; i++) { await sleep(250); const c = await shot(); d.push(+diffFrac(p, c, VIEW).toFixed(3)); p = c; }
  console.log('trial', t, 'backward moved vs start', diffFrac(a, p, VIEW).toFixed(3), 'coast diffs', d.join(' '));
  await key('ArrowUp', 500); await sleep(2500);
}
await b.close();
