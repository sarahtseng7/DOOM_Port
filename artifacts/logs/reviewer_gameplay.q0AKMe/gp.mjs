import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const R = process.argv[2], OUT = process.argv[3];
const { chromium } = await import(pathToFileURL(R + '/tests/node_modules/playwright/index.mjs'));
const DIST = R + '/dist'; const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm' };
const srv = http.createServer((q, s) => { const p = path.join(DIST, q.url.split('?')[0].replace(/^\/$/, '/index.html')); if (!fs.existsSync(p)) { s.writeHead(404).end(); return; } s.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s); });
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const browser = await chromium.launch(); const page = await (await browser.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
const con = []; page.on('console', m => con.push(`[${m.type()}] ${m.text()}`)); page.on('pageerror', e => con.push('[pageerror] ' + e.message));
await page.goto(`http://127.0.0.1:${srv.address().port}/?r=gp6`);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const S = () => page.evaluate(() => { const M = Module; return { x: M._cap_player_x(), y: M._cap_player_y(), a: M._cap_player_angle(), h: M._cap_player_health(), l: M._cap_level_id(), t: M._cap_tic_count() }; });
const A = () => page.evaluate(() => { const c = window.CapAudio; return { state: c._ctx() && c._ctx().state, stats: c.stats && JSON.parse(JSON.stringify(c.stats())) , music: c.musicPlaying && c.musicPlaying() }; });
const out = {};
await sleep(2500);
out.audioBeforeGesture = await A();
for (let i = 0; i < 4; i++) { await page.keyboard.press('Enter'); await sleep(900); } await sleep(3000);
const s0 = await S(); out.start = s0;
out.audioInLevel = await A();
// movement: hold forward, sample speed, then blur (real page blur via window event + visibility)
await page.keyboard.down('ArrowUp'); await sleep(1500);
const m1 = await S(); await sleep(300); const m2 = await S();
out.speedBeforeBlur = Math.hypot(m2.x - m1.x, m2.y - m1.y);
await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await sleep(1500);
const b1 = await S(); await sleep(800); const b2 = await S();
out.blur = { movedAfter: Math.hypot(b2.x - b1.x, b2.y - b1.y), ticsAdvanced: b2.t - b1.t };
await page.keyboard.up('ArrowUp'); await sleep(500);
// turning
const t0 = await S(); await page.keyboard.down('ArrowLeft'); await sleep(500); await page.keyboard.up('ArrowLeft'); await sleep(600);
const t1 = await S(); out.turnDeltaBAM = ((t1.a - t0.a) >>> 0) / 2**32 * 360;
// fire / use: Ctrl, check audio stats change and no crash
const f0 = await A(); await page.keyboard.press('Control'); await sleep(300); await page.keyboard.press('Control'); await sleep(500);
out.fire = { before: f0.stats, after: (await A()).stats };
// menu: Esc, tics should stop advancing
await page.keyboard.press('Escape'); await sleep(800); const e1 = await S(); await sleep(1000); const e2 = await S();
out.menuOpen = { ticsAdvancedIn1s: e2.t - e1.t };
await page.screenshot({ path: `${OUT}/menu.png` });
await page.keyboard.press('Escape'); await sleep(800); const r1 = await S(); await sleep(1000); const r2 = await S();
out.menuClosed = { ticsAdvancedIn1s: r2.t - r1.t };
out.audioEnd = await A();
await page.screenshot({ path: `${OUT}/final.png` });
out.con = con.filter(c => /error/i.test(c)); out.conCount = con.length;
fs.writeFileSync(OUT + '/gp-results.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
await browser.close(); srv.close();
