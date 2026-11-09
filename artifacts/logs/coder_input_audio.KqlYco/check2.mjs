import { chromium } from '/Users/sarahtseng/Projects/fellowship-loop-capstone/tests/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root=process.argv[2];
const types={'.html':'text/html','.js':'text/javascript','.wasm':'application/wasm'};
const srv=http.createServer((q,r)=>{const f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0);
const port=srv.address().port;
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:800,height:600}});
const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
await p.goto(`http://127.0.0.1:${port}/`); await p.waitForTimeout(4000);
const pre=await p.evaluate(()=>CapAudio.stats());
await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
for(let i=0;i<3;i++){await p.keyboard.press('Enter');await p.waitForTimeout(600)}
await p.waitForTimeout(3000);
await p.keyboard.down('Control');await p.waitForTimeout(400);await p.keyboard.up('Control');await p.waitForTimeout(1000);
let post; for(let i=0;i<10;i++){await p.waitForTimeout(500);post=await p.evaluate(()=>CapAudio.stats());if(post.maxPeak>0)break}
console.log(JSON.stringify({pre,post,errs},null,1));
await b.close(); srv.close();
