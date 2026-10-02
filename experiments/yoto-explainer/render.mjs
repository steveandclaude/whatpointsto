// Frames: scene.html driven by headless Chromium -> PNGs -> ffmpeg (+ build/mix.wav) -> MP4.
//   node render.mjs                 full render to yoto-explainer.mp4
//   node render.mjs --stills 3,12.5 just those timestamps -> build/still_<t>.png
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright');
const HERE = dirname(fileURLToPath(import.meta.url));
const BUILD = join(HERE, 'build');
const FPS = 30;
const tl = JSON.parse(readFileSync(join(BUILD, 'timeline.json')));
const cue = JSON.parse(readFileSync(join(BUILD, 'cues.json')));
const OUT = tl.draft ? 'yoto-explainer-draft.mp4' : 'yoto-explainer.mp4';

const args = process.argv.slice(2);
const stills = args[0] === '--stills' ? args[1].split(',').map(Number) : null;
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });

async function worker(times, out) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.addInitScript(() => { window.__RENDER__ = true; });
  await page.goto(pathToFileURL(join(HERE, 'scene.html')).href);
  await page.evaluate(async ([a, b]) => { await document.fonts.load('700 40px Fredoka'); await document.fonts.load('600 40px Fredoka'); await document.fonts.load('500 40px Fredoka'); await document.fonts.ready; window.setData(a, b); }, [tl, cue]);
  for (const [t, file] of times.map((t, i) => [t, out(t, i)])) {
    const data = await page.evaluate(t => { window.draw(t); return document.getElementById('c').toDataURL('image/png'); }, t);
    writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
  }
}

if (stills) {
  await worker(stills, t => join(BUILD, `still_${t}.png`));
} else {
  const frames = Math.ceil(cue.total * FPS);
  const dir = join(BUILD, 'frames'); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const N = 4, all = [...Array(frames).keys()];
  const t0 = Date.now();
  await Promise.all([...Array(N).keys()].map(w => {
    const mine = all.filter(f => f % N === w);
    return worker(mine.map(f => f / FPS), t => join(dir, `f${String(Math.round(t * FPS)).padStart(5, '0')}.png`));
  }));
  console.log(`${frames} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(dir, 'f%05d.png'),
    '-i', join(BUILD, 'mix.wav'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-tune', 'animation',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', join(HERE, OUT)], { stdio: 'inherit' });
  console.log('wrote ' + OUT);
}
await browser.close();
