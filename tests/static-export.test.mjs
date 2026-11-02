import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { once } from 'node:events';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { URL } from 'node:url';
import { test } from 'node:test';
import { staticServer } from './static-server.mjs';

const { fetch } = globalThis;
const basePath = process.env.SITE_BASE_PATH || '';
const output = new URL('../out/', import.meta.url);
const projectFiles = (await readdir(new URL('../content/projects/', import.meta.url)))
  .filter((name) => name.endsWith('.json'));
const projects = await Promise.all(projectFiles.map(async (name) =>
  JSON.parse(await readFile(new URL(`../content/projects/${name}`, import.meta.url), 'utf8'))));
const paths = ['/', '/about/', ...projects.filter((project) => project.published).map((project) => `/projects/${project.slug}/`)];

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
  const profile = await fetch(`${origin}/diego-esteves.json`);
  assert.equal(profile.status, 200);
  assert.match(profile.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await profile.json(), JSON.parse(await readFile(new URL('../content/profile/diego-esteves.json', import.meta.url), 'utf8')));
});

test('static HTML advertises the profile and never leaves a stale birthday suffix', async () => {
  for (const path of ['index.html', 'about/index.html']) {
    const html = await readFile(new URL(path, output), 'utf8');
    assert.ok(html.includes(`type="application/json" title="Professional profile" href="${basePath}/diego-esteves.json"`));
    assert.ok(!html.includes('(today'));
    assert.match(html, /\d+(?:<!-- -->)? years old/);
  }
});

test('invalid export prefixes are rejected before existing output is changed', async () => {
  const before = await readFile(new URL('index.html', output), 'utf8');
  const result = spawnSync(process.execPath, ['scripts/prepare-static-export.js'], {
    env: { ...process.env, SITE_BASE_PATH: '/../outside' },
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /SITE_BASE_PATH must be empty or a single repository path/);
  assert.equal(await readFile(new URL('index.html', output), 'utf8'), before);
});

test('local CMS files are absent from the production artifact', async () => {
  await assert.rejects(access(new URL('admin/', output)), { code: 'ENOENT' });
  const homepage = await readFile(new URL('index.html', output), 'utf8');
  assert.ok(!homepage.includes('/admin/assets/'));
});
