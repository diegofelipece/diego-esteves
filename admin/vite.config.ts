import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { cmsConfig } from './config.ts';

export default defineConfig(({ command }) => {
  if (command !== 'serve') throw new Error('The CMS is local-only; use npm run cms:start.');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const basePath = process.env.SITE_BASE_PATH || '';
  const config = cmsConfig({
    basePath,
  });
  return {
    root: fileURLToPath(new URL('./', import.meta.url)),
    cacheDir: fileURLToPath(new URL('../node_modules/.vite-admin/', import.meta.url)),
    base: `${basePath}/admin/`,
    publicDir: fileURLToPath(new URL('../public/', import.meta.url)),
    plugins: [{
      name: 'cms-configuration',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (request.url?.split('?')[0] === `${basePath}/admin/config.yml`) {
            response.setHeader('content-type', 'text/yaml');
            response.end(JSON.stringify(config));
            return;
          }
          // Existing media keeps site-root URLs, outside the local editor's base.
          const assetPath = request.url?.startsWith(`${basePath}/`) ? request.url.slice(basePath.length) : request.url;
          if (assetPath?.startsWith('/images/') || assetPath?.startsWith('/fonts/')) {
            request.url = `${basePath}/admin${assetPath}`;
          }
          next();
        });
      },
    }],
    server: { fs: { allow: [root] } },
  };
});
