# App icon

The hen in a yellow sou'wester and rain boots, on navy. The design file is "Værhøna app icon" in Paper.

The two source files are in `web/public/static/icons/`:

- `app.svg`: the full icon. Use it for 48 px and up.
- `app-small.svg`: a simpler version for 16 and 32 px. It has no rain or puddle, the hen is bigger, and so is the beak.

What is made from them:

- `web/public/static/favicons/`: all PNGs and `favicon.ico`. The 16 and 32 px files (and those sizes in `favicon.ico`) use `app-small.svg`. The rest use `app.svg`.
- `web/public/static/favicons/safari-pinned-tab.svg`: a one-color outline of the full icon.
- `web/public/static/splash/`: the iOS splash images. Run `node scripts/make-splash-screens.mjs` from `web/` to make them again from `app.svg`.
- `web/ui/icons/app.js`: `app-small.svg`, inlined. The site header shows it at 30 px.

When you change the icon, also change the `?v=` value in `web/pages/_document.js` (favicons and splash links), `manifest.json` and `browserconfig.xml`, so browsers fetch the new favicons instead of the cached ones.
