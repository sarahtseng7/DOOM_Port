// reviewer_gameplay EGn2Bb: copied unchanged from ZIYPuo.
// Supplemental: Pause key and menu freeze judged by player position (gametic advances while paused by engine design).
import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const { chromium } = createRequire(root + '/tests/package.json')('playwright');
const OUT = process.argv[2], PORT = process.argv[3];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const res = []; const rec = (id, ok, d) => { res.push({ id, ok, d }); console.log(ok ? 'PASS' : 'FAIL', id, JSON.stringify(d)); };
const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(`http://127.0.0.1:${PORT}/`); await sleep(4000);
const S = () => page.evaluate(() => ({ tic: Module._cap_tic_count(), x: Module._cap_player_x(), y: Module._cap_player_y(), ang: Module._cap_player_angle() >>> 0, lvl: Module._cap_level_id() }));
const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
const d = (a, c) => Math.hypot(c.x - a.x, c.y - a.y);
await key('Enter'); await sleep(1200); for (let i = 0; i < 3; i++) { await key('Enter'); await sleep(900); } await sleep(5000);
const s0 = await S(); console.log('level', JSON.stringify(s0));
// Pause, then hold forward + turn 1 s: nothing may move
await key('Pause'); await sleep(300); const p0 = await S();
await page.keyboard.down('ArrowUp'); await page.keyboard.down('ArrowLeft'); await sleep(1000); await page.keyboard.up('ArrowLeft'); await page.keyboard.up('ArrowUp');
await sleep(300); const p1 = await S(); fs.writeFileSync(OUT + '/screens/pause.png', await page.locator('#canvas').screenshot());
rec('P.pause-key-freezes-world', s0.lvl === 101 && d(p0, p1) === 0 && p0.ang === p1.ang, { dPos: d(p0, p1), dAng: p1.ang - p0.ang, gameticDelta: p1.tic - p0.tic });
await key('Pause'); await sleep(300); const r0 = await S(); await key('ArrowUp', 400); await sleep(300); const r1 = await S();
rec('P.unpause-resumes-movement', d(r0, r1) > 20, { dPos: d(r0, r1) });
// Menu: hold forward while menu opened -> no movement
await page.keyboard.down('ArrowUp'); await sleep(300); await key('Escape'); await sleep(100); const m0 = await S(); await sleep(1200); const m1 = await S(); await page.keyboard.up('ArrowUp');
rec('P.menu-freezes-while-key-held', d(m0, m1) === 0, { dPos: d(m0, m1), gameticDelta: m1.tic - m0.tic });
await key('Escape'); await sleep(500);
const c0 = await S(); await sleep(1500); const c1 = await S();
rec('F.no-coast-or-stuck-after-menu-close', d(c0, c1) < 70, { dPos: d(c0, c1), note: 'momentum from before the menu may resume after close' });
const c2 = await S(); await sleep(800); const c3 = await S(); rec('F.stopped-after-menu-close', d(c2, c3) === 0, { dPos: d(c2, c3) });
rec('E.no-page-errors', errs.length === 0, errs);
fs.writeFileSync(OUT + '/pause-results.json', JSON.stringify({ res, errs }, null, 1)); await b.close();
