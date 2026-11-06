# vaerhona web

The website and API. Run all commands below from this folder.

## Local development

1) Copy env.txt to .env and fill in the values
2) Run `pnpm dev`

## Hosting (Cloudflare Workers)

The app runs on Cloudflare Workers through the OpenNext adapter.
Config lives in `wrangler.jsonc` and `open-next.config.ts`.

- `pnpm preview`: build and run the Worker locally with `.dev.vars` as env
- `pnpm run deploy`: build and deploy to Cloudflare (use `run`, plain `pnpm deploy` is a built-in pnpm command)

Secrets are set once per Worker, not from `.env`:

```
npx wrangler secret put MONGO_DB_URI
npx wrangler secret put VH_AWS_ACCESS_KEY_ID
npx wrangler secret put VH_AWS_SECRET_ACCESS_KEY
```

ISR pages are cached in the R2 bucket `vaerhona-next-cache`.
Uploads keep a latest snapshot record per place in the R2 bucket `vaerhona-latest` (see [the design](../docs/latest-snapshot-design.md)).
Image optimization uses the Cloudflare Images binding.
`worker.js` is the Worker entry. It wraps the OpenNext Worker and caches optimized snapshot photos (see `image-cache.js`).

## CI

`.github/workflows/deploy.yml` (at the repo root) deploys to production on every
push to `main` that changes `web/` or the workflow itself.
It needs two repository secrets: `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`
(a token made from the "Edit Cloudflare Workers" template).
