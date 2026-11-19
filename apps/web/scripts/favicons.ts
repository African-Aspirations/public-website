/**
 * Generates the favicon set from public/icon.png (the brand mark on a white square).
 *
 *   bun --cwd apps/web run icons
 *
 * Crops the mark tight, turns the white background transparent for browser tabs,
 * and keeps an opaque white tile for the Apple touch icon (iOS fills transparency black).
 * Outputs (committed): favicon.ico (16/32/48), icon-192.png, icon-512.png, apple-touch-icon.png.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const pub = join(import.meta.dirname, "..", "public");
const src = join(pub, "icon.png");

// 1. Bounding box of the mark (non-white, mostly opaque pixels).
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
let [minX, minY, maxX, maxY] = [W, H, 0, 0];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const [r, g, b, a] = [data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0, data[i + 3] ?? 0];
    if (a > 128 && Math.min(r, g, b) < 240) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
}

// 2. White → transparent, with a soft ramp so anti-aliased edges stay smooth.
const clear = Buffer.from(data);
for (let i = 0; i < clear.length; i += 4) {
  const w = Math.min(clear[i] ?? 0, clear[i + 1] ?? 0, clear[i + 2] ?? 0);
  const keep = w <= 200 ? 1 : w >= 250 ? 0 : (250 - w) / 50;
  clear[i + 3] = Math.round((clear[i + 3] ?? 0) * keep);
}

// 3. Square crop around the mark with a little breathing room.
const side = Math.max(maxX - minX, maxY - minY) + 1;
const pad = Math.round(side * 0.04);
const box = side + pad * 2;
const left = Math.round((minX + maxX + 1) / 2 - box / 2);
const top = Math.round((minY + maxY + 1) / 2 - box / 2);
// sharp always extracts before extending, so pad and crop in two passes.
const square = async (buf: Buffer) => {
  const padded = await sharp(buf, { raw: { width: W, height: H, channels: 4 } })
    .extend({ top: box, bottom: box, left: box, right: box, background: "#ffffff00" })
    .png()
    .toBuffer();
  return sharp(padded)
    .extract({ left: left + box, top: top + box, width: box, height: box })
    .png()
    .toBuffer();
};

const mark = await square(clear);
const png = (size: number, input = mark) =>
  sharp(input).resize(size, size, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();

// 4. Outputs.
writeFileSync(join(pub, "icon-192.png"), await png(192));
writeFileSync(join(pub, "icon-512.png"), await png(512));

// Apple touch icon: opaque white tile, mark at ~80% so iOS rounding doesn't clip it.
const inner = await png(144);
writeFileSync(
  join(pub, "apple-touch-icon.png"),
  await sharp({ create: { width: 180, height: 180, channels: 4, background: "#ffffff" } })
    .composite([{ input: inner, gravity: "centre" }])
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9 })
    .toBuffer(),
);

// favicon.ico with PNG-encoded 16/32/48 entries (supported by every current browser).
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => png(s)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, n) => {
  const e = 6 + n * 16;
  const img = images[n] as Buffer;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(img.length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += img.length;
});
writeFileSync(join(pub, "favicon.ico"), Buffer.concat([header, ...images]));

console.log(
  `Mark ${maxX - minX + 1}×${maxY - minY + 1}px → favicon.ico, icon-192/512, apple-touch-icon`,
);

// Footer logo: public/logo_white.svg wraps a large PNG; extract it, trim the empty
// margin and save a small WebP at 2× the footer display width.
const svg = readFileSync(join(pub, "logo_white.svg"), "utf8");
const embedded = svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)?.[1];
if (embedded) {
  const logo = await sharp(Buffer.from(embedded, "base64"))
    .trim()
    .resize({ width: 360 })
    .webp({ quality: 90, alphaQuality: 100 })
    .toBuffer({ resolveWithObject: true });
  writeFileSync(join(pub, "logo-white.webp"), logo.data);
  console.log(`Footer logo → logo-white.webp (${logo.info.width}×${logo.info.height})`);
}
