// Makes the favicons, home screen icons and Windows tiles in
// public/static/favicons/ from the app icon SVGs in public/static/icons/.
// Run from web/: node scripts/make-favicons.mjs
//
// Then change the ?v= value in pages/_document.js, manifest.json and
// browserconfig.xml, so browsers fetch the new files instead of cached ones.
// safari-pinned-tab.svg is a one-color outline and is not made here.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { WEB, iconPng, readIcon, sharp } from './icon-tools.mjs';

const OUT = join(WEB, 'public/static/favicons');
const NAVY = '#0B3D55';

const full = readIcon('app.svg');
// Drawn for 16 and 32 px: no rain or puddle, a bigger hen and a bigger beak.
const small = readIcon('app-small.svg');

// Browsers and Android (manifest icons with the default purpose "any") show
// the image as it is, so these get rounded corners.
const FAVICON_CORNERS = 0.19;
const ANDROID_CORNERS = 0.22;

// iOS and Windows round the corners themselves, and iOS wants no transparency,
// so `opaque` files keep square corners and drop the alpha channel.
// The mstile files are bigger than the tile sizes in their names, as the
// favicon generator used before made them.
const files = [
  { name: 'favicon-16x16.png', svg: small, size: 16, corners: FAVICON_CORNERS },
  { name: 'favicon-32x32.png', svg: small, size: 32, corners: FAVICON_CORNERS },
  {
    name: 'android-chrome-192x192.png',
    svg: full,
    size: 192,
    corners: ANDROID_CORNERS,
  },
  {
    name: 'android-chrome-512x512.png',
    svg: full,
    size: 512,
    corners: ANDROID_CORNERS,
  },
  { name: 'apple-touch-icon.png', svg: full, size: 180, opaque: true },
  { name: 'mstile-70x70.png', svg: full, size: 128, opaque: true },
  { name: 'mstile-144x144.png', svg: full, size: 144, opaque: true },
  { name: 'mstile-150x150.png', svg: full, size: 270, opaque: true },
  { name: 'mstile-310x310.png', svg: full, size: 558, opaque: true },
];

const made = {};

for (const { name, svg, size, corners = 0, opaque = false } of files) {
  let png = await iconPng(svg, size, corners);

  if (opaque) {
    png = await sharp(png).removeAlpha().png({ compressionLevel: 9 }).toBuffer();
  }

  made[name] = png;
  write(name, png);
}

// The wide tile is the square icon on a navy band, so it reads as one tile.
const WIDE = { width: 558, height: 270 };
write(
  'mstile-310x150.png',
  await sharp({ create: { ...WIDE, channels: 3, background: NAVY } })
    .composite([
      {
        input: await iconPng(full, WIDE.height),
        left: (WIDE.width - WIDE.height) / 2,
        top: 0,
      },
    ])
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer()
);

write(
  'favicon.ico',
  ico([
    { size: 16, png: made['favicon-16x16.png'] },
    { size: 32, png: made['favicon-32x32.png'] },
    { size: 48, png: await iconPng(full, 48, FAVICON_CORNERS) },
  ])
);

function write(name, data) {
  const file = join(OUT, name);
  writeFileSync(file, data);
  console.log(file);
}

/**
 * Packs PNG images into an .ico file. Every current browser reads PNG images
 * in an .ico, so they need no conversion to bitmaps.
 *
 * @param {{ size: number, png: Buffer }[]} images
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = header.length + 16 * images.length;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0); // width
    entry.writeUInt8(size, 1); // height
    entry.writeUInt8(0, 2); // no color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
}
