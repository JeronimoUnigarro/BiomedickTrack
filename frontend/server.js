import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT || 8080);
const root = join(process.cwd(), 'dist');

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0] || '/');
  const safePath = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(root, safePath);

  if (existsSync(filePath) && statSync(filePath).isFile()) {
    return filePath;
  }

  return join(root, 'index.html');
}

createServer((req, res) => {
  const filePath = resolvePath(req.url || '/');
  const contentType = types[extname(filePath)] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(res);
}).listen(port, '0.0.0.0', () => {
  console.log(`Frontend listening on ${port}`);
});
