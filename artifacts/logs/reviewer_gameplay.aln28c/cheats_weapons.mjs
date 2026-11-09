// reviewer_gameplay WxVbWe: typed-letter input via vanilla cheats, weapon switching/firing beyond pistol, IDCLEV level change.
// Usage: node cheats_weapons.mjs <OUT_DIR> <PORT>
import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const require = createRequire(root + '/tests/package.json');
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const { diffFrac, AMMO } = await import(root + '/tests/lib/frames.mjs');
const [OUT, PORT] = process.argv.slice(2); const sleep = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT + '/screens', { recursive: true });
const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage(); const errs = [];
page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(`http://127.0.0.1:${PORT}/`); await sleep(4000);
const S = () => page.evaluate(() => ({ tic: Module._cap_tic_count(), lvl: Module._cap_level_id(), hp: Module._cap_player_health(), x: Module._cap_player_x(), y: Module._cap_player_y(), sfx: window.CapAudio.stats().sfxPlayed, mus: window.CapAudio.stats().musicStarted }));
const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
const type = async (s) => { for (const ch of s) { await key(ch, 60); await sleep(60); } };
const shot = async (nm) => { const buf = await page.locator('#canvas').screenshot(); fs.writeFileSync(`${OUT}/screens/cw-${nm}.png`, buf); return PNG.sync.read(buf); };
const res = []; const rec = (id, ok, d) => { res.push({ id, ok, d }); console.log(ok ? 'PASS' : 'FAIL', id, JSON.stringify(d)); };
await page.click('#canvas');
await key('Enter'); await sleep(1200); for (let i = 0; i < 3; i++) { await key('Enter'); await sleep(900); } await sleep(5000);
const s0 = await S(); rec('entered-e1m1', s0.lvl === 101, s0);
const pist = await shot('00-pistol');
await type('idkfa'); await sleep(500);
const kfa = await shot('01-after-idkfa');
rec('idkfa-changes-ammo-hud', diffFrac(pist, kfa, AMMO) > 0.01, { ammoDiff: diffFrac(pist, kfa, AMMO) });
// weapon switch: 3 = shotgun, 4 = chaingun; compare full frames (weapon sprite) and fire SFX
const weap = {};
for (const [k, nm] of [['3', 'shotgun'], ['4', 'chaingun'], ['5', 'rocket'], ['6', 'plasma']]) {
  await key(k); await sleep(900); const pre = await S(); const img = await shot(`02-${nm}`);
  await key('Control', 150); await sleep(900); const post = await S(); const after = await shot(`03-${nm}-fired`);
  weap[nm] = { sfxDelta: post.sfx - pre.sfx, ammoDiff: +diffFrac(img, after, AMMO).toFixed(4), hp: post.hp };
}
weap.frameDiffShotgunVsChaingun = +diffFrac(PNG.sync.read(fs.readFileSync(`${OUT}/screens/cw-02-shotgun.png`)), PNG.sync.read(fs.readFileSync(`${OUT}/screens/cw-02-chaingun.png`)), { x0: 0.3, y0: 0.5, x1: 0.7, y1: 0.86 }).toFixed(4);
for (const nm of ['shotgun', 'chaingun', 'rocket', 'plasma']) rec(`fire-${nm}-sfx-and-ammo`, weap[nm].sfxDelta > 0 && weap[nm].ammoDiff > 0.005, weap[nm]);
rec('weapon-sprite-changes', weap.frameDiffShotgunVsChaingun > 0.02, { diff: weap.frameDiffShotgunVsChaingun });
await type('iddqd'); await sleep(500); const god = await S(); await shot('04-iddqd'); rec('iddqd-accepted-alive', god.hp >= 100, { hp: god.hp });
const pre = await S(); await type('idclev13'); await sleep(6000); const lv = await S(); await shot('05-idclev13');
rec('idclev13-changes-level', lv.lvl !== pre.lvl && lv.lvl === 103, { from: pre.lvl, to: lv.lvl, musicStartedDelta: lv.mus - pre.mus });
rec('level-music-restarts-on-change', lv.mus > pre.mus, { pre: pre.mus, post: lv.mus });
const m0 = await S(); await key('ArrowUp', 600); await sleep(1500); const m1 = await S();
rec('movement-in-new-level', Math.hypot(m1.x - m0.x, m1.y - m0.y) > 40, { moved: Math.hypot(m1.x - m0.x, m1.y - m0.y) });
rec('no-page-errors', errs.length === 0, errs);
fs.writeFileSync(`${OUT}/cheats-weapons.json`, JSON.stringify({ res, weap }, null, 1));
console.log('SUMMARY pass=' + res.filter(r => r.ok).length + ' fail=' + res.filter(r => !r.ok).length);
await b.close();
