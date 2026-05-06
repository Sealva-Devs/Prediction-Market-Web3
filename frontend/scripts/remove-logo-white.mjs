/**
 * One-off: make white/near-white pixels in Pledgy_Logo.png transparent.
 * Run from frontend/: node scripts/remove-logo-white.mjs
 */
import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const path = join(root, 'Pledgy_Logo.png');

const THRESHOLD = 248; // pixels with r,g,b >= this become transparent

const { data, info } = await sharp(path)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  if (r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD) {
    data[i + 3] = 0;
  }
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toFile(path);

console.log('Pledgy_Logo.png: white background removed.');
