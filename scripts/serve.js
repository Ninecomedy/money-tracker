import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const allowed = new Set(['index.html', 'identity.js', 'firebase-config.js']);
createServer(async (request, response) => {
  const name = new URL(request.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!allowed.has(name)) { response.writeHead(404).end(); return; }
  try {
    const content = await readFile(new URL('../' + name, import.meta.url));
    response.writeHead(200, {'Content-Type': name.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8', 'Cache-Control': 'no-store'}).end(content);
  } catch { response.writeHead(500).end(); }
}).listen(4173, '127.0.0.1', () => console.log('Money Tracker: http://127.0.0.1:4173'));
