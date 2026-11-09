// Samples tic count / frames every 250 ms from navigation start. Args: distDir outFile
import { chromium } from '/Users/sarahtseng/Projects/fellowship-loop-capstone/tests/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const [dir, out] = process.argv.slice(2);
const types = { '.html':'text/html', '.js':'text/javascript', '.wasm':'application/wasm', '.data':'application/octet-stream' };
const srv = http.createServer((q, r) => { const p = path.join(dir, q.url.split('?')[0] === '/' ? 'index.html' : q.url.split('?')[0]);
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': types[path.extname(p)] || 'text/plain' }); r.end(d); } }); });
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1000, height: 700 } });
const t0 = Date.now(); await pg.goto(`http://127.0.0.1:${srv.address().port}/`);
const rows = [];
for (let i = 0; i < 24; i++) {
  rows.push(await pg.evaluate(() => ({ t: Math.round(performance.now()), tic: Module._cap_tic_count ? Module._cap_tic_count() : null, fr: Module._rt ? Module._rt.frames : null })));
  await pg.waitForTimeout(250);
}
fs.writeFileSync(out, rows.map(r => JSON.stringify(r)).join('\n') + '\n');
await b.close(); srv.close();
