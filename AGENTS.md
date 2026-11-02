# Repository instructions

- Write all documentation and code comments in English.
- Keep the existing portfolio introduction in `README.md`; do not move project/deployment documentation into it.
- Put topic-based human- and AI-readable project documentation in `docs/`. Update or add a focused file there when documenting project behavior or operations.
- Reserve `AGENTS.md` for repository instructions that guide AI coding agents.
- Use semantic commits (for example, `feat: add project preview` or `fix: correct asset paths`).
- Name work branches `feature/<name>`, `fix/<name>`, or `chore/<name>`.
- Use GitHub Flow: branch from `master`, open a pull request back to `master`, and do not use a `develop` branch.
- This is a Next.js 12 portfolio exported as a static site. Run `npm run lint` and `npm run build` when changing the site.
- `npm run build` exports the site to `out/`, including the root `404.html` and `.nojekyll` required for GitHub Pages; Pages serves files without Apache rewrite rules.
- Use `sitePath()` from `utils/sitePath.ts` for public assets and browser-history URLs so both the GitHub Pages preview path and the production domain root work.
- Pull requests to `master` build and validate the site without publishing it; only pushes to `master` deploy to GitHub Pages.
- Derive the Pages base path from the repository name until the `PAGES_CUSTOM_DOMAIN` Actions variable is set to `diegoesteves.ink`; only then use root-relative production URLs and add `CNAME`.
- Never add hosting credentials or change DNS records as part of a code change. Verify the production deployment before the domain cutover.
