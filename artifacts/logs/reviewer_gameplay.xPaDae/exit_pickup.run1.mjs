// reviewer_gameplay xPaDae: G3c normal level exit via E1M1 exit switch (linedef 330, special 11,
// x=2912 y=-4800..-4736 from wad-e1m1.json) and an item pickup (health bonus 2014 at 1312,-3520).
// IDCLIP is used only for travel; it is switched off before the pickup and before pressing Use.
// Usage: node exit_pickup.mjs <OUT_DIR> <PORT>
import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const require = createRequire(root + '/tests/package.json');
const { chromium } = require('playwright');
const [OUT, PORT] = process.argv.slice(2); const sleep = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT + '/screens', { recursive: true });
const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage(); const errs = [];
page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(`http://127.0.0.1:${PORT}/`); await sleep(4000);
const S = () => page.evaluate(() => { const a = window.CapAudio.stats(); return { tic: Module._cap_tic_count(), lvl: Module._cap_level_id(), valid: Module._cap_player_valid(), hp: Module._cap_player_health(), x: Module._cap_player_x(), y: Module._cap_player_y(), ang: Module._cap_player_angle() >>> 0, sec: Module._cap_player_sector(), sfx: a.sfxPlayed, mus: a.musicStarted }; });
const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
const type = async (s) => { for (const ch of s) { await key(ch, 60); await sleep(60); } };
const shot = async (nm) => fs.writeFileSync(`${OUT}/screens/ep-${nm}.png`, await page.locator('#canvas').screenshot());
const res = []; const trace = []; const rec = (id, ok, d) => { res.push({ id, ok, d }); console.log(ok ? 'PASS' : 'FAIL', id, JSON.stringify(d)); };
const deg = a => a / 4294967296 * 360;
const norm = d => ((d + 540) % 360) - 180;
async function face(targetDeg, tol = 2) {
  for (let i = 0; i < 60; i++) {
    const s = await S(); const e = norm(targetDeg - deg(s.ang));
    if (Math.abs(e) <= tol) return s;
    const ms = Math.max(40, Math.min(400, Math.abs(e) * 8));
    await key(e > 0 ? 'ArrowLeft' : 'ArrowRight', ms); await sleep(250);
  }
  return S();
}
async function goTo(tx, ty, stopDist = 24, maxSteps = 120) {
  for (let i = 0; i < maxSteps; i++) {
    const s = await S(); const dx = tx - s.x, dy = ty - s.y, dist = Math.hypot(dx, dy);
    trace.push({ tx, ty, x: s.x, y: s.y, ang: +deg(s.ang).toFixed(1), hp: s.hp });
    if (dist <= stopDist) return { ok: true, s, dist };
    await face(Math.atan2(dy, dx) * 180 / Math.PI, dist < 150 ? 3 : 6);
    await key('ArrowUp', Math.max(40, Math.min(500, dist * 2.5))); await sleep(dist < 150 ? 700 : 150);
  }
  const s = await S(); return { ok: false, s, dist: Math.hypot(tx - s.x, ty - s.y) };
}
await page.click('#canvas');
await key('Enter'); await sleep(1200); for (let i = 0; i < 3; i++) { await key('Enter'); await sleep(900); } await sleep(5000);
const s0 = await S(); rec('entered-e1m1', s0.lvl === 101 && s0.valid === 1, s0); await shot('00-start');
// --- item pickup: health bonus (2014) at (1312,-3520); approach with clipping ON so P_TouchSpecialThing runs
await type('idclip'); await sleep(400);
const near = await goTo(1250, -3520, 20);
await type('idclip'); await sleep(400); // clipping back on
const pre = await S();
const walk = await goTo(1312, -3520, 8, 30); await sleep(600);
const post = await S(); await shot('01-after-bonus');
rec('pickup-health-bonus', post.hp === pre.hp + 1 && post.sfx > pre.sfx, { pre: { hp: pre.hp, sfx: pre.sfx, x: pre.x, y: pre.y }, post: { hp: post.hp, sfx: post.sfx, x: post.x, y: post.y }, nearOk: near.ok, walkOk: walk.ok });
// --- level exit: travel to the exit room, face the switch (west, 180 deg), clipping off, press Use
await type('idclip'); await sleep(400);
const r1 = await goTo(2990, -4768, 16, 200);
await type('idclip'); await sleep(400);
await face(180, 1.5); const atSwitch = await S(); await shot('02-facing-exit-switch');
rec('reached-exit-switch', r1.ok && atSwitch.lvl === 101 && Math.abs(atSwitch.x - 2912) < 64, { x: atSwitch.x, y: atSwitch.y, ang: +deg(atSwitch.ang).toFixed(1), sec: atSwitch.sec });
await key(' ', 150); await sleep(300); const sw = await S(); await shot('03-switch-pressed');
rec('exit-switch-sfx', sw.sfx > atSwitch.sfx, { sfxDelta: sw.sfx - atSwitch.sfx });
await sleep(2500); const inter = await S(); await shot('04-intermission');
rec('intermission-shown', inter.lvl === 101 || inter.valid === 0, { lvl: inter.lvl, valid: inter.valid, tic: inter.tic, musDelta: inter.mus - atSwitch.mus });
// skip intermission stats then advance
for (let i = 0; i < 4; i++) { await key('Enter', 120); await sleep(1500); }
await sleep(3000); const nxt = await S(); await shot('05-e1m2');
rec('next-level-e1m2', nxt.lvl === 102 && nxt.valid === 1, { lvl: nxt.lvl, hp: nxt.hp, x: nxt.x, y: nxt.y, musDelta: nxt.mus - atSwitch.mus });
const m0 = await S(); await key('ArrowUp', 500); await sleep(1500); const m1 = await S();
rec('movement-in-e1m2', Math.hypot(m1.x - m0.x, m1.y - m0.y) > 30, { moved: +Math.hypot(m1.x - m0.x, m1.y - m0.y).toFixed(1) });
rec('no-page-errors', errs.length === 0, errs);
fs.writeFileSync(`${OUT}/exit-pickup.json`, JSON.stringify({ res, trace }, null, 1));
console.log('SUMMARY pass=' + res.filter(r => r.ok).length + ' fail=' + res.filter(r => !r.ok).length);
await b.close();
