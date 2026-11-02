import { cpSync, copyFileSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import { URL } from 'node:url';

const clientDirectory = new URL('../build/client/', import.meta.url);
const outputDirectory = new URL('../out/', import.meta.url);
const basePath = process.env.SITE_BASE_PATH || '';

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
