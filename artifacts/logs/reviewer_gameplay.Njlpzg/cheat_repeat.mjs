// reviewer_gameplay xPaDae: does repeated IDCLIP entry toggle each time? Screenshot the HUD message after each,
// and measure whether walking into the start-room wall south of spawn is blocked (clip on) or not (clip off).
// Usage: node cheat_repeat.mjs <OUT_DIR> <PORT>
import { createRequire } from 'node:module'; import fs from 'node:fs';
const root = '/Users/sarahtseng/Projects/fellowship-loop-capstone';
const require = createRequire(root + '/tests/package.json');
const { chromium } = require('playwright');
const [OUT, PORT] = process.argv.slice(2); const sleep = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT + '/screens', { recursive: true });
const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage(); const errs = [];
page.on('pageerror', e => errs.push(e.message));
await page.goto(`http://127.0.0.1:${PORT}/`); await sleep(4000);
const S = () => page.evaluate(() => ({ x: Module._cap_player_x(), y: Module._cap_player_y(), lvl: Module._cap_level_id(), d: Module._cap_input_delivered_count(), dr: Module._cap_input_dropped_count() }));
const key = async (k, h = 100) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); };
const type = async (s, h, g) => { for (const ch of s) { await key(ch, h); await sleep(g); } };
await page.click('#canvas');
await key('Enter'); await sleep(1200); for (let i = 0; i < 3; i++) { await key('Enter'); await sleep(900); } await sleep(5000);
const out = [];
for (let i = 1; i <= 4; i++) {
  const a = await S(); await type('idclip', 60, 60); await sleep(150);
  fs.writeFileSync(`${OUT}/screens/cr-${i}.png`, await page.locator('#canvas').screenshot());
  const b0 = await S(); await key('ArrowDown', 700); await sleep(1200); const c = await S();
  const r = { i, deliveredDelta: b0.d - a.d, dropped: b0.dr, backedUp: +Math.hypot(c.x - b0.x, c.y - b0.y).toFixed(1), from: [b0.x, b0.y], to: [c.x, c.y] };
  out.push(r); console.log(JSON.stringify(r));
  await key('ArrowUp', 700); await sleep(1200);
}
fs.writeFileSync(`${OUT}/cheat-repeat.json`, JSON.stringify({ out, errs }, null, 1)); await b.close();
