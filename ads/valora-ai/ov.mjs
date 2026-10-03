// Renders the transparent text/UI layer to PNG frames.
// Usage: node ov.mjs <916|45> <outdir> [duration]
const { chromium } = await import(process.env.PW || 'playwright');
import path from 'path'; import fs from 'fs';
const [fmt, dir, dur = '23.5'] = process.argv.slice(2);
fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + path.resolve('index.html') + (fmt == '45' ? '#45' : ''));
await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(200);
const N = Math.round(+dur * 30);
for (let i = 0; i < N; i++) {
  await page.evaluate(t => seek(t), i / 30);
  await page.screenshot({ path: `${dir}/${String(i).padStart(5, '0')}.png`, omitBackground: true });
  if (i % 100 == 0) console.log(fmt, 'frame', i, '/', N);
}
await browser.close();
if (errs.length) { console.error('page errors:', errs); process.exitCode = 1; }
