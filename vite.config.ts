import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const basePath = process.env.SITE_BASE_PATH || '';

export default defineConfig({
  base: `${basePath}/`,
  plugins: [svgr(), reactRouter()],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import'],
      },
    },
  },
});
