// Minimal static server for the dev renderer. No dependencies on purpose.
// Serves the repo root so /web/index.html can import /dist/web/app.js.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const root = resolve(process.cwd());
const port = Number(process.env.PORT ?? 8137);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    const rel = urlPath === '/' ? '/web/index.html' : urlPath;
    const file = resolve(join(root, rel));
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end('forbidden');
      return;
    }
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(port, () => {
  console.log(`whatpointsto dev renderer: http://localhost:${port}/`);
});
