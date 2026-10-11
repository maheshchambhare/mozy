// Renders the Open Graph banners (src/og/variants.ts) to 1200 x 630 images with headless Chrome.
//   node scripts/og/render.mjs                       all variants as PNGs into docs/og/
//   npm run og:render                                the live banner (see package.json) as public/assets/og-banner.jpg
// Options: --out DIR, --name FILE (single variant), --format png|jpeg, --quality 1-100 (jpeg only).
// CHROME_PATH overrides the Chrome location. Fonts come from Google Fonts, as on the site.
import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
import { createElement as h } from 'react';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const option = name => { const index = argv.indexOf(`--${name}`); return index >= 0 ? argv[index + 1] : undefined; };
const outDir = resolve(option('out') ?? 'docs/og');
const fileName = option('name');
const format = option('format') ?? 'png';
const quality = Number(option('quality') ?? 88);
if (!['png', 'jpeg'].includes(format)) throw new Error(`--format must be png or jpeg, not "${format}"`);
const wanted = argv.filter((arg, index) => !arg.startsWith('--') && !['--out', '--name', '--format', '--quality'].includes(argv[index - 1]));
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FONTS = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Caveat:wght@600;700&family=Fredoka:wght@500;600;700&family=Nunito:wght@500;600;700;800&display=block';
const WIDTH = 1200;
const HEIGHT = 630;
const sleep = ms => new Promise(done => setTimeout(done, ms));

async function startChrome() {
  const profile = await mkdtemp(join(tmpdir(), 'mozy-og-'));
  const port = 9600 + Math.floor(Math.random() * 300);
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--mute-audio', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, `--window-size=${WIDTH},${HEIGHT}`, 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let attempt = 0; attempt < 80 && !targets?.length; attempt += 1) {
    try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch { await sleep(150); }
  }
  if (!targets?.length) throw new Error(`Chrome did not start (${CHROME}). Set CHROME_PATH.`);
  const socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((done, fail) => { socket.onopen = done; socket.onerror = fail; });
  let id = 0;
  const pending = new Map();
  socket.onmessage = event => { const message = JSON.parse(event.data); if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); } };
  const send = (method, params = {}) => new Promise(done => { id += 1; pending.set(id, done); socket.send(JSON.stringify({ id, method, params })); });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
  const close = async () => { socket.close(); chrome.kill('SIGKILL'); await sleep(200); await rm(profile, { recursive: true, force: true }).catch(() => {}); };
  return { send, close };
}

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' });
const work = await mkdtemp(join(tmpdir(), 'mozy-og-html-'));
let browser;
try {
  const { OG_VARIANTS } = await server.ssrLoadModule('/src/og/variants.ts');
  const keys = wanted.length ? wanted : Object.keys(OG_VARIANTS);
  for (const key of keys) if (!OG_VARIANTS[key]) throw new Error(`Unknown variant "${key}". Choose from: ${Object.keys(OG_VARIANTS).join(', ')}`);
  const css = (await Promise.all(['src/story.css', 'src/story-world.css', 'src/og/og.css'].map(file => readFile(file, 'utf8')))).join('\n');
  const base = pathToFileURL(resolve('public')).href + '/';
  await mkdir(outDir, { recursive: true });
  browser = await startChrome();
  for (const key of keys) {
    const body = renderToString(h(OG_VARIANTS[key].component));
    const page = join(work, `og-${key}.html`);
    // <base> points at public/, so the banners' relative image paths (assets/icon.png) resolve.
    await writeFile(page, `<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="${base}"><link rel="stylesheet" href="${FONTS}"><style>${css}</style></head><body>${body}</body></html>`);
    await browser.send('Page.navigate', { url: pathToFileURL(page).href });
    // Wait until the web fonts are in, so the PNG never shows fallback type.
    const ready = await browser.send('Runtime.evaluate', {
      expression: `(async () => {
        const fonts = ['700 40px Fredoka', '800 40px "Baloo 2"', '600 20px Nunito', '800 20px Nunito', '700 30px Caveat'];
        for (let i = 0; i < 150; i += 1) {
          await Promise.all(fonts.map(font => document.fonts.load(font).catch(() => [])));
          await document.fonts.ready;
          if (fonts.every(font => document.fonts.check(font))) return true;
          await new Promise(r => setTimeout(r, 100));
        }
        return false;
      })()`,
      awaitPromise: true, returnByValue: true,
    });
    if (!ready.result?.result?.value) console.warn(`warning: web fonts did not load for ${key}; the PNG uses fallback fonts`);
    // Images (the app icon, store badges) must be decoded before the shot.
    await browser.send('Runtime.evaluate', { expression: `Promise.all([...document.images].map(img => img.complete ? 0 : new Promise(r => { img.onload = img.onerror = r; })))`, awaitPromise: true });
    await sleep(250);
    const shot = await browser.send('Page.captureScreenshot', { format, ...(format === 'jpeg' ? { quality } : {}), clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 } });
    const target = join(outDir, `${fileName && keys.length === 1 ? fileName : `og-${key}`}.${format === 'jpeg' ? 'jpg' : 'png'}`);
    await writeFile(target, Buffer.from(shot.result.data, 'base64'));
    console.log(`${key} (${OG_VARIANTS[key].name}) -> ${target}`);
  }
} finally {
  await browser?.close();
  await rm(work, { recursive: true, force: true }).catch(() => {});
  await server.close();
}
