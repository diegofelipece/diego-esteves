import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { once } from 'node:events';
import process from 'node:process';
import { URL } from 'node:url';
import { test } from 'node:test';
import { staticServer } from './static-server.mjs';

const { fetch } = globalThis;
const basePath = process.env.SITE_BASE_PATH || '';
const output = new URL('../out/', import.meta.url);
const projectFiles = (await readdir(new URL('../projects/', import.meta.url)))
  .filter((name) => name.endsWith('.tsx'));
const paths = ['/', '/about/', ...projectFiles.map((name) => `/projects/${name.slice(0, -4)}/`)];

test('every public route has meaningful HTML, one title, and route-specific canonical metadata', async () => {
  for (const path of paths) {
    const html = await readFile(new URL(`.${path}index.html`, output), 'utf8');
    assert.equal((html.match(/<title>/g) || []).length, 1, path);
    assert.ok(html.includes(`href="https://diegoesteves.ink${path}"`), path);
    assert.match(html, /<meta name="description" content="[^"]+"/);
    if (path.startsWith('/projects/')) {
      const slug = path.split('/')[2];
      assert.ok(html.includes(`data-project-slug="${slug}"`), path);
      assert.ok((html.match(/<p[ >]/g) || []).length > 2, `Missing project body: ${path}`);
      assert.match(html, /<img[^>]+width="\d+"[^>]+height="\d+"/);
    }
  }
});

test('all generated local asset references resolve under the configured Pages prefix', async () => {
  const html = await readFile(new URL('index.html', output), 'utf8');
  const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((path) => path.startsWith('/') && !path.endsWith('/'));
  assert.ok(assets.length > 3);
  for (const asset of assets) {
    assert.ok(asset.startsWith(`${basePath}/`), asset);
    assert.ok((await stat(new URL(`.${asset.slice(basePath.length)}`, output))).isFile(), asset);
  }
  const stylesheets = assets.filter((path) => path.endsWith('.css'));
  for (const stylesheet of stylesheets) {
    const css = await readFile(new URL(`.${stylesheet.slice(basePath.length)}`, output), 'utf8');
    for (const [, font] of css.matchAll(/url\((?:")?([^)" ]+\/fonts\/[^)"?#]+)[^)]*\)/g)) {
      assert.ok(font.startsWith(`${basePath}/fonts/`), font);
      assert.ok((await stat(new URL(`.${font.slice(basePath.length)}`, output))).isFile(), font);
    }
  }
});

test('a rewrite-free static server serves direct routes and a true 404 response', async (t) => {
  const server = staticServer(basePath).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const origin = `http://127.0.0.1:${server.address().port}${basePath}`;
  for (const path of paths) {
    assert.equal((await fetch(`${origin}${path}`)).status, 200, path);
  }
  const missing = await fetch(`${origin}/does-not-exist/`);
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /Page not found/);
  assert.equal(await readFile(new URL('.nojekyll', output), 'utf8'), '');
  assert.match(await readFile(new URL('404.html', output), 'utf8'), /noindex, nofollow/);
});
