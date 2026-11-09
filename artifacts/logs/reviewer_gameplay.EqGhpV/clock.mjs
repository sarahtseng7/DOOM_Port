import { createRequire } from 'node:module';
const require = createRequire('/Users/sarahtseng/Projects/fellowship-loop-capstone/tests/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch(); const page = await b.newPage();
await page.goto('http://127.0.0.1:8138/'); await page.keyboard.press('Enter');
const r = await page.evaluate(async () => {
  const c = new AudioContext(); await c.resume();
  const o = c.createOscillator(), a = c.createAnalyser(); o.connect(a); a.connect(c.destination); o.start();
  const t0 = c.currentTime; await new Promise(r => setTimeout(r, 2000));
  const buf = new Float32Array(a.fftSize); a.getFloatTimeDomainData(buf);
  return { state: c.state, dt: c.currentTime - t0, peak: Math.max(...buf.map(Math.abs)) };
});
console.log(JSON.stringify(r)); await b.close();
