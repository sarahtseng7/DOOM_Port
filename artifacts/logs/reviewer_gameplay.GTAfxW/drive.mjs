import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { pathToFileURL } from 'node:url';
const R = process.argv[2], OUT = process.argv[3];
const { chromium } = await import(pathToFileURL(R + '/tests/node_modules/playwright/index.mjs'));
const { PNG } = (await import(pathToFileURL(R + '/tests/node_modules/pngjs/lib/png.js'))).default ? await import(pathToFileURL(R + '/tests/node_modules/pngjs/lib/png.js')).then(m=>m.default) : {};
const { diffFrac, bestShift, stats, VIEW } = await import(pathToFileURL(R + '/tests/lib/frames.mjs'));
const DIST = R + '/dist';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm' };
const srv = http.createServer((q, s) => { const p = path.join(DIST, q.url.split('?')[0].replace(/^\/$/, '/index.html')); if (!fs.existsSync(p)) { s.writeHead(404).end(); return; } s.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s); });
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
const con = []; page.on('console', m => con.push(`[${m.type()}] ${m.text()}`)); page.on('pageerror', e => con.push('[pageerror] ' + e.message));
await page.addInitScript(() => {
  window.__au = { src: 0, osc: 0, peak: 0 };
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d, ...a) {
    if (d && d.constructor && d.constructor.name === 'AudioDestinationNode' && !this.__tap) {
      const an = this.context.createAnalyser(); an.fftSize = 1024; this.__tap = an; oc.call(this, an); window.__an = window.__an || []; window.__an.push(an);
    }
    return oc.call(this, d, ...a);
  };
  for (const [C, k] of [[AudioBufferSourceNode, 'src'], [OscillatorNode, 'osc']]) { const s = C.prototype.start; C.prototype.start = function (...a) { window.__au[k]++; return s.apply(this, a); }; }
  setInterval(() => { for (const an of window.__an || []) { const b = new Float32Array(an.fftSize); an.getFloatTimeDomainData(b); for (const v of b) window.__au.peak = Math.max(window.__au.peak, Math.abs(v)); } }, 20);
});
await page.goto(`http://127.0.0.1:${srv.address().port}/?r=gp`);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const shot = async name => { const b = await page.locator('canvas').screenshot({ path: `${OUT}/${name}.png` }); return PNG.sync.read(b); };
const key = async (k, h = 80) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
const res = {}; const rec = (k, v) => { res[k] = v; console.log(k, JSON.stringify(v)); };
const settle = async (ms = 4000) => { let prev = await shot('_t'), t0 = Date.now(); while (Date.now() - t0 < ms) { await sleep(250); const c = await shot('_t'); if (diffFrac(prev, c, VIEW) < 0.002) return { settled: true, ms: Date.now() - t0, frame: c }; prev = c; } return { settled: false, ms, frame: prev }; };
await sleep(2500);
rec('audio_before_gesture', await page.evaluate(() => ({ ...window.__au })));
await key('Enter'); await sleep(1200); await shot('01-menu');
await key('Enter'); await sleep(900); await key('Enter'); await sleep(900); await key('Enter'); await sleep(4000);
await shot('02-level-start'); rec('audio_after_menu_and_start', await page.evaluate(() => ({ ...window.__au })));
const s0 = await settle(); const f0 = s0.frame; await shot('03-idle');
rec('level_idle_settled', s0.settled);
// turn
for (const [k, n] of [['ArrowRight', 'turn-right'], ['ArrowLeft', 'turn-left']]) {
  const a = await shot('_a'); await page.keyboard.down(k); await sleep(200); await page.keyboard.up(k);
  const st = await settle(); rec(n, { shift: bestShift(a, st.frame, VIEW), settledAfterMs: st.ms, settled: st.settled });
}
// forward + stop
const a = await shot('_a'); await page.keyboard.down('ArrowUp'); await sleep(1000); const mid = await shot('04-moving');
await page.keyboard.up('ArrowUp'); const t1 = Date.now(); const st = await settle(5000);
rec('forward', { movedDiff: diffFrac(a, mid, VIEW), stopSettled: st.settled, stopMs: st.ms, afterDiff: diffFrac(st.frame, await shot('05-after'), VIEW) });
// strafe w/ alt, run with shift
await page.keyboard.down('Shift'); await page.keyboard.down('ArrowUp'); await sleep(800); const run = await shot('06-run'); await page.keyboard.up('ArrowUp'); await page.keyboard.up('Shift'); const sr = await settle(5000);
rec('run', { diffFromPrev: diffFrac(st.frame, run, VIEW), settled: sr.settled, ms: sr.ms });
// fire
const pre = await shot('_p'); const au0 = await page.evaluate(() => ({ ...window.__au }));
await page.keyboard.down('Control'); await sleep(120); await page.keyboard.up('Control'); await sleep(150); const fire = await shot('07-fire');
for (let i = 0; i < 3; i++) { await key('Control', 100); await sleep(300); }
const au1 = await page.evaluate(() => ({ ...window.__au }));
rec('fire', { weaponFrameDiff: diffFrac(pre, fire, { x0: 0.3, y0: 0.5, x1: 0.7, y1: 0.8 }), ammoShown: 'see 07-fire.png', audio: { before: au0, after: au1 } });
// use
await key('Space', 100); await sleep(600); await shot('08-use');
// blur while turning
await page.keyboard.down('ArrowRight'); await sleep(300);
await page.evaluate(() => { window.dispatchEvent(new Event('blur')); });
const sb = await settle(4000); await sleep(800); const after = await shot('09-blur-later');
rec('blur_while_holding', { settled: sb.settled, ms: sb.ms, laterDiff: diffFrac(sb.frame, after, VIEW) });
await page.keyboard.up('ArrowRight'); await settle(3000);
// escape menu
await key('Escape'); await sleep(700); const menu = await shot('10-esc-menu'); await key('Escape'); await sleep(700);
rec('esc_menu_opens_diff', diffFrac(f0, menu, VIEW));
const rt = await page.evaluate(() => ({ tics: window.Module?._cap_tic_count?.() }));
await sleep(2000); const rt2 = await page.evaluate(() => ({ tics: window.Module?._cap_tic_count?.() }));
rec('tics_per_s_approx', rt.tics !== undefined ? (rt2.tics - rt.tics) / 2 : null);
rec('audio_final', await page.evaluate(() => ({ ...window.__au })));
rec('audio_ctx_states', await page.evaluate(() => (window.__an || []).map(a => a.context.state)));
fs.writeFileSync(OUT + '/results.json', JSON.stringify(res, null, 2)); fs.writeFileSync(OUT + '/console.txt', con.join('\n'));
await browser.close(); srv.close();
