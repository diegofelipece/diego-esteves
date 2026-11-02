import type { Config } from '@react-router/dev/config';
import { readContent } from './content/read.ts';

const basePath = process.env.SITE_BASE_PATH || '';
const projectPaths = readContent().projects.map((project) => `/projects/${project.slug}/`);

export default {
  ssr: false,
  basename: `${basePath}/`,
  prerender: ['/', '/about/', '/404/', ...projectPaths],
} satisfies Config;
