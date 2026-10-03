const { chromium } = await import(process.env.PW || 'playwright');
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
const [mode,...args]=process.argv.slice(2);
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1080,height:1920}});
const errs=[];page.on('pageerror',e=>errs.push(String(e)));page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
const F45=process.env.FMT=='45';
await page.goto('file://'+path.resolve('index.html')+(F45?'#45':''));
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(300);
if(errs.length)console.error('ERR',errs);
if(mode==='preview'){
  const dir=process.env.PD||'prev';fs.mkdirSync(dir,{recursive:true});
  for(const t of args){await page.evaluate(t=>seek(+t),t);await page.screenshot({path:`${dir}/p_${(+t).toFixed(2).padStart(5,'0')}.png`});}
}else{
  const [out,dur]=args;const fps=30,N=Math.round(+dur*fps);
  const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-',...(F45?['-vf','crop=1080:1350:0:225']:[]),'-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
  for(let i=0;i<N;i++){await page.evaluate(t=>seek(t),i/fps);const b=await page.screenshot({type:'jpeg',quality:93});if(!ff.stdin.write(b))await new Promise(r=>ff.stdin.once('drain',r));if(i%150==0)console.log('frame',i,'/',N);}
  ff.stdin.end();const code=await new Promise(r=>ff.on('close',r));
  if(code!==0){console.error(`ffmpeg exited with code ${code}`);process.exitCode=1;}
}
await browser.close();
