import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const root = resolve(fileURLToPath(new URL('../out/', import.meta.url)));
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.data': 'text/x-script',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
};

export function staticServer(basePath = '') {
  return createServer(async (request, response) => {
    try {
      const { pathname } = new URL(request.url, 'http://localhost');
      if (basePath && !pathname.startsWith(`${basePath}/`)) throw new Error('Not found');
      const relativePath = decodeURIComponent(pathname.slice(basePath.length));
      let filename = resolve(root, `.${relativePath}`);
      if (filename !== root && !filename.startsWith(`${root}${sep}`)) throw new Error('Not found');
      if ((await stat(filename)).isDirectory()) {
        if (!pathname.endsWith('/')) {
          response.writeHead(301, { location: `${pathname}/` }).end();
          return;
        }
        filename = resolve(filename, 'index.html');
      }
      const content = await readFile(filename);
      response.writeHead(200, { 'content-type': types[extname(filename)] || 'application/octet-stream' });
      response.end(content);
    } catch {
      response.writeHead(404, { 'content-type': 'text/html' });
      response.end(await readFile(resolve(root, '404.html')));
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  staticServer(process.env.SITE_BASE_PATH || '').listen(Number(process.env.PORT || 4173), '127.0.0.1');
}
