// reviewer_gameplay XkfiAZ: repeats tests/playtest.mjs E2b's exact event sequence (only document.hidden overridden, then
// visibilitychange, while ArrowLeft is held; keyup sent only after restoring) N times, judged by ENGINE angle, not pixels.
// Purpose: decide whether coder.oWCDg7's single E2b FAIL (later-diff=0.057) was a stuck key or a pixel-diff false failure.
// Usage: node e2b_repeat.mjs <OUT> <PORT> [N]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const { chromium } = createRequire(root + '/tests/package.json')('playwright');
const [OUT, PORT, NS] = process.argv.slice(2); const N = Number(NS || 10); const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(`http://127.0.0.1:${PORT}/`); await sleep(4000);
const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
await key('Enter'); await sleep(1200); for (let i = 0; i < 3; i++) { await key('Enter'); await sleep(900); } await sleep(5000);
const S = () => page.evaluate(() => ({ tic: Module._cap_tic_count(), ang: Module._cap_player_angle() >>> 0, held: window.CapInput.held().length }));
const trials = [];
for (let i = 0; i < N; i++) {
  await page.keyboard.down('ArrowLeft'); await sleep(500);
  const a0 = await S(); await sleep(300); const a1 = await S();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await sleep(100); const h0 = await S(); await sleep(1500); const h1 = await S();
  await page.evaluate(() => { delete document.hidden; }); await page.keyboard.up('ArrowLeft'); await sleep(400);
  const t = { i, turningWhileHeld: a1.ang !== a0.ang, angleChangeWhileHidden: (h1.ang - h0.ang) >>> 0, ticsHiddenWindow: h1.tic - h0.tic, heldAfterHide: h0.held };
  t.pass = t.turningWhileHeld && t.angleChangeWhileHidden === 0 && t.ticsHiddenWindow > 30 && t.heldAfterHide === 0;
  trials.push(t); console.log(JSON.stringify(t));
}
const r = { N, passed: trials.filter(t => t.pass).length, errs, trials };
r.pass = r.passed === N && errs.length === 0;
console.log(`SUMMARY pass=${r.passed}/${N} pageErrors=${errs.length}`);
fs.writeFileSync(OUT + '/e2b-repeat.json', JSON.stringify(r, null, 1)); await b.close();
