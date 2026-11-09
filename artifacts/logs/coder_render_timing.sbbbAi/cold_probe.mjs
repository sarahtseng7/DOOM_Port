// Cold-start probe: fresh browser per run (empty cache). Measures time to first
// presented frame, time to first tic, and tic rate over 3 s from the first tic.
// Usage: node cold_probe.mjs <dist-dir> <out.jsonl> [cpuThrottle]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.resolve('tests/package.json'));
const { chromium } = require('playwright');
const [dist, out, thr] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1)];
const types = { '.html':'text/html', '.js':'text/javascript', '.wasm':'application/wasm', '.data':'application/octet-stream' };
const srv = http.createServer((q, r) => {
  const f = path.join(dist, q.url.split('?')[0] === '/' ? 'index.html' : q.url.split('?')[0]);
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' }); r.end(b); } });
}).listen(0, '127.0.0.1');
await new Promise(r => srv.on('listening', r));
const url = `http://127.0.0.1:${srv.address().port}/`;
const lines = [];
for (let i = 0; i < 4; i++) {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  if (thr > 1) { const c = await p.context().newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: thr }); }
  const t0 = Date.now(); await p.goto(url);
  let tFrame = null, tTic = null, ticAtFirst = 0;
  while (Date.now() - t0 < 30000) {
    const s = await p.evaluate(() => ({ f: window.Module && Module._rt ? Module._rt.frames : 0, t: Module._cap_tic_count ? Module._cap_tic_count() : 0 })).catch(() => ({ f: 0, t: 0 }));
    if (tFrame === null && s.f > 0) tFrame = Date.now() - t0;
    if (tTic === null && s.t > 0) { tTic = Date.now() - t0; ticAtFirst = s.t; break; }
    await p.waitForTimeout(20);
  }
  const a = Date.now(); await p.waitForTimeout(3000);
  const s2 = await p.evaluate(() => ({ f: Module._rt.frames, t: Module._cap_tic_count() }));
  const rate = (s2.t - ticAtFirst) / ((Date.now() - a) / 1000);
  const px = await p.evaluate(() => { const d = document.getElementById('canvas').getContext('2d').getImageData(0,0,640,400).data; let a0 = 0; for (let k = 3; k < d.length; k += 4) if (d[k] !== 255) a0++; return a0; });
  lines.push(JSON.stringify({ run: i, throttle: thr, msToFirstFrame: tFrame, msToFirstTic: tTic, ticRateAfterFirstTic: +rate.toFixed(1), nonOpaquePixels: px, pageErrors: errs }));
  await b.close();
}
fs.writeFileSync(out, lines.join('\n') + '\n'); console.log(lines.join('\n')); srv.close();
