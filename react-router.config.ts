import { readdirSync } from 'node:fs';
import type { Config } from '@react-router/dev/config';

const basePath = process.env.SITE_BASE_PATH || '';
const projectPaths = readdirSync(new URL('./projects/', import.meta.url))
  .filter((name) => name.endsWith('.tsx'))
  .map((name) => `/projects/${name.slice(0, -4)}/`);

export default {
  ssr: false,
  basename: basePath || '/',
  prerender: ['/', '/about/', '/404/', ...projectPaths].map((path) => `${basePath}${path}`),
} satisfies Config;
