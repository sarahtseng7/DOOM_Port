// reviewer_gameplay.oH1nxw: visibilitychange-only release check (no blur). Overrides document.hidden then dispatches
// visibilitychange while ArrowLeft (turn, no momentum) is held; keyup is never sent. Usage: node visibility_release.mjs <OUT> <PORT>
import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const { chromium } = createRequire(root + '/tests/package.json')('playwright');
const [OUT, PORT] = process.argv.slice(2); const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(`http://127.0.0.1:${PORT}/`); await sleep(4000);
const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
await key('Enter'); await sleep(1200); for (let i = 0; i < 3; i++) { await key('Enter'); await sleep(900); } await sleep(5000);
const S = () => page.evaluate(() => ({ tic: Module._cap_tic_count(), ang: Module._cap_player_angle() >>> 0, x: Module._cap_player_x(), y: Module._cap_player_y() }));
const r = {};
r.a0 = await S(); await page.keyboard.down('ArrowLeft'); await sleep(400); r.a1 = await S();
await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
await sleep(150); r.a2 = await S(); await sleep(1000); r.a3 = await S();
await page.evaluate(() => { delete document.hidden; delete document.visibilityState; document.dispatchEvent(new Event('visibilitychange')); });
await page.keyboard.up('ArrowLeft'); await sleep(200);
r.b0 = await S(); await key('ArrowRight', 300); await sleep(200); r.b1 = await S();
r.summary = { turningWhileHeld: r.a1.ang !== r.a0.ang, turnedAfterHiddenTicsWindow: r.a3.ang !== r.a2.ang, ticsInWindow: r.a3.tic - r.a2.tic, inputWorksAfter: r.b1.ang !== r.b0.ang, errs };
r.pass = r.summary.turningWhileHeld && !r.summary.turnedAfterHiddenTicsWindow && r.summary.ticsInWindow > 20 && r.summary.inputWorksAfter && errs.length === 0;
console.log(JSON.stringify(r, null, 1)); fs.writeFileSync(OUT + '/visibility-release.json', JSON.stringify(r, null, 1)); await b.close();
