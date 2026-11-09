// Ad-hoc check (not a protected test). usage: node audio_check.mjs <dist> <outdir>
import { createRequire } from 'module';
const require = createRequire('/Users/sarahtseng/Projects/fellowship-loop-capstone/tests/');
const { chromium } = require('playwright');
import http from 'http'; import fs from 'fs'; import path from 'path';
const [dist, out] = process.argv.slice(2);
const mime = { '.html':'text/html', '.js':'text/javascript', '.wasm':'application/wasm' };
const srv = http.createServer((q, r) => { const f = path.join(dist, q.url === '/' ? 'index.html' : q.url.split('?')[0]);
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, {'content-type': mime[path.extname(f)]||'application/octet-stream'}); r.end(d);} }); });
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const pg = await b.newPage({ viewport: { width: 1280, height: 800 } });
const errs = []; pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => { if (m.type()==='error'||m.type()==='warning') errs.push(m.text()); });
await pg.goto(url);
await pg.waitForFunction(() => window.Module && Module._cap_ready && Module._cap_ready() === 1, null, { timeout: 60000 });
const S = () => pg.evaluate(() => CapAudio.stats());
const res = { url, errs };
await pg.waitForTimeout(3000);   // title screen: D_INTRO music should be requested
res.title = await S();
await pg.screenshot({ path: out + '/title.png' });
const key = async (k, ms=120) => { await pg.keyboard.down(k); await pg.waitForTimeout(ms); await pg.keyboard.up(k); await pg.waitForTimeout(250); };
await key('Enter'); await key('Enter'); await key('Enter'); await key('Enter'); // menu -> new game -> episode -> skill
await pg.waitForTimeout(3000);
await pg.evaluate(() => CapAudio.resetPeak());
res.afterStart = await S();
for (let i=0;i<4;i++) { await key('Control', 200); await pg.waitForTimeout(300); }  // fire (pistol sound)
await key('Space', 150); await key('ArrowUp', 600);
await pg.waitForTimeout(500);
res.afterPlay = await S();
await pg.screenshot({ path: out + '/play.png' });
fs.writeFileSync(out + '/audio_result.json', JSON.stringify(res, null, 2));
console.log(JSON.stringify(res, null, 2));
await b.close(); srv.close();
