import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire('/Users/sarahtseng/Projects/fellowship-loop-capstone/tests/');
const { chromium } = require('playwright');
const dist = process.argv[2], out = process.argv[3];
const srv = http.createServer((q,r)=>{ let p=path.join(dist, q.url==='/'?'index.html':q.url.split('?')[0]);
 fs.readFile(p,(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':p.endsWith('.html')?'text/html':p.endsWith('.js')?'text/javascript':p.endsWith('.wasm')?'application/wasm':'application/octet-stream'}); r.end(d);});}).listen(0,'127.0.0.1');
await new Promise(r=>srv.once('listening',r)); const port=srv.address().port;
const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1280,height:720},deviceScaleFactor:+(process.argv[4]||1)});
const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
await pg.goto(`http://127.0.0.1:${port}/`);
await pg.waitForFunction(()=>Module._cap_ready&&Module._cap_ready()===1,null,{timeout:60000});
await pg.waitForTimeout(5000);
const css=()=>pg.evaluate(()=>{const c=document.getElementById('canvas').getBoundingClientRect();return [c.width,c.height]});
const res={};
for (const [w,h] of [[1280,720],[1280,800],[1920,1080],[640,400],[500,300],[1000,700]]) {
  await pg.setViewportSize({width:w,height:h}); await pg.waitForTimeout(200);
  res[`${w}x${h}`]=await css();
}
await pg.setViewportSize({width:1280,height:720}); await pg.waitForTimeout(200);
const s=()=>pg.evaluate(()=>({t:performance.now(),tic:Module._cap_tic_count(),fr:Module._rt.frames}));
const a=await s(); await pg.waitForTimeout(10000); const c=await s(); const dt=(c.t-a.t)/1000;
const px=await pg.evaluate(()=>{const cv=document.getElementById('canvas');const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let al=0,cols=new Set();for(let i=0;i<d.length;i+=4){if(d[i+3]!==255)al++;cols.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);}return {nonopaque:al,colors:cols.size,backing:[cv.width,cv.height]}});
await pg.screenshot({path:out});
console.log(JSON.stringify({res,tics_per_s:(c.tic-a.tic)/dt,presents_per_s:(c.fr-a.fr)/dt,...px,errs},null,1));
await b.close(); srv.close();
