import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const require = createRequire(root + '/tests/package.json');
const { chromium } = require('playwright'); const { PNG } = require('pngjs');
const { diffFrac, VIEW } = await import(root + '/tests/lib/frames.mjs');
const OUT = process.argv[2]; fs.mkdirSync(OUT + '/screens', { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => m.type()==='error' && errs.push(m.text()));
await page.goto('http://127.0.0.1:8123/'); await sleep(4000);
let n=0; const shot = async nm => { const buf = await page.locator('#canvas').screenshot(); fs.writeFileSync(`${OUT}/screens/${String(++n).padStart(2,'0')}-${nm}.png`, buf); return PNG.sync.read(buf); };
const key = async (k,h=100)=>{await page.keyboard.down(k);await sleep(h);await page.keyboard.up(k);};
const A = () => page.evaluate(() => window.CapAudio.stats());
for (let i=0;i<4;i++){ await key('Enter'); await sleep(i<3?900:7000); }
const base = await shot('level');
// hold forward while paused: should not move
await key('Pause'); await sleep(1200); const p1 = await shot('paused');
await page.keyboard.down('ArrowUp'); await sleep(1500); const p2 = await shot('paused-fwd-held'); await page.keyboard.up('ArrowUp'); await sleep(500);
const pausedHold = diffFrac(p1, p2, VIEW);
const a = await A(); await sleep(1000); const a2 = await A();
await key('Pause'); await sleep(800);
await page.keyboard.down('ArrowUp'); await sleep(1200); const u1 = await shot('unpaused-fwd'); await page.keyboard.up('ArrowUp'); await sleep(2500);
const unp = diffFrac(base, u1, VIEW);
console.log('pauseOverlayVsBase', diffFrac(base,p1,VIEW).toFixed(3), 'movedWhilePaused', pausedHold.toFixed(4), 'movedAfterUnpause', unp.toFixed(3));
console.log('audio while paused lastPeak', a.lastPeak, a2.lastPeak, 'musicVoices', a2.musicVoices);
// menu pause: open Esc, hold forward
await key('Escape'); await sleep(700); const m1 = await shot('menu'); // menu consumes arrows; instead check world via status of an outside-menu region is unreliable
await key('Escape'); await sleep(500);
// Use key on wall, then repeat
const s0 = await A(); await key('Space'); await sleep(500); console.log('use sfx delta', (await A()).sfxPlayed - s0.sfxPlayed);
console.log('errors', JSON.stringify(errs));
await b.close();
