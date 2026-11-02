import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { cmsConfig } from './config';

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
    publicDir: false,
    define: { __CMS_LOCAL__: command === 'serve' },
    plugins: [{
      name: 'cms-configuration',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (request.url?.split('?')[0] !== `${basePath}/admin/config.yml`) return next();
          response.setHeader('content-type', 'text/yaml');
          response.end(JSON.stringify(config));
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
