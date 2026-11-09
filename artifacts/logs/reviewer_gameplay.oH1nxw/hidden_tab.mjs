// reviewer_gameplay.oH1nxw: real tab-switch probe (H1 stand-in). A second page is brought to front so the
// game page's document becomes hidden via the browser, not a synthetic event. Usage: node hidden_tab.mjs <OUT> <PORT>
import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const { chromium } = createRequire(root + '/tests/package.json')('playwright');
const [OUT, PORT] = process.argv.slice(2); const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch({ headless: process.env.HEADED !== '1' }); const ctx = await b.newContext({ viewport: { width: 800, height: 600 } });
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(`http://127.0.0.1:${PORT}/`); await sleep(4000);
const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
await key('Enter'); await sleep(1200); for (let i = 0; i < 3; i++) { await key('Enter'); await sleep(900); } await sleep(5000);
const S = () => page.evaluate(() => ({ vis: document.visibilityState, tic: Module._cap_tic_count(), x: Module._cap_player_x(), y: Module._cap_player_y(), ang: Module._cap_player_angle() >>> 0, ctx: window.CapAudio.stats().ctxState, t: performance.now() }));
const out = {}; out.before = await S();
await page.keyboard.down('ArrowUp'); await sleep(300);
const cdp = await ctx.newCDPSession(page); const { windowId } = await cdp.send('Browser.getWindowForTarget');
const hideMode = process.env.HIDE || 'tab';
if (hideMode === 'minimize') { await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'minimized' } }); }
else { const other = await ctx.newPage(); await other.goto('about:blank'); await other.bringToFront(); }
await sleep(500);
out.hiddenStart = await S(); await sleep(5000); out.hiddenEnd = await S();
await page.keyboard.up('ArrowUp'); // keyup delivered while hidden; mirrors user releasing key elsewhere
if (hideMode === 'minimize') await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } }); await page.bringToFront(); await sleep(1500); out.back = await S(); await sleep(1500); out.back2 = await S();
await key('ArrowLeft', 300); await sleep(300); out.afterInput = await S();
const d = (a, c) => Math.hypot(c.x - a.x, c.y - a.y);
out.summary = { hideMode,
  becameHidden: out.hiddenStart.vis === 'hidden', visibleAgain: out.back.vis === 'visible',
  ticRateHidden: +((out.hiddenEnd.tic - out.hiddenStart.tic) / ((out.hiddenEnd.t - out.hiddenStart.t) / 1000)).toFixed(1),
  movedWhileHidden: +d(out.hiddenStart, out.hiddenEnd).toFixed(1),
  ticJumpOnReturn: out.back.tic - out.hiddenEnd.tic, movedAfterReturn: +d(out.back, out.back2).toFixed(1),
  ticRateAfterReturn: +((out.back2.tic - out.back.tic) / ((out.back2.t - out.back.t) / 1000)).toFixed(1),
  turnAfterReturn: out.afterInput.ang !== out.back2.ang, audioCtx: [out.hiddenStart.ctx, out.hiddenEnd.ctx, out.back2.ctx], errs };
console.log(JSON.stringify(out, null, 1)); fs.writeFileSync(OUT + '/hidden-tab.json', JSON.stringify(out, null, 1)); await b.close();
