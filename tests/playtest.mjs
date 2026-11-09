// Browser acceptance test for the Doom WASM port (AGENT-PROPOSED criteria; see
// artifacts/runs/*/tester/prepare/attempt-1/proposed-criteria.md). Exit 0 only if every required
// check passes. Env: DIST_DIR (default dist), OUT_DIR (evidence), SOAK_SECONDS (default 300),
// QUICK=1 shortens the soak and forces a nonzero exit (3): partial runs never count as pass.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright'; import { PNG } from 'pngjs';
import { stats, diffFrac, bestShift, VIEW, STATUSBAR, AMMO } from './lib/frames.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(root, process.env.DIST_DIR || 'dist');
const OUT = path.resolve(root, process.env.OUT_DIR || `artifacts/runs/manual-${Date.now()}/tester/playtest`);
const QUICK = process.env.QUICK === '1';
const SOAK = QUICK ? 15 : Number(process.env.SOAK_SECONDS || 300);
fs.mkdirSync(path.join(OUT, 'screens'), { recursive: true });

const results = []; const log = [];
const rec = (id, status, detail = '') => { results.push({ id, status, detail }); console.log(`${status.padEnd(10)} ${id} ${detail}`); };
const check = (id, cond, detail = '') => rec(id, cond ? 'PASS' : 'FAIL', detail);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function finish(extra = {}) {
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const unverified = results.filter((r) => r.status === 'UNVERIFIED').length;
  let code = failed ? 1 : 0; if (!code && QUICK) code = 3;
  const out = { status: code === 0 ? 'PASS' : 'FAIL', quick: QUICK, soak_seconds: SOAK, failed, unverified, results, ...extra };
  fs.writeFileSync(path.join(OUT, 'playtest-results.json'), JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(OUT, 'browser-console.log'), log.join('\n'));
  console.log(`playtest: ${out.status} failed=${failed} unverified(not-in-scope, listed)=${unverified}${QUICK ? ' QUICK=partial' : ''}`);
  process.exit(code);
}

// Missing dist is a hard failure, not a skip.
for (const f of ['index.html', 'doom.wasm']) if (!fs.existsSync(path.join(DIST, f))) { rec('B0.dist-present', 'FAIL', `${path.join(DIST, f)} missing`); finish(); }
rec('B0.dist-present', 'PASS');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm', '.data': 'application/octet-stream', '.css': 'text/css' };
const badResponses = [];
const server = http.createServer((req, res) => {
  const p = path.join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/$/, '/index.html'));
  if (!p.startsWith(DIST) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { badResponses.push(`404 ${req.url}`); res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
page.on('console', (m) => { log.push(`[${m.type()}] ${m.text()}`); if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => { log.push(`[pageerror] ${e.message}`); errors.push(`pageerror: ${e.message}`); });
page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()}`));
await page.addInitScript(() => {
  window.__raf = 0; (function t() { window.__raf++; requestAnimationFrame(t); })();
  window.__long = []; try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push(e.duration))).observe({ entryTypes: ['longtask'] }); } catch {}
});

// FAULT=<name> injects a deliberate browser-side fault (see tests/faults.sh) to prove checks catch it.
const FAULT = process.env.FAULT || '';
if (FAULT) await page.addInitScript((f) => {
  const stop = (e) => e.stopImmediatePropagation();
  if (f === 'drop-keyup') window.addEventListener('keyup', stop, true);
  if (f === 'drop-blur') for (const t of ['blur', 'pagehide']) window.addEventListener(t, stop, true), document.addEventListener('visibilitychange', stop, true);
  if (f === 'drop-visibility') window.addEventListener('visibilitychange', stop, true), document.addEventListener('visibilitychange', stop, true);
  if (f === 'ignore-left') for (const t of ['keydown', 'keyup']) window.addEventListener(t, (e) => { if (e.code === 'ArrowLeft') stop(e); }, true);
  if (f === 'bad-aspect') document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = '#canvas{width:640px!important;height:200px!important}'; document.head.append(st); });
  if (f === 'swap-rb') { const o = CanvasRenderingContext2D.prototype.putImageData; CanvasRenderingContext2D.prototype.putImageData = function (img, ...a) {
    const d = new Uint8ClampedArray(img.data); for (let i = 0; i < d.length; i += 4) { const t = d[i]; d[i] = d[i + 2]; d[i + 2] = t; } return o.call(this, new ImageData(d, img.width, img.height), ...a); }; }
}, FAULT);
let n = 0;
async function shot(name) {
  const buf = await page.locator('#canvas').screenshot();
  fs.writeFileSync(path.join(OUT, 'screens', `${String(++n).padStart(3, '0')}-${name}.png`), buf);
  return PNG.sync.read(buf);
}
const key = async (k, hold = 80) => { await page.keyboard.down(k); await sleep(hold); await page.keyboard.up(k); };
// Doom has momentum/friction: motion legitimately decays for ~1.5s after key-up. Poll until two
// consecutive 300ms steps differ <2% (settled) instead of assuming a fixed delay.
async function settle(maxMs = 4000) {
  const t = Date.now(); let prev = await shot('settle');
  while (Date.now() - t < maxMs) { await sleep(300); const cur = await shot('settle'); const d = diffFrac(prev, cur, VIEW); prev = cur; if (d < 0.02) return { frame: cur, ms: Date.now() - t, settled: true }; }
  return { frame: prev, ms: Date.now() - t, settled: false };
}
// Engine state via coder-exported read-only bridge (contract v4). null when export missing.
const pos = () => page.evaluate(() => { const M = window.Module; if (!M || !M._cap_player_valid || !M._cap_player_valid()) return null;
  return { x: M._cap_player_x(), y: M._cap_player_y(), angle: M._cap_player_angle(), health: M._cap_player_health(), level: M._cap_level_id() }; });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const hasCrash = () => errors.some((e) => /abort|RuntimeError|unreachable|Aborted/i.test(e));

try {
  await page.goto(url);
  check('B1.canvas-640x400', await page.evaluate(() => { const c = document.getElementById('canvas'); return !!c && c.width === 640 && c.height === 400; }), 'canvas#canvas intrinsic size');
  // Boot: wait for a non-black, multi-colour frame.
  let boot = null; const t0 = Date.now();
  while (Date.now() - t0 < 60000) { const p = await shot('boot'); const s = stats(p); if (s.darkFrac < 0.9 && s.distinctColors > 16) { boot = { p, s }; break; } await sleep(500); }
  check('B2.boot-renders-frame', !!boot, boot ? `after ${Date.now() - t0}ms colors=${boot.s.distinctColors}` : 'no non-black frame in 60s');
  if (!boot) finish();
  check('B3.opaque-pixels', boot.s.transparentFrac === 0, `transparentFrac=${boot.s.transparentFrac}`);
  check('B4.channel-order', boot.s.meanR > boot.s.meanB, `meanR=${boot.s.meanR.toFixed(1)} meanB=${boot.s.meanB.toFixed(1)} (title/menu are warm; swap => blue)`);
  check('B5.no-load-errors', errors.length === 0 && badResponses.length === 0, [...errors, ...badResponses].slice(0, 5).join(' | '));
  await page.locator('#canvas').click({ position: { x: 5, y: 5 } }).catch(() => {}); // focus only

  // Animation liveness (T1): requestAnimationFrame keeps firing; no multi-second main-thread stalls.
  const r0 = await page.evaluate(() => window.__raf); await sleep(3000); const r1 = await page.evaluate(() => window.__raf);
  check('T1.main-thread-responsive', (r1 - r0) / 3 >= 20, `${((r1 - r0) / 3).toFixed(1)} rAF/s over 3s (need >=20)`);

  // Menu navigation -> new game E1M1 (episode + skill menus with defaults).
  const title = await shot('title');
  await key('Enter'); await sleep(1200); const menu = await shot('main-menu');
  check('M1.enter-opens-menu', diffFrac(title, menu, VIEW) > 0.01, `diff=${diffFrac(title, menu, VIEW).toFixed(3)}`);
  await key('Enter'); await sleep(900); await key('Enter'); await sleep(900); await key('Enter'); // New Game, episode, skill
  await sleep(6000); // wipe + level load
  const lvl = await shot('level-start'); const sb = stats(lvl, STATUSBAR);
  check('G1.level-started', diffFrac(menu, lvl) > 0.2 && sb.distinctColors > 20, `diff-from-menu=${diffFrac(menu, lvl).toFixed(2)} statusbarColors=${sb.distinctColors}`);
  check('B6.level-colors', stats(lvl, VIEW).meanR >= stats(lvl, VIEW).meanB * 0.9, 'E1M1 view not blue-biased');

  const p0 = await pos();
  check('G1b.engine-state-e1m1', !!p0 && p0.level === 101 && p0.health === 100, p0 ? JSON.stringify(p0) : 'cap_player_valid()=0 or export missing (engine state, not pixels)');

  // Idle stability: nothing should move with no input (guards "frames change by themselves").
  const i1 = await shot('idle-a'); await sleep(600); const i2 = await shot('idle-b');
  check('G2.idle-stable', diffFrac(i1, i2, VIEW) < 0.02, `diff=${diffFrac(i1, i2, VIEW).toFixed(4)}`);

  // Turning: right turn => scene shifts left (negative); left turn shifts back (positive). Key release stops it.
  const a = await shot('turn-start');
  // TEST CORRECTION rev 3: hold 150ms (was 350ms). A 350ms hold turned ~200-240px, beyond bestShift's +-213px
  // search window, so the estimate aliased (I3 flaked 4/10, reviewer R2-1). Thresholds (>=8px) unchanged;
  // a result near the window edge is now a FAIL ("saturated") rather than silently aliased.
  const SAT = Math.floor(a.width / 3) * 0.85;
  await page.keyboard.down('ArrowRight'); await sleep(150); await page.keyboard.up('ArrowRight'); await sleep(900);
  const b = await shot('turn-right'); const sr = bestShift(a, b);
  check('I1.turn-right', sr.shift <= -8 && sr.shift > -SAT && sr.err < sr.err0, `shift=${sr.shift}px err=${sr.err.toFixed(1)} err0=${sr.err0.toFixed(1)}`);
  const b2 = await shot('turn-right-settled'); check('I2.turn-stops-on-release', diffFrac(b, b2, VIEW) < 0.02, `diff=${diffFrac(b, b2, VIEW).toFixed(4)}`);
  await page.keyboard.down('ArrowLeft'); await sleep(150); await page.keyboard.up('ArrowLeft'); await sleep(900);
  const c = await shot('turn-left'); const sl = bestShift(b, c);
  check('I3.turn-left', sl.shift >= 8 && sl.shift < SAT && sl.err < sl.err0, `shift=${sl.shift}px`);

  // Movement: forward changes view; backward returns toward start; release halts motion.
  const s0 = await shot('move-start'); const mp0 = await pos();
  await page.keyboard.down('ArrowUp'); await sleep(800); const mid = await shot('move-fwd-held'); await sleep(300); const mid2 = await shot('move-fwd-held2');
  check('I4.forward-moves', diffFrac(s0, mid, VIEW) > 0.05 && diffFrac(mid, mid2, VIEW) > 0.01, `start-vs-mid=${diffFrac(s0, mid, VIEW).toFixed(3)} still-moving=${diffFrac(mid, mid2, VIEW).toFixed(3)}`);
  await page.keyboard.up('ArrowUp');
  const fs1 = await settle(); const f2 = fs1.frame; const mpF = await pos();
  check('I4b.forward-moves-player', !!mp0 && !!mpF && dist(mp0, mpF) >= 32, mp0 && mpF ? `moved ${dist(mp0, mpF).toFixed(0)} map units (need >=32)` : 'no engine position'); await sleep(500); const f3 = await shot('move-fwd-stopped');
  check('I5.forward-stops-on-release', fs1.settled && diffFrac(f2, f3, VIEW) < 0.02, `settled=${fs1.settled} after ${fs1.ms}ms (momentum allowed up to 4s); later-diff=${diffFrac(f2, f3, VIEW).toFixed(4)}`);
  await page.keyboard.down('ArrowDown'); await sleep(1100); await page.keyboard.up('ArrowDown');
  const back = (await settle()).frame;
  // TEST CORRECTION rev 3 (reason: pixel oracle flaked 0.60-0.79 vs 0.7 limit in prior runs): I6 now compares engine
  // position. Backward must end closer to the start than the forward end point (limit 0.7 unchanged). Pixel numbers kept in detail.
  const mpB = await pos(); const dF = mp0 && mpF ? dist(mp0, mpF) : NaN, dB = mp0 && mpB ? dist(mp0, mpB) : NaN;
  check('I6.backward-returns', dF >= 32 && dB < dF * 0.7, `start-to-fwd=${dF.toFixed(0)} start-to-back=${dB.toFixed(0)} map units (pixel diff for reference: ${diffFrac(s0, back, VIEW).toFixed(3)} vs ${diffFrac(s0, f2, VIEW).toFixed(3)})`);

  // Focus loss must release held keys (stuck-key regression).
  // Hold a TURN key (never blocked by walls, so a stuck key keeps the view changing forever).
  await page.keyboard.down('ArrowRight'); await sleep(500);
  const turning = await shot('blur-turning'); await sleep(300); const turning2 = await shot('blur-turning-b');
  check('I7a.turn-held-keeps-changing', diffFrac(turning, turning2, VIEW) > 0.02, `diff=${diffFrac(turning, turning2, VIEW).toFixed(4)} (precondition: key effective before blur)`);
  await page.evaluate(() => { window.dispatchEvent(new Event('blur')); document.dispatchEvent(new Event('visibilitychange')); });
  const bs = await settle(); await sleep(500); const g2 = await shot('blur-b');
  check('I7.blur-releases-keys', bs.settled && diffFrac(bs.frame, g2, VIEW) < 0.02, `settled=${bs.settled} after ${bs.ms}ms; later-diff=${diffFrac(bs.frame, g2, VIEW).toFixed(4)} (key still physically down)`);
  await page.keyboard.up('ArrowRight'); await sleep(500);

  // Fire: ammo counter changes and the weapon/view animates; release stops firing.
  const pre = await shot('fire-pre');
  await key('Control', 120); await sleep(250); const flash = await shot('fire-anim'); await sleep(1500); const post = await shot('fire-post');
  check('C1.fire-animates', diffFrac(pre, flash, VIEW) > 0.005, `view-diff=${diffFrac(pre, flash, VIEW).toFixed(4)}`);
  check('C2.fire-decrements-ammo', diffFrac(pre, post, AMMO) > 0.02, `ammo-region-diff=${diffFrac(pre, post, AMMO).toFixed(3)} (persisting after weapon returns to rest)`);
  const q1 = await shot('fire-rest-a'); await sleep(600); const q2 = await shot('fire-rest-b');
  check('C3.fire-stops-on-release', diffFrac(q1, q2, VIEW) < 0.02, `diff=${diffFrac(q1, q2, VIEW).toFixed(4)}`);

  // Use key + automap + menu overlay do not crash and change the display as expected.
  await key('Space'); await sleep(500);
  const am0 = await shot('automap-pre'); await key('Tab'); await sleep(700); const am1 = await shot('automap-on');
  check('U1.automap-toggles', diffFrac(am0, am1) > 0.2, `diff=${diffFrac(am0, am1).toFixed(3)}`);
  await key('Tab'); await sleep(700); const am2 = await shot('automap-off');
  check('U2.automap-returns', diffFrac(am0, am2, VIEW) < 0.1, `diff=${diffFrac(am0, am2, VIEW).toFixed(3)}`);
  await key('Escape'); await sleep(800); const esc = await shot('esc-menu');
  check('U3.escape-opens-menu', diffFrac(am2, esc, VIEW) > 0.01, `diff=${diffFrac(am2, esc, VIEW).toFixed(3)}`);
  await key('Escape'); await sleep(800); const esc2 = await shot('esc-closed');
  check('U4.escape-closes-menu', diffFrac(esc, esc2, VIEW) > 0.01, `diff=${diffFrac(esc, esc2, VIEW).toFixed(3)}`);
  // U5 (new rev 4): opening the menu mid-coast must freeze the player in ENGINE state (position/angle/tic), not just the picture.
  // TEST CORRECTION (same run it was written, rev 4): first draft also required gametic frozen; observed 52 tics/1.5s while the player was
  // frozen (0.0u) - Doom keeps counting gametic with the menu open and only stops P_Ticker. Wrong assumption of mine, not a product defect; tic delta kept in detail.
  // Precondition: the player is really coasting when Esc is pressed (position still changing before the menu), else the check is vacuous.
  await page.keyboard.down('ArrowUp'); await sleep(500); await page.keyboard.up('ArrowUp');
  const u0 = await pos(); await sleep(120); const u1 = await pos();
  await key('Escape'); await sleep(300);
  const ticA = await page.evaluate(() => window.Module._cap_tic_count()); const m0 = await pos(); await sleep(1500);
  const m1 = await pos(); const ticB = await page.evaluate(() => window.Module._cap_tic_count());
  check('U5.menu-freezes-player', !!u0 && !!u1 && !!m0 && !!m1 && dist(u0, u1) > 1 && dist(m0, m1) === 0 && m0.angle === m1.angle,
    u0 && m0 && m1 ? `coasting-before-menu=${dist(u0, u1).toFixed(1)}u/120ms; frozen-in-menu moved=${dist(m0, m1).toFixed(1)}u tics=${ticB - ticA} over 1.5s` : 'no engine position');
  await key('Escape'); await sleep(800);

  // E*: input edge cases from reviewer findings F2/F3/R2-3 (web/input_audio.js) and identity R2-4.
  // E1: browser shortcuts (F5, Ctrl+R) must NOT be default-prevented; game keys must be.
  const prevented = await page.evaluate(() => { const fire = (init) => { const e = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }); window.dispatchEvent(e); window.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, ...init })); return e.defaultPrevented; };
    return { f5: fire({ code: 'F5', key: 'F5' }), ctrlR: fire({ code: 'KeyR', key: 'r', ctrlKey: true }), up: fire({ code: 'ArrowUp', key: 'ArrowUp' }) }; });
  check('E1.browser-shortcuts-not-blocked', prevented.f5 === false && prevented.ctrlR === false && prevented.up === true, JSON.stringify(prevented));
  // E2: pagehide / visibilitychange (not just blur) release a held turn key.
  for (const [id, ev] of [['E2a.pagehide-releases-keys', "window.dispatchEvent(new Event('pagehide'))"],
                          ['E2b.hidden-releases-keys', "Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange'))"]]) {
    await page.keyboard.down('ArrowLeft'); await sleep(500);
    const h1 = await shot('edge-held'); await sleep(300); const h2 = await shot('edge-held-b');
    const pre = diffFrac(h1, h2, VIEW) > 0.02;
    const an0 = await pos(); // rev 7: engine-state oracle (angle) alongside the pixel oracle; angle only checked when a player exists
    await page.evaluate(ev); const st = await settle(); await sleep(500); const h3 = await shot('edge-after');
    const an1 = await pos(); await sleep(700); const an2 = await pos();
    const angOk = !an1 || !an2 || an1.angle === an2.angle; const angTurned = !!an0 && !!an1 && an0.angle !== an1.angle; // angTurned: held key really turned the view before release
    check(id, pre && st.settled && diffFrac(st.frame, h3, VIEW) < 0.02 && angOk, `precondition-turning=${pre} settled=${st.settled} later-diff=${diffFrac(st.frame, h3, VIEW).toFixed(4)} engine-angle-stable-after-release=${angOk} (player=${!!an1}, turned-before-release=${angTurned})`);
    await page.evaluate(() => { delete document.hidden; }); await page.keyboard.up('ArrowLeft'); await sleep(500);
  }
  // E3: after blur with the key still physically held, the browser auto-repeats keydown; it must act as a fresh press.
  await page.keyboard.down('ArrowRight'); await sleep(300);
  await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await settle();
  const rb = await shot('refocus-before'); await page.keyboard.down('ArrowRight'); await sleep(500); const ra = await shot('refocus-after');
  check('E3.repeat-after-blur-is-fresh-press', diffFrac(rb, ra, VIEW) > 0.02, `diff=${diffFrac(rb, ra, VIEW).toFixed(4)} (view must turn again)`);
  await page.keyboard.up('ArrowRight'); await settle();
  // E4: two physical keys on one Doom key (L+R Ctrl): still held until both released.
  await page.keyboard.down('ControlLeft'); await page.keyboard.down('ControlRight'); await page.keyboard.up('ControlLeft');
  const heldOne = await page.evaluate(() => window.CapInput ? window.CapInput.held().length : -1);
  await page.keyboard.up('ControlRight'); const heldNone = await page.evaluate(() => window.CapInput ? window.CapInput.held().length : -1);
  check('E4.dual-ctrl-held-until-both-up', heldOne === 1 && heldNone === 0, `held after one up=${heldOne}, after both=${heldNone} (JS state; engine side not observable)`);
  // I8: strong render module active (Module._rt only exists when render_timing.c is linked, not cap_fallback.c) and presenting.
  const rt0 = await page.evaluate(() => window.Module && window.Module._rt ? window.Module._rt.frames : null); await sleep(1000);
  const rt1 = await page.evaluate(() => window.Module && window.Module._rt ? window.Module._rt.frames : null);
  check('I8.render-module-active', rt0 !== null && rt1 !== null && rt1 > rt0, `Module._rt.frames ${rt0} -> ${rt1}`);

  // I9: the strong input module (input_audio.c) is linked and has delivered events to the engine (not the fallback queue).
  const inp = await page.evaluate(() => { const M = window.Module; return M && M._cap_input_impl ? { impl: M._cap_input_impl(), delivered: M._cap_input_delivered_count(), dropped: M._cap_input_dropped_count() } : null; });
  if (!inp) rec('I9.input-module-identity', 'FAIL', 'Module._cap_input_impl not exported');
  else check('I9.input-module-identity', inp.impl === 1 && inp.delivered > 0 && inp.dropped === 0, JSON.stringify(inp));
  // S1: canvas scales with the window: keeps 16:10, fits inside the viewport, is not collapsed. Restores viewport afterwards.
  const scaleBad = [];
  for (const [w, h] of [[1280, 720], [500, 300], [1000, 700], [800, 600]]) {
    await page.setViewportSize({ width: w, height: h }); await sleep(400);
    const r = await page.evaluate(() => { const b = document.getElementById('canvas').getBoundingClientRect(); return { w: b.width, h: b.height, x: b.left, y: b.top }; });
    const aspect = r.w / r.h;
    if (Math.abs(aspect - 1.6) > 0.03 || r.w > w + 1 || r.h > h + 1 || r.w < Math.min(w, h * 1.6) * 0.5) scaleBad.push(`${w}x${h}->${r.w.toFixed(0)}x${r.h.toFixed(0)}`);
  }
  await shot('scaled-800x600');
  check('S1.canvas-scales-16x10', scaleBad.length === 0, scaleBad.length ? `bad: ${scaleBad.join(', ')}` : 'viewports 1280x720, 500x300, 1000x700, 800x600 all 16:10 and fit');

  // A0/A2/A3 (new rev 4): machine-checkable audio facts. They do NOT establish correct sound (A1 stays UNVERIFIED: nobody listened).
  // Reviewer finding: headless Chromium can leave AudioContext.currentTime stalled, making peak assertions meaningless. So guard first:
  // a stalled clock is reported UNVERIFIED (environment), never PASS and never a fake product FAIL; a running clock makes peak mandatory.
  const au = await page.evaluate(async () => { const A = window.CapAudio; if (!A) return null; const c = A._ctx(); if (!c) return { state: 'none' };
    const t0 = c.currentTime; await new Promise((r) => setTimeout(r, 2000)); return { state: c.state, advanced: c.currentTime - t0, stats: A.stats() }; });
  if (!au || au.state === 'none') rec('A0.audio-context-created', 'FAIL', au ? 'CapAudio._ctx() null after user gestures' : 'window.CapAudio missing');
  else {
    check('A0.audio-context-created', au.state === 'running', `state=${au.state} after user gestures (suspended => autoplay resume broken)`);
    const S = au.stats; check('A2.sfx-played-no-errors', S.sfxPlayed > 0 && S.sfxBad === 0 && S.musicErrors === 0 && S.musicStarted > 0,
      `sfxPlayed=${S.sfxPlayed} sfxBad=${S.sfxBad} musicStarted=${S.musicStarted} musicErrors=${S.musicErrors} notes=${S.notesScheduled}`);
    if (au.advanced > 1.5) check('A3.audible-peak', S.maxPeak > 0.01, `audio clock advanced ${au.advanced.toFixed(2)}s/2s; maxPeak=${S.maxPeak.toFixed(3)} (non-silent only, not correct sound)`);
    else rec('A3.audible-peak', 'UNVERIFIED', `audio clock stalled (${au.advanced.toFixed(3)}s per 2s wall): peak assertion meaningless in this environment`);
  }

  // T2: engine tic rate via coder-exported cap_tic_count (contract v2). Missing export => UNVERIFIED, not PASS.
  const tc = async () => page.evaluate(() => (window.Module && window.Module._cap_tic_count) ? window.Module._cap_tic_count() : null);
  const ta = await tc(); const tms = Date.now(); await sleep(4000); const tb = await tc(); const rate = ((tb - ta) / ((Date.now() - tms) / 1000));
  if (ta === null || tb === null) rec('T2.35-tics-per-second', 'UNVERIFIED', 'Module._cap_tic_count not exported');
  else check('T2.35-tics-per-second', rate >= 31.5 && rate <= 38.5, `${rate.toFixed(2)} tics/s over 4s (need 35 +/-10%)`);

  // Soak (R6): scripted input for SOAK seconds; the page must stay alive with no errors/aborts.
  const keys = ['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'Control', 'Space', 'Shift'];
  let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const t1 = Date.now(), r2 = await page.evaluate(() => window.__raf); let moved = 0, last = await shot('soak-start');
  while (Date.now() - t1 < SOAK * 1000) {
    const k = keys[Math.floor(rnd() * keys.length)]; await key(k, 100 + Math.floor(rnd() * 600)); await sleep(100);
    if (Math.floor((Date.now() - t1) / 1000) % 20 === 0) { const s = await shot('soak'); if (diffFrac(last, s) > 0.005) moved++; last = s; }
  }
  const r3 = await page.evaluate(() => window.__raf), longMax = await page.evaluate(() => Math.max(0, ...window.__long));
  check('R1.soak-no-errors', !hasCrash() && errors.length === 0, `${SOAK}s; errors=${errors.slice(0, 3).join(' | ')}`);
  check('R2.soak-still-rendering', (r3 - r2) / SOAK >= 20 && stats(last).darkFrac < 0.95, `rAF/s=${((r3 - r2) / SOAK).toFixed(1)} visibleFrame=${stats(last).darkFrac < 0.95}`);
  check('R3.no-long-stalls', longMax < 1500, `max longtask=${longMax.toFixed(0)}ms (must be <1500)`);
  check('R4.soak-frames-changed', moved > 0, `sampled frames that differed: ${moved}`);

  // G3a (new rev 4): door via engine state. Fresh game (deterministic start), steer to the E1M1 sector-4 door at ~(1544,-2496)
  // using cap_player_x/y/angle and press Use (Space) while walking. PASS = sector 4 ceiling rose above its closed height (starts closed).
  // Recipe from reviewer_gameplay.WeHatJ (door5-use-results.json); its no-Use control opened nothing. Level exit stays UNVERIFIED.
  const gp = await (await browser.newContext({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 })).newPage();
  gp.on('pageerror', (e) => errors.push(`g3 pageerror: ${e.message}`));
  await gp.goto(url); await sleep(2500); for (let i = 0; i < 4; i++) { await gp.keyboard.press('Enter'); await sleep(900); } await sleep(3500);
  const GS = () => gp.evaluate(() => { const M = window.Module; return M && M._cap_player_valid && M._cap_player_valid() ? { x: M._cap_player_x(), y: M._cap_player_y(), a: M._cap_player_angle(), lvl: M._cap_level_id(), c4: M._cap_sector_ceiling(4), f4: M._cap_sector_floor(4), sec: M._cap_player_sector() } : null; });
  const g0 = await GS(); const TX = 1544, TY = -2496; let g = g0, opened = false, stuck = 0, gLast = null, its = 0;
  const doorUse = FAULT === 'drop-use' ? null : 'Space'; // drop-use fault: the Use key never reaches the game
  if (g0 && g0.lvl === 101) for (; its < 200 && !opened; its++) {
    g = await GS(); if (g.c4 > g.f4) { opened = true; break; }
    const ang = g.a / 2 ** 32 * 2 * Math.PI; let d = Math.atan2(TY - g.y, TX - g.x) - ang; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    if (gLast && Math.hypot(g.x - gLast[0], g.y - gLast[1]) < 8) stuck++; else stuck = 0; gLast = [g.x, g.y];
    if (stuck >= 2) { const k = its % 2 ? 'ArrowLeft' : 'ArrowRight'; await gp.keyboard.down(k); await sleep(300 + (its % 5) * 100); await gp.keyboard.up(k); await gp.keyboard.down('ArrowUp'); await sleep(700); await gp.keyboard.up('ArrowUp'); stuck = 0; continue; }
    if (Math.abs(d) > (Math.hypot(TX - g.x, TY - g.y) < 150 ? 0.04 : 0.12)) { const k = d > 0 ? 'ArrowLeft' : 'ArrowRight'; await gp.keyboard.down(k); await sleep(Math.min(500, 60 + Math.abs(d) * 220)); await gp.keyboard.up(k); await sleep(150); }
    await gp.keyboard.down('ArrowUp'); await sleep(350); if (doorUse) await gp.keyboard.press(doorUse); await sleep(100); await gp.keyboard.up('ArrowUp'); await sleep(100);
  }
  if (!opened && g0 && g0.lvl === 101) { await sleep(1500); g = await GS(); opened = !!g && g.c4 > g.f4; }
  await gp.screenshot({ path: path.join(OUT, 'screens', 'g3-final.png') }).catch(() => {});
  check('G3a.door-opens-on-use', !!g0 && g0.lvl === 101 && g0.c4 === g0.f4 && opened, g0 ? `start=(${g0.x},${g0.y}) closed-at-start=${g0.c4 === g0.f4} sector4 ceil ${g0.c4}->${g ? g.c4 : '?'} steps=${its} end=(${g ? g.x : '?'},${g ? g.y : '?'})` : 'no engine state in fresh game');

  // G3b (new rev 5): walk THROUGH the opened door. Engine state only: player must be seen inside sector 4, then in a sector that is
  // neither the start sector nor 4, within 12 s of holding Up (door stays open ~4 s, so this also needs a timely walk). Requires G3a's
  // opened door, so the drop-use fault fails it too. Level exit (E1M1 completion) stays UNVERIFIED: no route/oracle exists.
  const sec0 = g0 ? g0.sec : null; const seen = []; let through = false, inDoor = false;
  if (opened) {
    await gp.keyboard.down('ArrowUp');
    for (let t = 0; t < 400 && !through; t++) { // ~20 ms poll: the door sector is thin and the player runs ~400 u/s
      const s = await GS(); if (!s) break; if (seen[seen.length - 1] !== s.sec) seen.push(s.sec);
      if (s.sec === 4) inDoor = true; else if (inDoor && s.sec !== sec0) through = true;
      await sleep(20);
    }
    await gp.keyboard.up('ArrowUp');
  }
  await gp.screenshot({ path: path.join(OUT, 'screens', 'g3b-final.png') }).catch(() => {});
  check('G3b.walk-through-door', opened && inDoor && through, `door-opened=${opened} entered-sector-4=${inDoor} reached-beyond=${through} start-sector=${sec0} sector-sequence=[${seen.join('>')}]`);
  // G3c (new rev 7): normal level exit. Fresh game; route from reviewer_gameplay exit_pickup (E1M1 exit switch, linedef 330 at x~2912,
  // y -4800..-4736, faced at 180 deg). Travel uses Doom 1 noclip (cheat IDSPISPOPD) ONLY to reach the exit room; noclip is switched off
  // before Use so the switch itself is pressed through the normal Use path. PASS (engine state only) = level 101 valid -> player invalid
  // (intermission) -> after Use/Fire skips the tally, level 102 with a valid player who can move. Fault drop-use must fail it.
  const xp = await (await browser.newContext({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 })).newPage();
  xp.on('pageerror', (e) => errors.push(`g3c pageerror: ${e.message}`));
  const XS = () => xp.evaluate(() => { const M = window.Module; return M && M._cap_tic_count ? { v: M._cap_player_valid(), lvl: M._cap_level_id(), x: M._cap_player_x(), y: M._cap_player_y(), a: M._cap_player_angle() >>> 0 } : null; });
  const xkey = async (k, h = 100) => { await xp.keyboard.down(k); await sleep(h); await xp.keyboard.up(k); };
  const xtype = async (str) => { for (const ch of str) { await xkey(ch, 60); await sleep(60); } await sleep(400); };
  const normd = (d) => ((d + 540) % 360) - 180; const degOf = (a) => a / 4294967296 * 360;
  async function xface(target, tol) { for (let i = 0; i < 60; i++) { const s = await XS(); const e = normd(target - degOf(s.a)); if (Math.abs(e) <= tol) return s;
    await xkey(e > 0 ? 'ArrowLeft' : 'ArrowRight', Math.max(40, Math.min(400, Math.abs(e) * 8))); await sleep(250); } return XS(); }
  async function xgo(tx, ty, stop, maxSteps) { for (let i = 0; i < maxSteps; i++) { const s = await XS(); const dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy);
    if (d <= stop) return true; await xface(Math.atan2(dy, dx) * 180 / Math.PI, d < 150 ? 3 : 6);
    await xkey('ArrowUp', Math.max(40, Math.min(500, d * 2.5))); await sleep(d < 150 ? 700 : 150); } return false; }
  await xp.goto(url); await sleep(2500); await xp.click('#canvas').catch(() => {});
  await xkey('Enter'); await sleep(1200); for (let i = 0; i < 3; i++) { await xkey('Enter'); await sleep(900); } await sleep(5000);
  const x0 = await XS(); let reached = false, inter = null, nxt = null, xmoved = 0, x1 = null;
  if (x0 && x0.v === 1 && x0.lvl === 101) {
    await xtype('idspispopd'); reached = await xgo(2950, -4768, 12, 200); await xtype('idspispopd'); // noclip off again
    const f = await xface(180, 1.5); reached = reached && Math.abs(f.x - 2912) < 64;
    if (FAULT !== 'drop-use') await xkey('Space', 150); // drop-use fault: Use never reaches the game
    await sleep(2800); inter = await XS();
    for (let i = 0; i < 6 && !(nxt && nxt.v === 1); i++) { if (FAULT !== 'drop-use') await xkey('Space', 120); await sleep(1800); nxt = await XS(); }
    await sleep(2500); x1 = await XS(); await xkey('ArrowUp', 500); await sleep(1500); const x2 = await XS();
    xmoved = x1 && x2 ? Math.hypot(x2.x - x1.x, x2.y - x1.y) : 0;
  }
  await xp.screenshot({ path: path.join(OUT, 'screens', 'g3c-final.png') }).catch(() => {});
  check('G3c.level-exit', !!x0 && x0.lvl === 101 && reached && !!inter && inter.v === 0 && !!x1 && x1.v === 1 && x1.lvl === 102 && xmoved > 30,
    `start-level=${x0 ? x0.lvl : '?'} reached-switch=${reached} intermission(player invalid)=${inter ? inter.v === 0 : '?'} next-level=${x1 ? x1.lvl : '?'} xmoved-in-e1m2=${xmoved.toFixed(0)}`);
} catch (e) {
  rec('X.harness-exception', 'FAIL', String(e && e.stack || e).split('\n').slice(0, 3).join(' '));
}
for (const [id, why] of [['A1.audio', 'scope undecided; an active AudioContext would not prove correct sound/music'],
  ['P1.save-persistence', 'scope undecided'],
  ['H1.hidden-tab-timing', 'headless Chromium cannot throttle a real background tab; run the manual protocol in tests/README.md (H1)']]) rec(id, 'UNVERIFIED', why);
await page.screenshot({ path: path.join(OUT, 'screens', 'final-page.png') }).catch(() => {});
await browser.close().catch(() => {}); server.close();
finish();
