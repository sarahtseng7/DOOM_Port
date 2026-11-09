// reviewer_gameplay EGn2Bb: copied unchanged from ZIYPuo.
// Per-tic coast profile: hold ArrowUp 600 ms in E1M1, release, log speed per gametic. Usage: node coast_pertic.mjs <OUT> <PORT>
import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const { chromium } = createRequire(root + '/tests/package.json')('playwright');
const [OUT, PORT] = process.argv.slice(2); const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(`http://127.0.0.1:${PORT}/`); await sleep(4000);
const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
await key('Enter'); await sleep(1200); for (let i = 0; i < 3; i++) { await key('Enter'); await sleep(900); } await sleep(5000);
await page.evaluate(() => { window.__log = []; let last = -1; const f = () => { const t = Module._cap_tic_count(); if (t !== last) { last = t; window.__log.push([t, Module._cap_player_x(), Module._cap_player_y()]); } window.__h = setTimeout(f, 2); }; f(); });
await page.keyboard.down('ArrowUp'); await sleep(600);
const relTic = await page.evaluate(() => Module._cap_tic_count()); await page.keyboard.up('ArrowUp'); await sleep(2500);
const log = await page.evaluate(() => { clearTimeout(window.__h); return window.__log; });
const rows = []; for (let i = 1; i < log.length; i++) { const dt = log[i][0] - log[i-1][0]; rows.push({ tic: log[i][0], dt, sp: +(Math.hypot(log[i][1]-log[i-1][1], log[i][2]-log[i-1][2]) / dt).toFixed(3) }); }
const after = rows.filter(r => r.tic > relTic + 1 && r.sp > 0);
const ratios = []; for (let i = 1; i < after.length; i++) if (after[i].dt === 1 && after[i-1].sp > 1) ratios.push(+(after[i].sp / after[i-1].sp).toFixed(3));
const lastMove = after.length ? after[after.length-1].tic - relTic : 0;
const gaps = rows.filter(r => r.dt > 1).length;
const out = { relTic, ticsSampled: rows.length, multiTicGaps: gaps, stoppedTicsAfterRelease: lastMove, peakSpeed: Math.max(...rows.map(r => r.sp)), decayRatios: ratios, medianRatio: ratios.slice().sort()[ratios.length >> 1], errs };
console.log(JSON.stringify(out)); fs.writeFileSync(OUT + '/coast-pertic.json', JSON.stringify({ ...out, rows }, null, 1)); await b.close();
