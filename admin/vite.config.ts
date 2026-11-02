import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { cmsConfig } from './config.ts';

export default defineConfig(({ command, mode }) => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const env = { ...loadEnv(mode, root, 'CMS_'), ...process.env };
  const basePath = process.env.SITE_BASE_PATH || '';
  const config = cmsConfig({
    basePath,
    repository: process.env.GITHUB_REPOSITORY || 'diegofelipece/diego-esteves',
    oauthUrl: env.CMS_OAUTH_URL || '',
    local: command === 'serve',
  });
  return {
    root: fileURLToPath(new URL('./', import.meta.url)),
    base: `${basePath}/admin/`,
    publicDir: command === 'serve' ? fileURLToPath(new URL('../public/', import.meta.url)) : false,
    define: { __CMS_LOCAL__: command === 'serve' },
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
      generateBundle() {
        // JSON is valid YAML and avoids maintaining a second serialization format.
        this.emitFile({ type: 'asset', fileName: 'config.yml', source: JSON.stringify(config, null, 2) });
      },
    }],
    server: { fs: { allow: [root] } },
    build: { outDir: fileURLToPath(new URL('../build/admin/', import.meta.url)), emptyOutDir: true },
  };
});
