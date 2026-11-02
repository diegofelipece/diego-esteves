# Deployment

The site is exported to static files in `out/` and deployed to GitHub Pages by
`.github/workflows/pages.yml`. Pull requests to `master` validate the static
build without publishing it. Only pushes to `master` publish the site.

## GitHub Pages path

Until the repository Actions variable `PAGES_CUSTOM_DOMAIN` is set to
`diegoesteves.ink`, the build derives its base path from the repository name
(`/diego-esteves`) so the default project URL remains functional after a rename.
Once set, the build uses the custom-domain root and
adds its `CNAME` file.

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
