// reviewer_gameplay EGn2Bb: open-space blur release (scripted form of ZIYPuo's MCP recheck). Usage: node blur_open.mjs <OUT> <PORT>
// Fresh E1M1 spawn faces open floor. Control: hold ArrowUp 600 ms, real keyup. Test: reload, hold 600 ms, dispatch blur, never keyup.
import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const { chromium } = createRequire(root + '/tests/package.json')('playwright');
const [OUT, PORT] = process.argv.slice(2); const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(); const errs = [];
const run = async (mode) => {
  const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
  page.on('pageerror', e => errs.push(mode + ': ' + e.message));
  await page.goto(`http://127.0.0.1:${PORT}/`); await sleep(4000);
  const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
  await key('Enter'); await sleep(1200); for (let i = 0; i < 3; i++) { await key('Enter'); await sleep(900); } await sleep(5000);
  const S = () => page.evaluate(() => ({ tic: Module._cap_tic_count(), x: Module._cap_player_x(), y: Module._cap_player_y(), lvl: Module._cap_level_id() }));
  await page.evaluate(() => { window.__log = []; let last = -1; const f = () => { const t = Module._cap_tic_count(); if (t !== last) { last = t; window.__log.push([t, Module._cap_player_x(), Module._cap_player_y()]); } window.__h = setTimeout(f, 2); }; f(); });
  const s0 = await S(); await page.keyboard.down('ArrowUp'); await sleep(600);
  const s1 = await S(); const relTic = s1.tic;
  if (mode === 'keyup') await page.keyboard.up('ArrowUp'); else await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await sleep(2500); const s2 = await S(); await sleep(1000); const s3 = await S();
  const log = await page.evaluate(() => { clearTimeout(window.__h); return window.__log; });
  let lastMove = 0; for (let i = 1; i < log.length; i++) if (log[i][0] > relTic && (log[i][1] !== log[i-1][1] || log[i][2] !== log[i-1][2])) lastMove = log[i][0] - relTic;
  const d = (a, c) => +Math.hypot(c.x - a.x, c.y - a.y).toFixed(1);
  let worksAfter = null;
  if (mode === 'blur') { await page.keyboard.up('ArrowUp'); const w0 = await S(); await page.keyboard.down('ArrowDown'); await sleep(500); await page.keyboard.up('ArrowDown'); await sleep(1500); worksAfter = d(w0, await S()); }
  if (mode === 'blur') fs.writeFileSync(OUT + '/screens/blur-open-after.png', await page.locator('#canvas').screenshot());
  return { mode, lvl: s0.lvl, movedWhileHeld: d(s0, s1), coastAfterRelease: d(s1, s2), lastMoveTicsAfterRelease: lastMove, movedFinal1s: d(s2, s3), inputWorksAfter: worksAfter };
};
fs.mkdirSync(OUT + '/screens', { recursive: true });
const ctl = await run('keyup'); const blr = await run('blur');
const pass = blr.movedWhileHeld > 30 && blr.movedFinal1s === 0 && blr.lastMoveTicsAfterRelease <= ctl.lastMoveTicsAfterRelease + 6 && blr.inputWorksAfter > 10 && errs.length === 0;
const r = { pass, control: ctl, blur: blr, errs }; console.log(JSON.stringify(r, null, 1)); fs.writeFileSync(OUT + '/blur-open.json', JSON.stringify(r, null, 1)); await b.close();
