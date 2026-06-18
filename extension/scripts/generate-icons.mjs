import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'public/icon');
const src = join(outDir, 'source.png');
const fallback = join(outDir, '128.png');

await mkdir(outDir, { recursive: true });
const input = existsSync(src) ? src : fallback;

for (const size of [16, 48, 128]) {
  await sharp(input).resize(size, size).png().toFile(join(outDir, `${size}.png`));
}

console.log('Icons generated: public/icon/16.png, 48.png, 128.png');
