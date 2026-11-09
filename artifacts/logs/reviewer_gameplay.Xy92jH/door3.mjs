import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const R = process.argv[2], OUT = process.argv[3];
const { chromium } = await import(pathToFileURL(R + '/tests/node_modules/playwright/index.mjs'));
const DIST = R + '/dist'; const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm' };
const srv = http.createServer((q, s) => { const p = path.join(DIST, q.url.split('?')[0].replace(/^\/$/, '/index.html')); if (!fs.existsSync(p)) { s.writeHead(404).end(); return; } s.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s); });
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const browser = await chromium.launch(); const page = await (await browser.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
const con = []; page.on('console', m => con.push(`[${m.type()}] ${m.text()}`)); page.on('pageerror', e => con.push('[pageerror] ' + e.message));
await page.goto(`http://127.0.0.1:${srv.address().port}/?r=gp3`);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const P = async () => { const p = await page.evaluate(() => ({ x: Module._cap_player_x(), y: Module._cap_player_y(), a: Module._cap_player_angle(), h: Module._cap_player_health(), l: Module._cap_level_id() })); p.deg = Math.round(p.a / 2**32 * 360); return p; };
const hold = async (k, ms) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await sleep(500); };
await sleep(2500); for (let i = 0; i < 4; i++) { await page.keyboard.press('Enter'); await sleep(900); } await sleep(3000);
const log = []; const rec = async (n) => { const p = await P(); log.push({ n, ...p }); console.log(n, JSON.stringify(p)); };
await rec('start');
await hold('ArrowUp', 4000); await rec('north wall');
const before = await P();
await page.keyboard.press('Space'); await sleep(1500); await page.screenshot({ path: `${OUT}/use-after.png` });
await hold('ArrowUp', 2500); await rec('after use+walk');
// try each side of the hall: turn and use
for (const [d, ms] of [['ArrowLeft', 700], ['ArrowLeft', 700], ['ArrowLeft', 700], ['ArrowLeft', 700]]) {
  await hold(d, ms); await page.keyboard.press('Space'); await sleep(1200); await hold('ArrowUp', 1200); await rec('turn ' + d);
}
await page.screenshot({ path: `${OUT}/final.png` });
fs.writeFileSync(OUT + '/door3-results.json', JSON.stringify({ log, con }, null, 1));
await browser.close(); srv.close();
