import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const require = createRequire(root + '/tests/package.json');
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const { diffFrac, bestShift, VIEW, AMMO, stats } = await import(root + '/tests/lib/frames.mjs');
const OUT = process.argv[2]; fs.mkdirSync(OUT + '/screens', { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const res = []; const rec = (id, ok, d) => { res.push({ id, ok, d }); console.log(ok ? 'PASS' : 'FAIL', id, d); };
const b = await chromium.launch(); // NO autoplay-policy flag
const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('http://127.0.0.1:8184/'); await sleep(4000);
let n = 0; const shot = async (nm) => { const buf = await page.locator('#canvas').screenshot(); fs.writeFileSync(`${OUT}/screens/${String(++n).padStart(2,'0')}-${nm}.png`, buf); return PNG.sync.read(buf); };
const A = () => page.evaluate(() => window.CapAudio.stats());
const pre = await A(); console.log('audio before gesture', JSON.stringify(pre));
const tic = () => page.evaluate(() => Module._cap_tic_count());
const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
await key('Enter'); await sleep(1500);
const post = await A(); console.log('audio after gesture', JSON.stringify(post));
rec('A.ctx-running-after-gesture-no-autoplay-flag', post.ctxState === 'running', `before=${pre.ctxState} after=${post.ctxState}`);
rec('A.menu-sfx-and-music-heard', post.sfxPlayed > 0 && post.maxPeak > 0.01, `sfxPlayed=${post.sfxPlayed} musicStarted=${post.musicStarted} maxPeak=${post.maxPeak}`);
// New game
for (let i = 0; i < 2; i++) { await key('Enter'); await sleep(900); } await key('Enter'); await sleep(7000);
const s0 = await shot('level'); rec('G.level-entered', stats(s0, {x0:0,y0:0.84,x1:1,y1:1}).distinctColors > 20, 'statusbar colours');
const a1 = await A(); rec('A.level-music-switched', a1.musicStarted >= 2 || a1.musicPlaying, JSON.stringify({ms:a1.musicStarted, playing:a1.musicPlaying, peak:a1.maxPeak}));
// tic rate
const t0 = await tic(); await sleep(3000); const t1 = await tic(); rec('T.tic-rate', Math.abs((t1-t0)/3-35) < 4, `${((t1-t0)/3).toFixed(1)} tics/s`);
// Momentum: hold forward 500ms, measure motion after release over time
let prev = await shot('fwd-start'); await page.keyboard.down('ArrowUp'); await sleep(500); await page.keyboard.up('ArrowUp');
const diffs = []; for (let i = 0; i < 12; i++) { await sleep(250); const c = await shot('coast'); diffs.push(+diffFrac(prev, c, VIEW).toFixed(3)); prev = c; }
console.log('post-release diffs per 250ms', diffs.join(' '));
rec('M.forward-coasts-then-stops', diffs[0] > 0.005 && diffs.slice(-3).every(d => d < 0.02), diffs.join(','));
// strafe via Alt+Left? and comma/period
const base = await shot('strafe0'); await key('Period', 400); await sleep(1500); const sp = await shot('strafe-period');
rec('M.period-strafes', diffFrac(base, sp, VIEW) > 0.03, `diff=${diffFrac(base, sp, VIEW).toFixed(3)}`);
const sr0 = await shot('run0'); const tA = await tic(); await page.keyboard.down('ShiftLeft'); await page.keyboard.down('ArrowUp'); await sleep(600); await page.keyboard.up('ArrowUp'); await page.keyboard.up('ShiftLeft'); await sleep(2000); const sr1 = await shot('run1');
const w0 = await shot('walk0'); await key('ArrowDown', 700); await sleep(2000); // go back
const w1 = await shot('walk-back'); rec('M.shift-run-moves', diffFrac(sr0, sr1, VIEW) > 0.05, `diff=${diffFrac(sr0, sr1, VIEW).toFixed(3)}`);
// fire + sound
const aBefore = await A(); const p0 = await shot('fire-pre'); await key('ControlLeft', 150); await sleep(1500); const p1 = await shot('fire-post');
const aAfter = await A();
rec('C.fire-ammo-and-sfx', diffFrac(p0, p1, AMMO) > 0.02 && aAfter.sfxPlayed > aBefore.sfxPlayed, `ammoDiff=${diffFrac(p0,p1,AMMO).toFixed(3)} sfx ${aBefore.sfxPlayed}->${aAfter.sfxPlayed}`);
// hold fire: autofire
const f0 = await A(); await page.keyboard.down('ControlLeft'); await sleep(1500); await page.keyboard.up('ControlLeft'); await sleep(800); const f1 = await A();
rec('C.held-fire-repeats-sfx', f1.sfxPlayed - f0.sfxPlayed >= 3, `${f0.sfxPlayed}->${f1.sfxPlayed}`);
// use
const u0 = await A(); await key('Space', 100); await sleep(600); const u1 = await A(); console.log('use sfx delta', u1.sfxPlayed - u0.sfxPlayed);
// menu freeze by frame diff: start a forward run, open menu while coasting, compare frames
await key('ArrowUp', 600); await key('Escape'); await sleep(300);
const mA = await shot('menu-a'); await sleep(1500); const mB = await shot('menu-b');
const md = diffFrac(mA, mB, VIEW); rec('P.menu-freezes-world-by-framediff', md < 0.03, `diff over 1.5s with menu open=${md.toFixed(3)} (coast without menu was ~0.5 first 250ms)`);
const clk0 = await page.evaluate(() => window.CapAudio._ctx().currentTime); const w0c = Date.now(); await sleep(2000); const clk1 = await page.evaluate(() => window.CapAudio._ctx().currentTime);
console.log('audio clock advance', (clk1-clk0).toFixed(3), 'in', (Date.now()-w0c)/1000, 's wall');
rec('A.audio-clock-advances', (clk1-clk0) > 1.5, `${(clk1-clk0).toFixed(3)}s per 2s wall`);
const pk = await A(); await sleep(800); const pk2 = await A(); console.log('peak while paused (lastPeak)', pk2.lastPeak, 'voices', pk2.musicVoices);
await key('Escape'); await sleep(800);
// focus loss: hold turn, blur
await page.keyboard.down('ArrowRight'); await sleep(400);
await page.evaluate(() => { window.dispatchEvent(new Event('blur')); }); await sleep(1500);
const b0 = await shot('blur-a'); await sleep(500); const b1 = await shot('blur-b'); rec('F.blur-stops-turn', diffFrac(b0, b1, VIEW) < 0.02, `diff=${diffFrac(b0,b1,VIEW).toFixed(3)}`);
await page.keyboard.up('ArrowRight');
// real tab hidden: open a new page to background
const p2 = await page.context().newPage(); await p2.goto('about:blank'); await p2.bringToFront(); await sleep(3000);
const h = await page.evaluate(() => ({ hidden: document.hidden, vis: document.visibilityState })); const th0 = await tic(); await sleep(3000); const th1 = await tic();
console.log('background tab', JSON.stringify(h), 'tics in 3s', th1 - th0, 'audio', JSON.stringify(await A()));
await p2.close(); await page.bringToFront(); await sleep(2000);
const tr0 = await tic(); await sleep(2000); const tr1 = await tic(); rec('F.resumes-after-foreground', (tr1-tr0)/2 > 25, `${((tr1-tr0)/2).toFixed(1)} tics/s`);
const fin = await A(); console.log('final audio', JSON.stringify(fin)); console.log('errors', JSON.stringify(errs));
fs.writeFileSync(OUT + '/review-results.json', JSON.stringify({ res, pre, post, fin, errs, diffs }, null, 1));
await b.close();
