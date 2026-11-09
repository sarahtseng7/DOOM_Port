import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire('/Users/sarahtseng/Projects/fellowship-loop-capstone/tests/');
const { chromium } = require('playwright');
const dist = process.argv[2], out = process.argv[3];
const srv = http.createServer((q,r)=>{ let p=path.join(dist, q.url==='/'?'index.html':q.url.split('?')[0]);
 fs.readFile(p,(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':p.endsWith('.html')?'text/html':p.endsWith('.js')?'text/javascript':p.endsWith('.wasm')?'application/wasm':'application/octet-stream'}); r.end(d);});}).listen(0,'127.0.0.1');
await new Promise(r=>srv.once('listening',r)); const port=srv.address().port;
const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1280,height:720}});
await pg.goto(`http://127.0.0.1:${port}/`);
await pg.waitForFunction(()=>Module._rt&&Module._rt.frames>0,null,{timeout:60000});
const t0=Date.now();
for (const s of [0,1,3,6,10]) {
  while ((Date.now()-t0)/1000 < s) await pg.waitForTimeout(50);
  const st=await pg.evaluate(()=>({tic:Module._cap_tic_count(),px:Module._cap_player_x?Module._cap_player_x():null,fr:Module._rt.frames}));
  console.log(s, JSON.stringify(st));
  await pg.screenshot({path:`${out}/startup-${s}s.png`});
}
await b.close(); srv.close();
