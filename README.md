# vaerhona

Weather stations and the website that shows their data.

[`SPEC.md`](SPEC.md) describes what the application must do. Read it before changing how data is loaded or cached.

- [`web/`](web/README.md): the website and API (Next.js on Cloudflare Workers, uses pnpm)
- [`device/`](device/README.md): the code that runs on the Raspberry Pi boxes (uses npm)

The two folders share no code and each has its own dependencies.

The boxes post their data to `/api/graphql` on the website. They can't be updated
remotely, so changes to `web/` must keep that API working for old box code.
