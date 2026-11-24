import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp' };
const port = Number(process.env.PORT || 4173);

createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/\/+$/, '') || '/index.html';
    const extension = extname(path) || '.html';
    const file = resolve(root, '.' + path + (extname(path) ? '' : extension));
    if (!file.startsWith(root + sep) || !types[extension]) throw new Error('Unknown path');
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extension] + '; charset=utf-8' });
    response.end(body);
  } catch {
    const body = await readFile(resolve(root, '404.html')).catch(() => 'Run npm run build first.');
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(body);
  }
}).listen(port, () => console.log('Preview at http://localhost:' + port));
