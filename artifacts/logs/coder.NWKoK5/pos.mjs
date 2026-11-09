import { chromium } from '/Users/sarahtseng/Projects/fellowship-loop-capstone/tests/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root=process.argv[2];
const srv=http.createServer((q,r)=>{const f=path.join(root,q.url.split('?')[0]==='/'?'index.html':q.url.split('?')[0]);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();}else{r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':f.endsWith('.wasm')?'application/wasm':f.endsWith('.html')?'text/html':'application/octet-stream'});r.end(d);}});}).listen(0);
const port=srv.address().port;
const b=await chromium.launch(); const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
await p.goto(`http://127.0.0.1:${port}/`); await p.waitForFunction(()=>window.Module&&Module._cap_ready&&Module._cap_ready(),null,{timeout:60000});
const st=()=>p.evaluate(()=>({v:Module._cap_player_valid(),x:Module._cap_player_x(),y:Module._cap_player_y(),a:Module._cap_player_angle(),h:Module._cap_player_health(),l:Module._cap_level_id(),br:Module._cap_bridge_version()}));
const out={title:await st()};
await p.keyboard.press('Enter');for(let i=0;i<3;i++){await p.waitForTimeout(500);await p.keyboard.press('Enter');}
await p.waitForTimeout(3000); out.start=await st();
await p.keyboard.down('ArrowUp');await p.waitForTimeout(1100);await p.keyboard.up('ArrowUp');await p.waitForTimeout(3000);out.fwd=await st();
await p.keyboard.down('ArrowDown');await p.waitForTimeout(1100);await p.keyboard.up('ArrowDown');await p.waitForTimeout(3000);out.back=await st();
out.errs=errs; console.log(JSON.stringify(out,null,1)); await b.close(); srv.close();
