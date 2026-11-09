// reviewer_gameplay Njlpzg: helpers copied from xPaDae exit_pickup.mjs. New checks: combined inputs (forward+strafe diagonal, forward+turn arc)
// and a manual door (E1M1 linedef 151, special 1, x=1536 y=-2432..-2560, from wad-doors.json) blocking then opening on Use.
// IDSPISPOPD (Doom 1 noclip; IDCLIP is Doom II only, st_stuff.c:392) is used only for travel; it is switched off before the pickup and before pressing Use.
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
const s0 = await S(); rec('entered-e1m1', s0.lvl === 101 && s0.valid === 1, s0);
// --- combined inputs, clipping on, start room facing 90 deg
const hold = async (keys, ms) => { for (const k of keys) await page.keyboard.down(k); await sleep(ms); for (const k of keys) await page.keyboard.up(k); await sleep(1600); };
let a = await S(); await hold(['ArrowUp', '.'], 300); let b2 = await S();
let dx = b2.x - a.x, dy = b2.y - a.y, f = deg(a.ang) * Math.PI / 180;
const fwd = dx * Math.cos(f) + dy * Math.sin(f), side = dx * Math.sin(f) - dy * Math.cos(f);
rec('diagonal-forward-plus-strafe-right', fwd > 20 && side > 20 && Math.abs(norm(deg(b2.ang) - deg(a.ang))) < 0.5, { fwd: +fwd.toFixed(1), right: +side.toFixed(1), dAng: +norm(deg(b2.ang) - deg(a.ang)).toFixed(2) });
await hold(['ArrowDown', ','], 300); // return roughly
a = await S(); await hold(['ArrowUp', 'ArrowLeft'], 400); b2 = await S();
const dAng = norm(deg(b2.ang) - deg(a.ang));
rec('arc-forward-plus-turn-left', dAng > 10 && Math.hypot(b2.x - a.x, b2.y - a.y) > 20, { dAng: +dAng.toFixed(2), moved: +Math.hypot(b2.x - a.x, b2.y - a.y).toFixed(1) });
await shot('dr-00-after-combined');
// --- door: travel west of linedef 151 with noclip, clipping on, test blocked, Use, test passable
await type('idspispopd'); await sleep(400);
const r = await goTo(1490, -2496, 10, 200);
await type('idspispopd'); await sleep(400);
await face(0, 1.5); const pre = await S(); await shot('dr-01-facing-door');
rec('reached-door-front', r.ok && pre.x < 1536 && pre.lvl === 101, { x: pre.x, y: pre.y, ang: +deg(pre.ang).toFixed(1) });
await key('ArrowUp', 600); await sleep(1500); const blocked = await S();
rec('closed-door-blocks', blocked.x < 1536, { x: blocked.x, y: blocked.y });
await face(0, 1.5); const u0 = await S(); await key(' ', 150); await sleep(300); const u1 = await S(); await shot('dr-02-use-pressed');
rec('door-use-sfx', u1.sfx > u0.sfx, { sfxDelta: u1.sfx - u0.sfx });
await sleep(1200); await shot('dr-03-door-open');
await key('ArrowUp', 700); await sleep(1500); const through = await S(); await shot('dr-04-through');
rec('open-door-passable', through.x > 1560, { x: through.x, y: through.y, sec: through.sec });
rec('no-page-errors', errs.length === 0, errs);
fs.writeFileSync(`${OUT}/door-combined.json`, JSON.stringify({ res, trace }, null, 1));
console.log(`SUMMARY pass=${res.filter(x => x.ok).length} fail=${res.filter(x => !x.ok).length}`);
await b.close();
