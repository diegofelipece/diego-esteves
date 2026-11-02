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

Use Node.js 24 (`nvm use`) and install dependencies with `npm ci`.
`npm start` starts only the Vite-based public development server.
`npm run dev` starts the public site, CMS editor, and local CMS proxy together
with labeled logs. Ctrl+C stops all three; if one exits, the others stop too.

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

Project prose and metadata live in validated `content/projects/*.json`.
The same published catalog determines homepage order, progressive navigation,
and pre-rendered routes. `npm run build` validates all content and referenced
images before exporting the site. See [content management](content-management.md)
for the model, local editor, media, manual content PRs, and future remote login.

Decap is local-only: the production build neither bundles nor exports the editor
or its configuration. `/admin/` returns 404 on Pages. Local editing writes files
to the working tree; review, validation, commits, and PRs remain manual.
No OAuth host, SSO, credentials, or `CMS_OAUTH_URL` variable is required or wired
into the current build. Remote login is documented only as a future option.

CI also runs `npm run test:cms` before the final build in both base-path modes.
This starts loopback-only local editing services, creates a temporary project and
uploaded image, checks the preview, and proves that publication/withdrawal
changes the generated HTML without application-code edits. Fixtures are removed,
and the final build recreates the deployable artifact from real content.

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
deploy.

### Required user approval

Never merge a pull request without the user's explicit approval for that specific
PR and its current changes. Permission to plan, implement, commit, push a work
branch, or open a PR is not permission to merge. Passing CI is not approval.
Leave the PR open until approval is given; do not enable auto-merge, enqueue a
merge, or bypass this gate through a direct push to `master`.

Never automatically release. Creating or pushing a release tag, publishing a
GitHub Release, or triggering a release requires separate explicit user approval
for the version being released. Merge approval does not grant release approval.
Verify the deployed routes and interactions before requesting release approval.
Continue the existing unprefixed semantic-version tag convention (for example,
`1.7.0`) and keep the package version aligned.

The existing Pages deployment after an approved merge remains automatic; this is
distinct from creating a version tag or publishing a GitHub Release.

Roll back using a revert pull request followed by the normal Pages deployment.
The same approval gate applies to merging a rollback PR. No DNS change is needed
for an application rollback.

### GitHub enforcement

GitHub branch protection or an active branch ruleset can require PRs, approving
reviews, resolved conversations, and both `build (root)` and
`build (repository)` checks before changes reach `master`. Dismiss stale
approvals, block force pushes/deletion, and apply protections to administrators
without an agent bypass if configuring this policy.

There is an important identity limitation: the local `gh` session currently uses
the owner's account, and the owner is the only repository collaborator. GitHub
cannot distinguish an assistant command from the owner acting manually with the
same credentials. A PR author also cannot approve their own PR. Requiring an
approving review now could therefore block the owner's own PRs without providing
a reliable human-versus-agent approval boundary.

For enforceable separation, use a distinct GitHub App or automation identity for
agent-authored PRs, require the owner's review (for example through CODEOWNERS
and required code-owner reviews), and remove agent bypass permissions. Restrict
the automation credential's ability to merge, administer repository rules, or
publish releases where the chosen permission model supports it. A tag ruleset
can restrict creation of release tags to an authorized human identity; tag
protection alone does not prevent publishing a GitHub Release for an existing
tag, so release/API permissions must also be considered.

At the time this policy was documented, `master` had no branch protection or
rulesets, and repository auto-merge was already disabled. No GitHub permissions
or protection settings were changed as part of this documentation update.
Choose the separate identity and reviewer arrangement before enabling a required
review policy that could lock out the sole maintainer.

See GitHub's [protected branch documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

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
