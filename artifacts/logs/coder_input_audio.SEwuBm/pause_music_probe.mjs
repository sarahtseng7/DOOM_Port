import { chromium } from '/Users/sarahtseng/Projects/fellowship-loop-capstone/tests/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
await p.goto('http://127.0.0.1:8211/'); await p.waitForTimeout(2500);
await p.mouse.click(600, 300); await p.waitForTimeout(300);
for (const k of ['Escape','Enter','Enter','Enter']) { await p.keyboard.press(k,{delay:80}); await p.waitForTimeout(400); }
await p.waitForTimeout(2500);
const st = () => p.evaluate(() => ({ playing: CapAudio.musicPlaying(), ctx: CapAudio._ctx().state, stats: CapAudio.stats(), tic: (window.Module&&Module._cap_tic?Module._cap_tic():null) }));
const out = {};
out.before = await st();
await p.keyboard.press('Pause', { delay: 80 }); await p.waitForTimeout(600);
out.pausedState = await st();
await p.keyboard.press('Pause', { delay: 80 }); await p.waitForTimeout(600);
out.resumed = await st();
const sm=o=>({playing:o.playing,musicVoices:o.stats.musicVoices,notes:o.stats.notesScheduled,tic:o.tic});
console.log(JSON.stringify({before:sm(out.before),paused:sm(out.pausedState),resumed:sm(out.resumed)},null,1));
await b.close();
