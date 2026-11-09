import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const R = process.argv[2], OUT = process.argv[3];
const { chromium } = await import(pathToFileURL(R + '/tests/node_modules/playwright/index.mjs'));
const DIST = R + '/dist'; const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm' };
const srv = http.createServer((q, s) => { const p = path.join(DIST, q.url.split('?')[0].replace(/^\/$/, '/index.html')); if (!fs.existsSync(p)) { s.writeHead(404).end(); return; } s.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s); });
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const browser = await chromium.launch(); const page = await (await browser.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
const con = []; page.on('console', m => con.push(`[${m.type()}] ${m.text()}`)); page.on('pageerror', e => con.push('[pageerror] ' + e.message));
await page.goto(`http://127.0.0.1:${srv.address().port}/?r=gp5`);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const S = () => page.evaluate(() => { const M = Module, n = M._cap_sector_count(), c = []; for (let i = 0; i < n; i++) c.push([M._cap_sector_floor(i), M._cap_sector_ceiling(i)]);
  return { x: M._cap_player_x(), y: M._cap_player_y(), a: M._cap_player_angle(), h: M._cap_player_health(), l: M._cap_level_id(), sec: M._cap_player_sector(), n, c }; });
await sleep(2500); for (let i = 0; i < 4; i++) { await page.keyboard.press('Enter'); await sleep(900); } await sleep(3000);
const s0 = await S(); const closed = s0.c.map((v, i) => [i, ...v]).filter(v => v[1] === v[2]);
console.log('start', s0.x, s0.y, 'level', s0.l, 'sectors', s0.n, 'closed(floor==ceil)', JSON.stringify(closed));
const changes = new Map(); let prev = s0.c; const events = [];
const check = async (tag) => { const s = await S(); s.c.forEach((v, i) => { if (v[1] !== prev[i][1]) { events.push({ tag, sector: i, ceil: [prev[i][1], v[1]], player: [s.x, s.y], psec: s.sec }); } }); prev = s.c; return s; };
const hold = async (k, ms) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await sleep(300); await check('after ' + k); };
// steer toward target (tx,ty) with stuck-wiggle; Use pressed every step
const TX = +process.argv[4], TY = +process.argv[5]; const steps = [];
let stuck = 0, last = null;
for (let it = 0; it < 70 && true; it++) {
  const s = await S(); const ang = s.a / 2**32 * 2 * Math.PI; const want = Math.atan2(TY - s.y, TX - s.x);
  let d = want - ang; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  const dist = Math.hypot(TX - s.x, TY - s.y);
  if (last && Math.hypot(s.x - last[0], s.y - last[1]) < 8) stuck++; else stuck = 0; last = [s.x, s.y];
  if (it % 10 === 0) steps.push({ it, x: s.x, y: s.y, sec: s.sec, dist: Math.round(dist), d: Math.round(d * 57.3) });
  if (stuck >= 2) { const k = Math.random() < .5 ? 'ArrowLeft' : 'ArrowRight'; await hold(k, 300 + Math.random() * 500); await page.keyboard.down('ArrowUp'); await sleep(700); await page.keyboard.up('ArrowUp'); stuck = 0; continue; }
  if (Math.abs(d) > 0.12) { await page.keyboard.down(d > 0 ? 'ArrowLeft' : 'ArrowRight'); await sleep(Math.min(500, 60 + Math.abs(d) * 220)); await page.keyboard.up(d > 0 ? 'ArrowLeft' : 'ArrowRight'); await sleep(150); }
  await page.keyboard.down('ArrowUp'); await sleep(350); await page.keyboard.press('Space'); await sleep(100); await page.keyboard.up('ArrowUp'); await sleep(100); await check('steer');
}
await sleep(2000); await check('settle');
await page.screenshot({ path: `${OUT}/door5pass-final.png` });
const sf = await S();
fs.writeFileSync(OUT + '/door5pass-results.json', JSON.stringify({ start: [s0.x, s0.y], closed, traj: steps, events, final: { x: sf.x, y: sf.y, h: sf.h, l: sf.l }, con }, null, 1));
console.log('traj', JSON.stringify(steps)); console.log('events', JSON.stringify(events)); console.log('final', sf.x, sf.y, sf.h, sf.l);
await browser.close(); srv.close();
