import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/Users/sarahtseng/Projects/fellowship-loop-capstone/tests/package.json');
const { chromium } = require('playwright');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
await page.goto('http://127.0.0.1:8137/'); await sleep(3000);
const A = () => page.evaluate(() => window.CapAudio.stats());
const key = async (k, h = 80) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); await sleep(250); };
console.log('pre-gesture', JSON.stringify(await A()));
await key('Enter'); await sleep(1200); for (let i=0;i<2;i++){await key('Enter'); await sleep(700);} await key('Enter'); await sleep(5000);
await page.evaluate(()=>CapAudio.resetPeak());
const t0=Date.now(); const samples=[];
for(let i=0;i<8;i++){ await sleep(1000); const s=await A(); samples.push({t:Date.now()-t0,peak:s.maxPeak,notes:s.notesScheduled,ctx:s.ctxState||s.state}); }
console.log('idle samples', JSON.stringify(samples));
await page.keyboard.down('Control'); await sleep(200); await page.keyboard.up('Control'); await sleep(500);
console.log('after fire', JSON.stringify(await A()));
console.log('pageerrors', JSON.stringify(errs));
await b.close();
