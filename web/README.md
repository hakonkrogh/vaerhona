# vaerhona

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
Image optimization uses the Cloudflare Images binding.

## CI

`.github/workflows/deploy.yml` deploys to production on every push to `main`.
It needs two repository secrets: `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`
(a token made from the "Edit Cloudflare Workers" template).
