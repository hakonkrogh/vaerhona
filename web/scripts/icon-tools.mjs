// Shared by the scripts that make images from the app icon SVGs in
// public/static/icons/.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');

// sharp comes with Next.js, so this needs no extra dependency.
const fromWeb = createRequire(join(WEB, 'package.json'));
export const sharp = createRequire(fromWeb.resolve('next/package.json'))(
  'sharp'
);

/** @param {string} name a file in public/static/icons/ */
export function readIcon(name) {
  return readFileSync(join(WEB, 'public/static/icons', name));
}

/**
 * Draws an icon SVG as a square PNG.
 *
 * @param {Buffer} svg
 * @param {number} size width and height in pixels
 * @param {number} [cornerShare] corner radius as a share of the size. 0 keeps
 * the square corners.
 * @returns {Promise<Buffer>}
 */
export async function iconPng(svg, size, cornerShare = 0) {
  // Draw the SVG at the target size instead of drawing it big and scaling it
  // down, so 16 and 32 px stay as sharp as they look in a browser.
  const { width } = await sharp(svg).metadata();
  let image = sharp(svg, { density: (72 * size) / width }).resize(size, size);

  if (cornerShare > 0) {
    const radius = Math.round(size * cornerShare);
    const corners = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
        `<rect width="${size}" height="${size}" rx="${radius}" fill="#fff"/></svg>`
    );
    image = image.composite([{ input: corners, blend: 'dest-in' }]);
  }

  return image.png({ compressionLevel: 9 }).toBuffer();
}
