// reviewer_gameplay.F2duYo: gameplay/audio review using read-only engine-state hooks (bridge v5).
// Usage: node review_state.mjs <OUT_DIR> <PORT>
import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const require = createRequire(root + '/tests/package.json');
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const { diffFrac, AMMO } = await import(root + '/tests/lib/frames.mjs');
const OUT = process.argv[2]; const PORT = process.argv[3] || '8191';
fs.mkdirSync(OUT + '/screens', { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const res = []; const rec = (id, ok, d) => { res.push({ id, ok, d }); console.log(ok ? 'PASS' : 'FAIL', id, typeof d === 'string' ? d : JSON.stringify(d)); };
const note = (id, d) => { res.push({ id, ok: null, d }); console.log('NOTE', id, typeof d === 'string' ? d : JSON.stringify(d)); };

const b = await chromium.launch(); // no autoplay-policy flag
const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(`http://127.0.0.1:${PORT}/`); await sleep(4000);
let n = 0; const shot = async (nm) => { const buf = await page.locator('#canvas').screenshot(); fs.writeFileSync(`${OUT}/screens/${String(++n).padStart(2,'0')}-${nm}.png`, buf); return PNG.sync.read(buf); };
const A = () => page.evaluate(() => window.CapAudio.stats());
const S = () => page.evaluate(() => { const M = Module; return { tic: M._cap_tic_count(), valid: M._cap_player_valid(), x: M._cap_player_x(), y: M._cap_player_y(), ang: M._cap_player_angle() >>> 0, hp: M._cap_player_health(), lvl: M._cap_level_id(), sec: M._cap_player_sector() }; });
const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
const dist = (a, b2) => Math.hypot(b2.x - a.x, b2.y - a.y);
const angDeg = (a, b2) => { let d = ((b2.ang - a.ang) >>> 0) / 2 ** 32 * 360; if (d > 180) d -= 360; return +d.toFixed(2); };
// sample state every ~30ms for ms; returns array
const trace = async (ms) => { const t = []; const end = Date.now() + ms; while (Date.now() < end) { t.push(await S()); await sleep(25); } return t; };
// returns tics after release until position stops changing for good
const settle = (tr, f) => { let last = 0; for (let i = 1; i < tr.length; i++) if (f(tr[i - 1], tr[i])) last = i; return { stopTic: tr[last].tic - tr[0].tic, idx: last }; };

const pre = await A();
await key('Enter'); await sleep(1500);
const post = await A();
rec('A.ctx-running-after-gesture', pre.ctxState !== 'running' && post.ctxState === 'running', `before=${pre.ctxState} after=${post.ctxState}`);
rec('A.title-music-nonsilent', post.musicStarted > 0 && post.maxPeak > 0.01, `musicStarted=${post.musicStarted} maxPeak=${post.maxPeak}`);

// Menu navigation sound: the first Enter opened the main menu. Arrow down should play a menu SFX.
const mn0 = await A(); await key('ArrowDown'); await sleep(300); await key('ArrowUp'); await sleep(300); const mn1 = await A();
rec('A.menu-nav-sfx', mn1.sfxPlayed - mn0.sfxPlayed >= 2, `sfxPlayed ${mn0.sfxPlayed}->${mn1.sfxPlayed} (2 cursor moves)`);

// New game -> episode -> skill (default HMP)
for (let i = 0; i < 2; i++) { await key('Enter'); await sleep(900); } await key('Enter'); await sleep(6000);
let s = await S(); await shot('level');
rec('G.level-entered-E1M1', s.valid === 1 && s.lvl === 101 && s.hp === 100, s);
const a1 = await A(); rec('A.level-music-switched', a1.musicStarted >= 2 && a1.musicPlaying, { musicStarted: a1.musicStarted, playing: a1.musicPlaying });

// Tic rate
const t0 = await S(); await sleep(3000); const t1 = await S(); rec('T.tic-rate', Math.abs((t1.tic - t0.tic) / 3 - 35) < 3.5, `${((t1.tic - t0.tic) / 3).toFixed(1)} tics/s`);

// Idle: no drift without input
const i0 = await S(); await sleep(1000); const i1 = await S(); rec('M.idle-no-drift', dist(i0, i1) === 0 && angDeg(i0, i1) === 0, { d: dist(i0, i1), dAng: angDeg(i0, i1) });

// Forward walk 500 ms, then coast. Doom friction ~0.906/tic: expect decay and stop within ~35 tics.
const f0 = await S(); await page.keyboard.down('ArrowUp'); await sleep(500); const fr = await S(); await page.keyboard.up('ArrowUp');
const ct = await trace(2000); const fEnd = ct[ct.length - 1];
const coast = dist(fr, fEnd); const walk = dist(f0, fr);
const st1 = settle(ct, (a, c) => dist(a, c) > 0);
const steps = []; for (let i = 1; i < Math.min(ct.length, 14); i++) steps.push(+dist(ct[i - 1], ct[i]).toFixed(1));
rec('M.forward-moves', walk > 20 && angDeg(f0, fr) === 0, { walkUnits: +walk.toFixed(1), ticks: fr.tic - f0.tic });
rec('M.forward-coasts-then-stops', coast > 0 && coast < walk && st1.stopTic <= 55 && dist(ct[st1.idx], fEnd) === 0, { coastUnits: +coast.toFixed(1), stoppedAfterTics: st1.stopTic, stepsPerSample: steps.join(' ') });
// Direction check: forward should move along facing
const fa = (f0.ang / 2 ** 32) * 2 * Math.PI; const dot = ((fEnd.x - f0.x) * Math.cos(fa) + (fEnd.y - f0.y) * Math.sin(fa)) / Math.max(1, dist(f0, fEnd));
rec('M.forward-along-facing', dot > 0.95, { cosToFacing: +dot.toFixed(3) });

// Backward
const bk0 = await S(); await key('ArrowDown', 400); await sleep(1500); const bk1 = await S();
const dotb = ((bk1.x - bk0.x) * Math.cos(fa) + (bk1.y - bk0.y) * Math.sin(fa)) / Math.max(1, dist(bk0, bk1));
rec('M.backward-opposite-facing', dist(bk0, bk1) > 10 && dotb < -0.95, { units: +dist(bk0, bk1).toFixed(1), cosToFacing: +dotb.toFixed(3) });

// Turn right / left: Doom turning has no momentum; angle must stop within a few tics of release.
const turnTest = async (k, sign) => {
  const a0 = await S(); await page.keyboard.down(k); await sleep(400); const ar = await S(); await page.keyboard.up(k);
  const tr = await trace(800); const last = tr[tr.length - 1];
  const stt = settle(tr, (a, c) => a.ang !== c.ang);
  const d = angDeg(a0, ar); const after = angDeg(ar, last);
  rec(`M.turn-${k}`, sign * d > 10 && dist(a0, last) === 0, { degWhileHeld: d, ticksHeld: ar.tic - a0.tic, moved: dist(a0, last) });
  rec(`M.turn-${k}-stops-on-release`, stt.stopTic <= 3 && Math.abs(after) < 15, { degAfterRelease: after, lastChangeTicAfterRelease: stt.stopTic });
};
await turnTest('ArrowRight', -1); // BAM angle decreases when turning right
await turnTest('ArrowLeft', +1);

// Strafe with Period (right) and Comma (left): perpendicular to facing
const strafe = async (k, label) => {
  const z0 = await S(); const za = (z0.ang / 2 ** 32) * 2 * Math.PI; await key(k, 400); await sleep(1500); const z1 = await S();
  const d = dist(z0, z1); const cosF = d ? ((z1.x - z0.x) * Math.cos(za) + (z1.y - z0.y) * Math.sin(za)) / d : 1;
  // right vector = (sin, -cos)
  const cosR = d ? ((z1.x - z0.x) * Math.sin(za) - (z1.y - z0.y) * Math.cos(za)) / d : 0;
  return { d: +d.toFixed(1), cosF: +cosF.toFixed(3), cosR: +cosR.toFixed(3), dAng: angDeg(z0, z1) };
};
const sr = await strafe('Period'); rec('M.strafe-right-period', sr.d > 10 && Math.abs(sr.cosF) < 0.2 && sr.cosR > 0.9 && sr.dAng === 0, sr);
const sl = await strafe('Comma'); rec('M.strafe-left-comma', sl.d > 10 && Math.abs(sl.cosF) < 0.2 && sl.cosR < -0.9 && sl.dAng === 0, sl);
// Alt + ArrowRight = strafe right
const al0 = await S(); const ala = (al0.ang / 2 ** 32) * 2 * Math.PI; await page.keyboard.down('AltLeft'); await key('ArrowRight', 400); await page.keyboard.up('AltLeft'); await sleep(1500); const al1 = await S();
const alR = ((al1.x - al0.x) * Math.sin(ala) - (al1.y - al0.y) * Math.cos(ala)) / Math.max(1, dist(al0, al1));
rec('M.alt-arrow-strafes', dist(al0, al1) > 10 && alR > 0.9 && angDeg(al0, al1) === 0, { d: +dist(al0, al1).toFixed(1), cosR: +alR.toFixed(3), dAng: angDeg(al0, al1) });

// Run vs walk: same hold time backward/forward, compare displacement over held window
const w0 = await S(); await page.keyboard.down('ArrowDown'); await sleep(300); const w1 = await S(); await page.keyboard.up('ArrowDown'); await sleep(1500);
const r0 = await S(); await page.keyboard.down('ShiftLeft'); await page.keyboard.down('ArrowUp'); await sleep(300); const r1 = await S(); await page.keyboard.up('ArrowUp'); await page.keyboard.up('ShiftLeft'); await sleep(1500);
const walkSp = dist(w0, w1) / Math.max(1, w1.tic - w0.tic), runSp = dist(r0, r1) / Math.max(1, r1.tic - r0.tic);
rec('M.shift-run-faster', runSp > walkSp * 1.5, { walkUnitsPerTic: +walkSp.toFixed(2), runUnitsPerTic: +runSp.toFixed(2) });

// Fire: ammo HUD change + SFX; held fire repeats
const aB = await A(); const p0 = await shot('fire-pre'); await key('ControlLeft', 150); await sleep(1200); const p1 = await shot('fire-post'); const aA = await A();
rec('C.fire-ammo-and-sfx', diffFrac(p0, p1, AMMO) > 0.02 && aA.sfxPlayed > aB.sfxPlayed, { ammoDiff: +diffFrac(p0, p1, AMMO).toFixed(3), sfx: `${aB.sfxPlayed}->${aA.sfxPlayed}` });
const h0 = await A(); await page.keyboard.down('ControlLeft'); await sleep(1500); await page.keyboard.up('ControlLeft'); await sleep(300); const h1 = await A(); await sleep(1200); const h2 = await A();
rec('C.held-fire-repeats-and-stops', h1.sfxPlayed - h0.sfxPlayed >= 3 && h2.sfxPlayed === h1.sfxPlayed, { during: h1.sfxPlayed - h0.sfxPlayed, after1200ms: h2.sfxPlayed - h1.sfxPlayed });

// Use at a wall with nothing to use: Doom plays "oof" (sfx_noway) when using a non-special wall up close.
// Walk forward into the wall we face until blocked, then Use.
for (let i = 0; i < 6; i++) { await key('ArrowUp', 400); }
await sleep(800); const u0 = await A(); const us = await S(); await key('Space', 120); await sleep(600); const u1 = await A();
note('C.use-sfx-at-wall', { sfxDelta: u1.sfxPlayed - u0.sfxPlayed, at: us });

// Menu pauses the world: hold forward, open menu while moving, measure tics/pos over 1.5 s
await page.keyboard.down('ArrowUp'); await sleep(200); await key('Escape'); await page.keyboard.up('ArrowUp'); await sleep(300);
const m0 = await S(); await shot('menu'); const ms0 = await A(); await sleep(1500); const m1 = await S();
rec('P.menu-pauses-world', dist(m0, m1) === 0 && angDeg(m0, m1) === 0, { dPos: dist(m0, m1), dTic: m1.tic - m0.tic });
const clk0 = await page.evaluate(() => window.CapAudio._ctx().currentTime); const wc = Date.now(); await sleep(2000); const clk1 = await page.evaluate(() => window.CapAudio._ctx().currentTime);
rec('A.audio-clock-advances', clk1 - clk0 > 1.5, `${(clk1 - clk0).toFixed(3)} s per ${((Date.now() - wc) / 1000).toFixed(3)} s wall`);
const mm = await A(); note('A.music-in-menu', { musicPlaying: mm.musicPlaying, voices: mm.musicVoices, lastPeak: mm.lastPeak });
// Menu: navigate to Options and back; SFX on navigation
await key('ArrowDown'); await sleep(250); const mz = await A(); rec('A.ingame-menu-nav-sfx', mz.sfxPlayed > ms0.sfxPlayed, `${ms0.sfxPlayed}->${mz.sfxPlayed}`);
await key('ArrowUp'); await sleep(250);
await key('Escape'); await sleep(600);
// No stuck key after menu: ArrowUp was released while menu was open
const k0 = await S(); await sleep(1200); const k1 = await S(); rec('F.no-stuck-key-after-menu', dist(k0, k1) === 0 && angDeg(k0, k1) === 0, { dPos: dist(k0, k1), dAng: angDeg(k0, k1), dTic: k1.tic - k0.tic });

// Focus loss: hold turn, then blur. Turn must stop (input reset) though key never released.
await page.keyboard.down('ArrowLeft'); await sleep(400); const fb0 = await S();
await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await sleep(200); const fb1 = await S(); await sleep(1000); const fb2 = await S();
rec('F.blur-stops-held-turn', angDeg(fb1, fb2) === 0, { degBlurLatency: angDeg(fb0, fb1), degAfterBlur1s: angDeg(fb1, fb2) });
await page.keyboard.up('ArrowLeft');
// After blur, a fresh press must work again
const fr0 = await S(); await key('ArrowLeft', 300); await sleep(300); const fr1 = await S();
rec('F.input-works-after-blur', angDeg(fr0, fr1) > 10, { deg: angDeg(fr0, fr1) });
// Blur while walking forward: movement stops (with Doom coast)
await page.keyboard.down('ArrowUp'); await sleep(300); await page.evaluate(() => window.dispatchEvent(new Event('blur'))); const bw0 = await S(); await sleep(1500); const bw1 = await S(); await sleep(800); const bw2 = await S();
await page.keyboard.up('ArrowUp');
rec('F.blur-stops-held-forward', dist(bw1, bw2) === 0, { coastAfterBlur: +dist(bw0, bw1).toFixed(1), movedLast800ms: dist(bw1, bw2) });

// Pause key
const pz0 = await S(); await key('Pause'); await sleep(1000); const pz1 = await S(); await key('Pause'); await sleep(800); const pz2 = await S(); await sleep(1000); const pz3 = await S();
rec('P.pause-key-toggles', dist(pz0, pz1) === 0 && angDeg(pz0, pz1) === 0 && pz3.tic - pz2.tic > 25, { ticsPaused1s: pz1.tic - pz0.tic, ticsResumed1s: pz3.tic - pz2.tic });

// Automap toggle (Tab) does not move player
const am0 = await S(); await key('Tab'); await sleep(800); await shot('automap'); await key('Tab'); await sleep(500); const am1 = await S();
rec('G.automap-toggle-no-move', dist(am0, am1) === 0, { dPos: dist(am0, am1) });

const fin = await A(); console.log('final audio', JSON.stringify(fin)); console.log('errors', JSON.stringify(errs));
rec('E.no-page-errors', errs.length === 0, errs);
rec('A.no-bad-sfx-or-music-errors', fin.sfxBad === 0 && (fin.musicErrors || 0) === 0, { sfxPlayed: fin.sfxPlayed, sfxRequested: fin.sfxRequested, sfxSuppressed: fin.sfxSuppressed, sfxBad: fin.sfxBad, musicErrors: fin.musicErrors, maxPeak: fin.maxPeak });
fs.writeFileSync(OUT + '/review-results.json', JSON.stringify({ res, pre, post, fin, errs }, null, 1));
await b.close();
const failed = res.filter(r => r.ok === false).length; console.log(`SUMMARY pass=${res.filter(r => r.ok).length} fail=${failed} note=${res.filter(r => r.ok === null).length}`);
