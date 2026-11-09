import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const R = process.argv[2], OUT = process.argv[3];
const { chromium } = await import(pathToFileURL(R + '/tests/node_modules/playwright/index.mjs'));
const DIST = R + '/dist'; const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm' };
const srv = http.createServer((q, s) => { const p = path.join(DIST, q.url.split('?')[0].replace(/^\/$/, '/index.html')); if (!fs.existsSync(p)) { s.writeHead(404).end(); return; } s.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s); });
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const browser = await chromium.launch(); const page = await (await browser.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
const con = []; page.on('console', m => con.push(`[${m.type()}] ${m.text()}`)); page.on('pageerror', e => con.push('[pageerror] ' + e.message));
await page.goto(`http://127.0.0.1:${srv.address().port}/?r=gp2`);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const key = async (k, h = 80) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
const P = () => page.evaluate(() => ({ v: Module._cap_player_valid(), x: Module._cap_player_x(), y: Module._cap_player_y(), a: Module._cap_player_angle(), h: Module._cap_player_health(), l: Module._cap_level_id(), t: Module._cap_tic_count() }));
const res = {}; const rec = (k, v) => { res[k] = v; console.log(k, JSON.stringify(v)); };
await sleep(2500); for (let i = 0; i < 4; i++) { await key('Enter'); await sleep(900); } await sleep(3000);
const p0 = await P(); rec('start', p0);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
// Stop-after-release: sample position every 100ms after release
async function holdRelease(k, ms, mods = []) {
  for (const m of mods) await page.keyboard.down(m);
  const a = await P(); await page.keyboard.down(k); await sleep(ms); const mid = await P(); await page.keyboard.up(k);
  for (const m of mods) await page.keyboard.up(m);
  const tr = []; for (let i = 0; i < 30; i++) { await sleep(100); tr.push(await P()); }
  let stopIdx = tr.findIndex((s, i) => i > 0 && s.x === tr[i-1].x && s.y === tr[i-1].y && s.a === tr[i-1].a);
  const fin = tr[tr.length - 1];
  return { moveDuring: dist(a, mid), coastAfter: dist(mid, fin), stopMsAfterRelease: stopIdx < 0 ? null : (stopIdx) * 100, driftLast1s: dist(tr[20], fin), angleDelta: (fin.a - a.a) / 2**32 * 360 };
}

// Turn ~180 to face open space, then alternate to keep clear of walls
await holdRelease('ArrowRight', 900);
const open = await P(); rec('after_turn', open);
const w = await holdRelease('ArrowUp', 400); rec('walk400', w);
await holdRelease('ArrowDown', 500);
const r = await holdRelease('ArrowUp', 400, ['Shift']); rec('run400', r);
await holdRelease('ArrowDown', 600, ['Shift']);
const b0 = await P(); await page.keyboard.down('ArrowUp'); await sleep(400); const bm = await P();
await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await sleep(1800);
const b1 = await P(); await sleep(800); const b2 = await P(); await page.keyboard.up('ArrowUp');
rec('blur_held', { movedBeforeBlur: dist(b0, bm), movedAfterBlur: dist(bm, b1), drift800ms: dist(b1, b2) });
// Hidden tab real: open second page to background
const pg2 = await page.context().newPage(); await pg2.bringToFront(); await sleep(500);
await page.bringToFront().catch(()=>{});
// fire/ammo + health
rec('final', await P()); fs.writeFileSync(OUT + '/pos-results.json', JSON.stringify(res, null, 1)); fs.writeFileSync(OUT + '/pos-console.txt', con.join('\n'));
await page.screenshot({ path: OUT + '/final.png' });
await browser.close(); srv.close();
