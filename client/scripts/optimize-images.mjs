// Generates WebP variants next to the originals in public/images and public/blog-images.
//   foo.png -> foo.webp (max 1600px), foo-480.webp, foo-960.webp
// Originals stay in place as fallbacks, so URLs stored in the database keep working.
import { existsSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const roots = ['images', 'blog-images'].map((name) => path.join(publicDir, name));
const SOURCE = /\.(png|jpe?g)$/i;
const WIDTHS = [480, 960];
const MAX_WIDTH = 1600;

const walk = async (dir) => {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (SOURCE.test(entry.name)) out.push(full);
  }
  return out;
};

const isFresh = async (src, dest) => {
  try {
    return (await stat(dest)).mtimeMs >= (await stat(src)).mtimeMs;
  } catch {
    return false;
  }
};

const encode = async (src, dest, width) => {
  if (await isFresh(src, dest)) return false;
  await sharp(src)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(dest);
  return true;
};

let written = 0;
for (const root of roots.filter((dir) => existsSync(dir))) {
  for (const src of await walk(root)) {
    const base = src.replace(SOURCE, '');
    if (await encode(src, `${base}.webp`, MAX_WIDTH)) written += 1;
    for (const w of WIDTHS) {
      if (await encode(src, `${base}-${w}.webp`, w)) written += 1;
    }
  }
}
console.log(`optimize-images: wrote ${written} file(s)`);
