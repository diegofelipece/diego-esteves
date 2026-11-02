# Deployment

The React portfolio uses Vite and React Router Framework Mode with `ssr: false`.
Every public route is pre-rendered at build time; there is no public-site runtime
server. `npm run build` generates the site and prepares the static Pages artifact
in `out/`, including directory-index HTML, route data, root `404.html`, and
`.nojekyll`. It does not depend on SPA rewrites or an Apache configuration.

`.github/workflows/pages.yml` validates root and repository-prefix builds on pull
requests to `master`, without publishing either. Only pushes to `master` deploy,
and only the artifact matching the custom-domain setting is uploaded. Both
validation builds must pass before the deploy job runs.

## Local development and validation

Use Node.js 22.22 or newer and install dependencies with `npm ci`.
`npm start` starts the Vite-based development server.

```sh
npm run lint
npm run typecheck
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

For repository-prefix validation, use the same prefix for build and tests:

```sh
SITE_BASE_PATH=/diego-esteves npm run build
SITE_BASE_PATH=/diego-esteves npm test
SITE_BASE_PATH=/diego-esteves npm run test:e2e
```

The browser tests start a local static server without SPA rewrites. To inspect
the current output manually, run `node tests/static-server.mjs` and open
`http://127.0.0.1:4173/`. For a prefixed build, set `SITE_BASE_PATH` on that
command too and open the prefixed URL. Stop the server after checking the site.

The static tests check route HTML, metadata, assets, fonts, and actual HTTP 404s.
Chromium tests cover desktop/mobile project order, expansion, progressive
scrolling, browser history, About navigation, media loading, and project content
with JavaScript disabled.

Project prose and metadata remain in `projects/*.tsx`; this release does not
introduce a CMS or convert the content model. The registry controls display order,
and pre-rendered project paths come from those filenames.

## GitHub Pages path

Until the repository Actions variable `PAGES_CUSTOM_DOMAIN` is set to
`diegoesteves.ink`, the build derives its base path from the repository name
(`/diego-esteves`) so the default project URL remains functional after a rename.
Once set, the build uses the custom-domain root and
adds its `CNAME` file.

`SITE_BASE_PATH` is the build-time setting shared by Vite, the router, static HTML,
asset URLs, and Sass font paths. Keep URLs passed to router navigation relative
to the configured basename; use `sitePath()` for public assets and raw browser
URLs. Canonical and social URLs use the production domain independently of the
preview path. The old `NEXT_PUBLIC_BASE_PATH` setting is no longer used.

## Releases and rollback

Use a work branch from `master`, a pull request back to `master`, and semantic
commits. A merge triggers validation and Pages deployment; a tag alone does not
deploy. Verify the deployed routes and interactions before recording the release.
Continue the existing unprefixed semantic-version tag convention (for example,
`1.7.0`) and keep the package version aligned.

Roll back using a revert pull request followed by the normal Pages deployment.
No DNS change is needed for an application rollback.

## Custom-domain cutover

Before cutover, the `diegoesteves.ink` apex currently points to DigitalOcean
(`178.62.53.48`). Keep this IP for rollback. Before changing DNS:

1. Add `diegoesteves.ink` as the custom domain in the repository's **Settings →
   Pages** and verify ownership in GitHub account settings if prompted.
2. Set the repository Actions variable `PAGES_CUSTOM_DOMAIN` to
   `diegoesteves.ink` and rerun the `master` deployment. Confirm it succeeds;
   this builds root-relative URLs and adds `CNAME` before the domain starts
   resolving to Pages.
3. In the DNS zone, replace the apex (`@`) A record with GitHub Pages' four A
   records:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
4. Remove conflicting apex A/AAAA and `www` records pointing to the old host.
   Do not change the zone's nameservers; keep the old IP recorded for rollback.
5. Optionally add GitHub Pages' AAAA records for IPv6:
   - `2606:50c0:8000::153`
   - `2606:50c0:8001::153`
   - `2606:50c0:8002::153`
   - `2606:50c0:8003::153`
6. Optionally point `www` to `diegofelipece.github.io` with a CNAME record.
7. Verify with `dig diegoesteves.ink A` and, if configured,
   `dig www.diegoesteves.ink CNAME`. DNS propagation can take up to 24 hours.
8. Verify the custom domain, then enable **Enforce HTTPS** in Pages when it
   becomes available. Do not retire the old host until the new domain works.
