// reviewer_gameplay K8HORm: damage (self rocket splash), pain/death SFX, death state, input while dead, respawn via Use.
// run2: walk forward into the wall before each shot (run1 showed knockback moved the player out of splash range).
// run3: respawn music check corrected: vanilla S_ChangeMusic (s_sound.c:625) skips restarting the same track, so expect continuous playback, not a restart.
// Usage: node damage_death.mjs <OUT_DIR> <PORT>
import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const require = createRequire(root + '/tests/package.json');
const { chromium } = require('playwright');
const [OUT, PORT] = process.argv.slice(2); const sleep = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT + '/screens', { recursive: true });
const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage(); const errs = [];
page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(`http://127.0.0.1:${PORT}/`); await sleep(4000);
const S = () => page.evaluate(() => ({ tic: Module._cap_tic_count(), valid: Module._cap_player_valid(), lvl: Module._cap_level_id(), hp: Module._cap_player_health(), x: Module._cap_player_x(), y: Module._cap_player_y(), ang: Module._cap_player_angle() >>> 0, sfx: window.CapAudio.stats().sfxPlayed, sfxReq: window.CapAudio.stats().sfxRequested, sfxBad: window.CapAudio.stats().sfxBad, mus: window.CapAudio.stats().musicStarted }));
const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
const type = async (s) => { for (const ch of s) { await key(ch, 60); await sleep(60); } };
const shot = async (nm) => fs.writeFileSync(`${OUT}/screens/dd-${nm}.png`, await page.locator('#canvas').screenshot());
const res = []; const rec = (id, ok, d) => { res.push({ id, ok, d }); console.log(ok ? 'PASS' : 'FAIL', id, JSON.stringify(d)); };
const deg = a => +(a / 2 ** 32 * 360).toFixed(1);
await page.click('#canvas');
await key('Enter'); await sleep(1200); for (let i = 0; i < 3; i++) { await key('Enter'); await sleep(900); } await sleep(5000);
const s0 = await S(); rec('entered-e1m1', s0.lvl === 101 && s0.hp === 100, s0);
await type('idkfa'); await sleep(400); await key('5'); await sleep(900);
// back up against the south wall, then turn to face it (~270 deg)
await key('ArrowDown', 1200); await sleep(1500);
await page.keyboard.down('ArrowLeft'); for (let i = 0; i < 200; i++) { const a = deg((await S()).ang); if (a > 255 && a < 290) break; await sleep(15); } await page.keyboard.up('ArrowLeft'); await sleep(400);
const f0 = await S(); await shot('00-facing-wall'); console.log('facing', deg(f0.ang), f0.x, f0.y);
const hpTrace = [f0.hp]; let firstHit = null, dead = null;
for (let i = 0; i < 12 && !dead; i++) {
  await key('ArrowUp', 900); await sleep(1200);
  const pre = await S(); await key('Control', 120); await sleep(1300); const post = await S(); hpTrace.push(post.hp); console.log('shot', i, 'hp', pre.hp, '->', post.hp, 'pos', pre.x, pre.y, '->', post.x, post.y);
  if (!firstHit && post.hp < pre.hp) { firstHit = { pre: pre.hp, post: post.hp, sfxDelta: post.sfx - pre.sfx }; await shot('01-hurt'); }
  if (post.hp <= 0) dead = post;
}
rec('rocket-splash-damages-player', !!firstHit && firstHit.post < firstHit.pre, { firstHit, hpTrace });
rec('damage-plays-sfx', !!firstHit && firstHit.sfxDelta >= 2, { note: 'launch + explosion/pain expected', firstHit });
rec('player-dies-at-zero-hp', !!dead && dead.hp <= 0, { dead, hpTrace });
if (dead) {
  await sleep(1500); await shot('02-dead');
  const d0 = await S(); await key('ArrowUp', 600); await key('ArrowLeft', 400); await sleep(800); const d1 = await S();
  rec('no-movement-while-dead', Math.hypot(d1.x - d0.x, d1.y - d0.y) === 0 && d1.ang === d0.ang && d1.hp <= 0, { moved: Math.hypot(d1.x - d0.x, d1.y - d0.y), dAng: d1.ang - d0.ang, hp: d1.hp });
  const r0 = await S(); await key(' ', 150); await sleep(4000); const r1 = await S(); await shot('03-respawned');
  rec('use-respawns-level-restart', r1.lvl === 101 && r1.hp === 100 && r1.x === s0.x && r1.y === s0.y, { before: r0, after: r1 });
  const ms = await page.evaluate(() => window.CapAudio.stats()); rec('music-continues-on-respawn', ms.musicPlaying === true && ms.musicErrors === 0, { musicStartedPre: r0.mus, musicStartedPost: r1.mus, musicPlaying: ms.musicPlaying, musicErrors: ms.musicErrors, lastPeak: ms.lastPeak });
  const m0 = await S(); await key('ArrowUp', 500); await sleep(1200); const m1 = await S();
  rec('movement-after-respawn', Math.hypot(m1.x - m0.x, m1.y - m0.y) > 20, { moved: Math.hypot(m1.x - m0.x, m1.y - m0.y) });
}
const fin = await S(); rec('audio-counters-clean', fin.sfxReq === fin.sfx && fin.sfxBad === 0, { sfxRequested: fin.sfxReq, sfxPlayed: fin.sfx, sfxBad: fin.sfxBad });
rec('no-page-errors', errs.length === 0, errs);
fs.writeFileSync(`${OUT}/damage-death.json`, JSON.stringify({ res }, null, 1));
console.log('SUMMARY pass=' + res.filter(r => r.ok).length + ' fail=' + res.filter(r => !r.ok).length);
await b.close();
