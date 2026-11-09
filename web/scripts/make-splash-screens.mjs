// Makes the iOS splash images, shown while the home screen app starts.
// Run from web/: node scripts/make-splash-screens.mjs
//
// iOS only shows an image made for the exact screen size, so there is one per
// size in core/splash-screens.json. pages/_document.js links them from the
// same list. Run this again after changing the list or the logo.
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(WEB, 'public/static/splash');

// sharp comes with Next.js, so this needs no extra dependency.
const require = createRequire(require_resolve('next/package.json'));
const sharp = require('sharp');

function require_resolve(name) {
  return createRequire(join(WEB, 'package.json')).resolve(name);
}

const config = JSON.parse(
  readFileSync(join(WEB, 'core/splash-screens.json'), 'utf8')
);
const logo = readFileSync(join(WEB, 'public/static/icons/app.svg'));

mkdirSync(OUT, { recursive: true });

for (const { width, height, ratio } of config.screens) {
  const pixelWidth = width * ratio;
  const pixelHeight = height * ratio;
  const logoSize = Math.round(pixelWidth * config.logoWidthShare);
  const logoPng = await sharp(logo, { density: 300 })
    .resize(logoSize, logoSize)
    .png()
    .toBuffer();
  const file = join(OUT, `splash-${pixelWidth}x${pixelHeight}.png`);

  await sharp({
    create: {
      width: pixelWidth,
      height: pixelHeight,
      channels: 3,
      background: config.background,
    },
  })
    .composite([
      {
        input: logoPng,
        left: Math.round((pixelWidth - logoSize) / 2),
        top: Math.round((pixelHeight - logoSize) / 2),
      },
    ])
    .png({ compressionLevel: 9, palette: true })
    .toFile(file);

  console.log(file);
}
