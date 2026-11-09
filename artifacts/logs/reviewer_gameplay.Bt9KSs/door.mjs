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
rec('start', await P());
const path_ = [];
for (let i = 0; i < 16; i++) { await page.keyboard.down('ArrowUp'); await sleep(250); await page.keyboard.up('ArrowUp'); }
for (const [dir, ms] of [['ArrowRight', 900], ['ArrowLeft', 1800]]) {
  await page.keyboard.down(dir); await sleep(ms); await page.keyboard.up(dir); await sleep(600);
  for (let i = 0; i < 14; i++) {
    await page.keyboard.down('ArrowUp'); await sleep(250); await page.keyboard.up('ArrowUp');
    await key('Space', 60); const p = await P(); path_.push([dir, p.x, p.y, Math.round(p.a / 2**32 * 360), p.h]);
  }
  await sleep(800); await page.screenshot({ path: `${OUT}/door2-${dir}.png` });
}
rec('path', path_);
await sleep(1500); rec('final', await P());
fs.writeFileSync(OUT + '/door-results.json', JSON.stringify(res, null, 1)); fs.writeFileSync(OUT + '/door-console.txt', con.join('\n'));
await browser.close(); srv.close();
