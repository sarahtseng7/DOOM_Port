import { createRequire } from 'module';
import { spawn } from 'child_process';
const require = createRequire(process.cwd() + '/tests/');
const { chromium } = require('playwright');
const srv = spawn('python3', ['-m','http.server','8765','--bind','127.0.0.1','--directory','dist'], {stdio:'ignore'});
await new Promise(r=>setTimeout(r,800));
const b = await chromium.launch(); const p = await b.newPage(); const errs=[];
p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://127.0.0.1:8765/');
await p.waitForFunction(()=>window.Module&&Module._cap_ready&&Module._cap_ready(),null,{timeout:30000});
await p.keyboard.press('Enter'); await p.waitForTimeout(500);
for (let i=0;i<8;i++){ await p.keyboard.press('Enter'); await p.waitForTimeout(400); }
await p.waitForFunction(()=>Module._cap_player_valid(),null,{timeout:30000}).catch(()=>{});
const r = await p.evaluate(()=>{const M=Module,n=M._cap_sector_count(),s=M._cap_player_sector();
 return {ver:M._cap_bridge_version(),valid:M._cap_player_valid(),n,s,floor:M._cap_sector_floor(s),ceil:M._cap_sector_ceiling(s),oob:M._cap_sector_ceiling(99999),level:M._cap_level_id()}});
console.log(JSON.stringify({r,errs}));
await b.close(); srv.kill();
