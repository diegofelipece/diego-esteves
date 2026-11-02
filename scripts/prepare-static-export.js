import { cpSync, copyFileSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import { URL } from 'node:url';
import { readContent } from '../content/read.ts';

const clientDirectory = new URL('../build/client/', import.meta.url);
const outputDirectory = new URL('../out/', import.meta.url);
const basePath = process.env.SITE_BASE_PATH || '';

if (basePath && !/^\/[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(basePath)) {
  throw new Error('SITE_BASE_PATH must be empty or a single repository path such as /diego-esteves');
}
const { profile } = readContent();

rmSync(outputDirectory, { recursive: true, force: true });
cpSync(clientDirectory, outputDirectory, { recursive: true });

// React Router nests pre-rendered HTML under the basename; Pages mounts out/ there.
if (basePath) {
  const prefixedDirectory = new URL(`.${basePath}/`, outputDirectory);
  cpSync(prefixedDirectory, outputDirectory, { recursive: true });
  rmSync(prefixedDirectory, { recursive: true });
}

copyFileSync(new URL('404/index.html', outputDirectory), new URL('404.html', outputDirectory));
const fallback = new URL('__spa-fallback.html', outputDirectory);
if (existsSync(fallback)) rmSync(fallback);
writeFileSync(new URL('.nojekyll', outputDirectory), '');
writeFileSync(new URL('diego-esteves.json', outputDirectory), `${JSON.stringify(profile, null, 2)}\n`);
