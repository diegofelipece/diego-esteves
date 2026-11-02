# Content management

Decap is a **local-only editor** for this static portfolio. No production admin,
OAuth service, SSO platform, database, or extra hosting is required.
`npm run build` exports only the public site; `/admin/` returns 404 on Pages.
Remote GitHub login is a possible future enhancement, not a release prerequisite.

## Files and fields

| File | Editable content |
| --- | --- |
| `content/projects/<slug>.json` | Metadata, cover, order, public inclusion, body blocks, links |
| `content/pages/about.json` | About title, SEO description, biography blocks |
| `content/settings/home.json` | Homepage metadata, logo, tagline, banner images, About excerpt |

`admin/config.ts` defines the editor fields. `content/schema.ts` and
`content/read.ts` validate all JSON and referenced images before every build.
The published catalog determines homepage order, progressive navigation, and
pre-rendered routes; creating a project requires no application-code changes.

Slugs use lowercase letters, digits, and single hyphens and must match JSON
filenames. Do not rename existing slugs/files; redirects are outside this scope.
Published projects sort by increasing nonnegative integer `order`, then slug.
Equal orders are allowed. The `published` toggle controls public inclusion only
after an approved PR merge and deployment. Withdrawn entries must still validate.

Body blocks support Markdown text, headings at levels 2/3/4, and images with
original pixel width/height and alternative text. Inline emphasis and links are
preserved. Raw HTML, JSX, and inline Markdown images are rejected; use image
blocks instead. Links must use absolute `https:`, `http:`, or `mailto:` URLs.
The supported `{{age}}` token preserves the existing calculated age.
Use descriptive alt text for meaningful images and empty alt text for decoration.

Media values use normalized `/images/...` paths, never deployment prefixes,
remote URLs, traversal, or escaped paths. Rendering adds `SITE_BASE_PATH`.
Existing images stay in place; new uploads go to `public/images/uploads/`.
Do not delete or move images referenced by any content, including withdrawn
projects. Changing banner images does not add layout or featured-project controls.

## Local editing and publishing

Use Node.js 24 (`nvm use`), install with `npm ci`, then run:

```sh
npm run dev
```

This runs the public site, CMS editor, and filesystem proxy in parallel with
labeled logs. Ctrl+C stops all three; if one exits, the others stop too.
Do not start duplicate services on the same ports. Individual commands are
`npm start`, `npm run cms:start`, and `npm run cms:local`.

1. Start a `feature/`, `fix/`, or `chore/` work branch from current `master`
   before editing. Follow GitHub Flow; do not edit and push directly to `master`.
2. Open `http://127.0.0.1:4175/admin/` and choose **Login**. This connects to the
   local filesystem proxy, not GitHub. Edit entries and upload through image fields.
3. Use **Publish → Publish now** to save working-tree JSON and image files.
   Despite the label, this does not create Git commits, PRs, deployments, or
   releases. The standalone Media library also changes local files only; inspect
   all file changes and avoid deleting referenced assets.
4. Preview the public site at `http://localhost:5173/`, inspect `git diff`, and run
   `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, and
   `npm run test:e2e`. Commit content and uploaded images together using a semantic
   message, push the branch, and open a PR against `master`.
5. Wait for both CI builds and obtain the owner's explicit approval for that
   specific PR/current changes before merging. The merge deploys Pages
   automatically; creating tags or GitHub Releases needs separate version approval.

Keep the unauthenticated proxy on loopback. Do not expose it to a network or
enable its Git mode; filesystem mode intentionally leaves Git actions manual.
The editor refuses non-development/non-loopback startup and its Vite config
rejects production builds. No local-backend configuration is exported to Pages.
GitHub backend metadata in the config is used by Decap's local-backend adapter;
it does not enable remote GitHub authentication.

For prefix testing, run `SITE_BASE_PATH=/diego-esteves npm run dev` and open
the prefixed URLs. Previews reuse the safe body renderer, tolerate incomplete
draft blocks, and show the homepage About excerpt. They are not a full responsive
homepage/navigation preview; the local public site and build validation remain
authoritative. There are no hosted PR previews.

## Automated validation and rollback

`npm run test:cms` manages its own local editor/proxy and requires their ports
(4175/8081) to be unused. It loads existing media, creates a temporary project
with text/heading/image blocks, previews and saves an upload, and proves a new
static route is generated without code changes. Withdrawal removes the route
and homepage entry. Source fixtures are cleaned up, but `out/` changes: run
`npm run build` afterward to recreate the real artifact.

CI runs the local CMS test before its final build in both Pages path modes.
Artifact and HTTP tests confirm that no admin files are deployed and `/admin/`
returns 404. Invalid content fails validation without changing the existing
deployment. Repository required-check enforcement is still manual; see
[deployment approval and enforcement](deployment.md#github-enforcement).
Rollback uses an approved revert PR and a new Pages build, without DNS changes.

The Decap dependency tree reports 46 npm audit findings (1 low, 34 moderate,
11 high), including editor dependencies and local proxy tooling. Compatible
remediation does not clear them; no forced downgrades/overrides were applied.
Decap is not bundled into the deployed site, but these remain local-tooling risks,
not resolved vulnerabilities. Keep editing trusted repository content, keep the
proxy private, and review upstream fixes. Legacy transitive React peer/prop-type
warnings are present; local editor behavior is covered by browser tests.

## Future option: remote GitHub login / SSO

Revisit this only if editing from other devices becomes necessary. It is not
implemented or required for the current workflow. Keep the public site static.
The simplest candidate is a separately hosted Decap-compatible OAuth gateway
using an eligible free tier and provider-issued HTTPS hostname. Free plans have
terms/limits; review them before choosing a host. No provider is selected.

Auth.js supports GitHub login but is not a drop-in Decap provider: its application
session would need a custom bridge for Decap's GitHub-token popup protocol.
Prefer a compatible gateway over that extra maintenance for one editor.

A future implementation needs a separate reviewed PR covering:

- Provider selection and code review of state validation, safe cookies, explicit
  admin-origin allowlists, popup messaging, and intended editor/repository access.
- A GitHub OAuth app with secrets stored exclusively on the auth host, never in
  browser configuration, this repository, or Pages output.
- An explicitly designed public editor build and public OAuth-origin setting;
  no `CMS_OAUTH_URL` integration exists in the current build.
- Valid production HTTPS, dependency advisory assessment, login/logout/error
  tests, and an approved draft/image/content-PR-to-Pages validation cycle.
- GitHub branch protection and publishing/media behavior: standalone remote
  Media operations can commit directly to the backend branch. Collection
  `publish: false` is not a substitute for repository-level authorization.

Do not provision services, introduce credentials, enable remote publishing, or
relax merge/release approval gates merely because this future option is documented.
See [Decap OAuth providers](https://decapcms.org/docs/external-oauth-clients/) and
[Auth.js GitHub provider](https://authjs.dev/getting-started/providers/github).
