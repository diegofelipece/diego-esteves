# Content management

The portfolio is still a static site. Decap edits repository files; it is not a
public-site API or runtime dependency. Public pages work without the CMS, GitHub
API, or OAuth service. The editor is a separate bundle at `/admin/` (or
`/<repository-name>/admin/` for repository-prefix deployments).

## Status and activation gates

The content model, isolated editor, local editing, previews, uploads, and static
generation are implemented. Production login is **not configured**: the owner
must choose and provision a separate OAuth host and register a GitHub OAuth app.
No hosting service, credentials, DNS, or repository protection has been changed.
Production authentication and a real draft-PR-to-Pages cycle remain unverified
until that setup and an explicitly approved implementation merge.

The pinned Decap dependency tree currently reports 46 npm audit findings
(1 low, 34 moderate, 11 high), including upstream Markdown/auth dependencies
and local proxy tooling. Compatible `npm audit fix` does not clear them; suggested
forced fixes include package downgrades and are not applied. The production-only
npm dependency audit excludes Decap because it is a build dependency, **not**
because the bundled editor is free of advisories. Review these advisories and
upstream fixes before enabling production CMS access. Legacy transitive React
peer/prop-type warnings are also present; local and built editor behavior is
covered by browser tests.

## Files and fields

| File | Editable content |
| --- | --- |
| `content/projects/<slug>.json` | Project metadata, cover, ordering, public inclusion, body blocks, external links |
| `content/pages/about.json` | About title, SEO description, biography blocks |
| `content/settings/home.json` | Homepage metadata, logo text, tagline, banner images, About excerpt and portrait |

`admin/config.ts` defines the Decap collections; `content/schema.ts` and
`content/read.ts` validate saved files and media before every build.
`projects/_index.ts` is an adapter, not a manually maintained project list.

A project slug uses lowercase letters, digits, and single hyphens and must match
its JSON filename. Set it when creating a project; do not rename existing
slugs/files. Redirects and URL migrations are outside the editor's scope.
Published projects sort by increasing nonnegative integer `order`, then slug.
Equal orders are allowed. The `published` toggle controls public inclusion only
after a PR is merged and deployed; an unpublished draft branch is never served.
All JSON, including withdrawn projects, must still be valid.

Body blocks support Markdown text, headings at levels 2/3/4, and images with
original pixel width/height and alternative text. Inline emphasis and links are
preserved. Raw HTML, JSX, and inline Markdown images are rejected; use image
blocks instead. Links must use absolute `https:`, `http:`, or `mailto:` URLs.
The supported `{{age}}` token preserves the existing calculated age.
Use descriptive alt text for meaningful images and empty alt text for decoration.

Media values use normalized `/images/...` paths, never deployment prefixes,
remote URLs, traversal, or escaped paths. Rendering adds `SITE_BASE_PATH`.
Existing images remain where they are; new uploads go to
`public/images/uploads/` and are referenced as `/images/uploads/<filename>`.
Do not delete or move media still referenced by any content file.
Changing banner images does not add layout or featured-project controls.

## Local editing

Use Node.js 24 (`nvm use`) and `npm ci`. Start all three local services together:

```sh
npm run dev
```

This runs the public site, CMS editor, and filesystem proxy in parallel with
labeled logs. Ctrl+C stops all three; if one exits, the others stop too.
Do not also start duplicate services on the same ports.
For individual services, use separate terminals:

```sh
npm run cms:local
npm run cms:start
npm start
```

Open `http://127.0.0.1:4175/admin/` and choose **Login**. This local login uses the
filesystem proxy, not GitHub OAuth. The proxy defaults to filesystem mode:
the local **Publish now** action writes working-tree JSON and image files; it
does not merge a GitHub PR, create a release, or deploy anything.
Review the diff, validate, and commit on a work branch as usual.
Do not start this proxy with Git mode or expose its unauthenticated API to a
network. Keep the editor and proxy loopback-only and stop both when finished.
Production builds never emit `local_backend`.

For prefix testing, run `SITE_BASE_PATH=/diego-esteves npm run dev`;
open the correspondingly prefixed admin URL.
`npm run test:cms` manages its own editor/proxy and requires their ports
(4175/8081) to be unused. It creates a named fixture, saves an uploaded image,
checks preview rendering, builds its new route, then verifies withdrawal removes
the route/listing. It cleans up source fixtures but changes `out/`; run
`npm run build` afterward to regenerate the real artifact.

Previews reuse the safe body renderer and show the homepage About excerpt.
They tolerate incomplete draft blocks but are not a full responsive homepage,
navigation, or animation preview. Build validation remains authoritative.
There are no hosted PR previews; inspect the local site or generated artifact.

## GitHub editorial workflow

After OAuth is configured, login requires a GitHub account with write access to
`diegofelipece/diego-esteves`. Projects use a folder collection; About and homepage
settings use fixed files. Save changes as editorial drafts. Decap creates
`cms/...` branches/content PRs against `master`, using semantic commit messages.
These generated branches are the only exception to the usual work-branch names.

All collections use `publish: false`: production editor publishing is disabled.
Review the content PR on GitHub, wait for both build checks, and obtain the
owner's explicit approval for that specific PR/current changes before merging.
The `published` field is not a bypass for this workflow. A successful approved
merge triggers the existing Pages build/deployment, not a versioned release.
Tags and GitHub Releases always need separate explicit version approval.

**Upload through an image field while editing a draft entry.** Those images are
staged with the entry. Do not upload or delete through the standalone top-level
**Media** library: upstream Decap can commit those operations directly to the
backend branch, bypassing content PRs. `publish: false` is a collection UI policy,
not GitHub branch protection. The owner account can also bypass workflow outside
the editor; see [deployment approval and enforcement](deployment.md#github-enforcement).
Do not enable unattended CMS publishing or auto-merge.

Malformed content fails the PR/build validation and does not change the
previously deployed Pages artifact. GitHub required checks are not yet enforced
by branch protection; the approval/check policy must be followed manually until
the owner configures an appropriate separate identity and protection scheme.

## OAuth setup checklist

GitHub Pages cannot exchange an OAuth client secret. Host a Decap-compatible
OAuth service separately. The owner must select the provider before provisioning;
no provider is assumed or automatically deployed here. Decap lists community
implementations in its [external OAuth clients documentation](https://decapcms.org/docs/external-oauth-clients/).
Compare maintenance, hosting cost, callback support, secret storage, and the
implementation's actual authentication code; a linked project is not a security
endorsement.

1. Select the host and maintained implementation. Verify HTTPS, unpredictable
   state validation, safe cookies, explicit admin-origin allowlists, and a
   restrictive popup/postMessage callback flow before deploying it.
2. Register a GitHub OAuth app with the selected service's documented callback
   URL. Keep the client secret only in that service's secret store, never in this
   repository, Pages output, browser config, or a public Actions variable.
3. Configure exact permitted admin origins for the production domain and any
   intended GitHub Pages origin. Origins do not include `/admin/` or repository
   paths. Confirm that only the intended editor can obtain the required
   repository permissions; the CMS config alone is not authorization.
4. Verify the provider's endpoints match Decap's GitHub backend protocol. Set
   public repository Actions variable `CMS_OAUTH_URL` to its HTTPS **origin**
   (no credentials, path, query, or fragment), then rebuild. Configuration uses
   that origin as `backend.base_url`; no secret is bundled.
5. Test login, logout, denial/error behavior, and callback origin/state handling
   for root and repository-prefix admin URLs. Resolve or explicitly assess the
   upstream dependency advisories before production activation.
6. With explicit merge approval, deploy the implementation. Exercise a
   controlled draft, entry-scoped upload, PR checks, separately approved content
   merge, and resulting live HTML/media. Remove test content through another
   approved PR. Only after deployment verification request separate release
   version approval.

An OAuth outage affects editing, not the public site. To disable new production
logins, remove `CMS_OAUTH_URL` and rebuild through the approved workflow; revoke
issued tokens/client credentials on GitHub or the OAuth service when needed.
Removing the variable does not invalidate already issued credentials.
Rollback uses a reviewed revert PR and a new Pages build, without DNS changes.
