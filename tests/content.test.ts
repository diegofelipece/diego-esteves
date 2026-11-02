import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { blockSchema, projectSchema, publishedProjects } from '../content/schema.ts';
import { readContent } from '../content/read.ts';
import { cmsConfig } from '../admin/config.ts';

const root = new URL('../', import.meta.url);
const original = JSON.parse(readFileSync(new URL('content/projects/mussum-ipsum.json', root), 'utf8'));

test('one catalog filters withdrawn projects and sorts order ties deterministically', () => {
  const input = [
    { ...original, slug: 'z-last', order: 2 },
    { ...original, slug: 'withdrawn', order: 0, published: false },
    { ...original, slug: 'a-first', order: 2 },
    { ...original, slug: 'earlier', order: 1 },
  ];
  assert.deepEqual(publishedProjects(input).map(({ slug }) => slug), ['earlier', 'a-first', 'z-last']);
});

test('content rejects raw HTML, inline images, unsafe links, traversal and malformed image blocks', () => {
  for (const body of [
    '<script>alert(1)</script>', '[bad](javascript:alert%281%29)',
    '[bad][ref]\n\n[ref]: data:text/html,no', '![inline](/images/self.jpg)',
  ]) {
    assert.equal(blockSchema.safeParse({ type: 'text', body }).success, false, body);
  }
  for (const src of ['/images/../outside.png', '//images/self.jpg', '/images/%2e%2e/test.png', '/images/test.png?x=1']) {
    assert.equal(projectSchema.safeParse({ ...original, coverImage: src }).success, false, src);
  }
  assert.equal(blockSchema.safeParse({ type: 'image', src: '/images/self.jpg', width: 0, height: 10 }).success, false);
  assert.ok(blockSchema.safeParse({ type: 'text', body: 'Emphasis *works*. [Mail](mailto:hello@example.com) and {{age}}.' }).success);
});

test('new JSON entries join the catalog without imports; filenames and missing media fail validation', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'portfolio-content-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  cpSync(new URL('content/', root), join(directory, 'content'), { recursive: true });
  symlinkSync(new URL('public/', root), join(directory, 'public'));
  const fixtureRoot = pathToFileURL(`${directory}/`);
  const file = join(directory, 'content/projects/fixture-project.json');
  const fixture = { ...original, slug: 'fixture-project', title: 'Fixture project', order: 0 };
  writeFileSync(file, JSON.stringify(fixture));
  assert.equal(readContent(fixtureRoot).projects[0].slug, 'fixture-project');
  writeFileSync(file, JSON.stringify({ ...fixture, published: false }));
  assert.ok(!readContent(fixtureRoot).projects.some(({ slug }) => slug === fixture.slug));
  writeFileSync(file, JSON.stringify({ ...fixture, slug: 'changed-url' }));
  assert.throws(() => readContent(fixtureRoot), /slug must match filename/);
  writeFileSync(file, JSON.stringify({ ...fixture, coverImage: '/images/missing-fixture.png' }));
  assert.throws(() => readContent(fixtureRoot), /Missing content image/);
});

test('CMS uses draft-only GitHub workflow and local editing is opt-in', () => {
  const config = cmsConfig({ basePath: '/renamed-repository', oauthUrl: 'https://oauth.example.com' });
  assert.equal(config.backend.repo, 'diegofelipece/diego-esteves');
  assert.equal(config.backend.branch, 'master');
  assert.equal(config.publish_mode, 'editorial_workflow');
  assert.ok(!('local_backend' in config));
  assert.ok(config.collections.every((collection) => collection.publish === false));
  assert.equal(config.public_folder, '/images/uploads');
  assert.ok('local_backend' in cmsConfig({ local: true }));
  for (const oauthUrl of ['http://oauth.example.com', 'https://oauth.example.com/callback', 'https://user:pass@oauth.example.com']) {
    assert.throws(() => cmsConfig({ oauthUrl }), /CMS_OAUTH_URL/);
  }
});
