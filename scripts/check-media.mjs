import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const publicDir = path.join(root, "public");
const option = (name) => {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  const value = process.argv[index + 1];
  assert(value && !value.startsWith("--"), `${name} requires a value`);
  return value;
};
const outputDir = option("--output");
const baseUrl = option("--url");
const mediaExtension =
  /\.(?:png|jpe?g|gif|webp|svg|avif|ico|ttf|woff2?|mp3|m4a|wav|ogg|opus|aac|mpeg|flac|mp4|webm)$/i;

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? files(path.join(dir, entry.name)) : path.join(dir, entry.name),
    ),
  );
  return nested.flat();
}

// Read every application source, including the central media map and CSS fonts.
// Legacy asset-pointer JSON may remain as provenance, but importing it at runtime
// would send visitors back to Lovable's private /__l5e gateway.
const referenced = new Set();
for (const file of await files(path.join(root, "src"))) {
  if (!/\.(?:ts|tsx|css)$/.test(file) || file.includes(`${path.sep}test${path.sep}`)) continue;
  const source = await readFile(file, "utf8");
  assert(
    !/from\s+["'][^"']+\.asset\.json["']/.test(source),
    `${path.relative(root, file)} imports a Lovable-only asset pointer`,
  );
  for (const match of source.matchAll(/["'](\/[^"'\s]+)["']/g)) {
    const url = match[1];
    if (!mediaExtension.test(url)) continue;
    assert(
      !url.includes("__l5e") && !url.includes("..") && !url.startsWith("//"),
      `Nonportable media URL: ${url}`,
    );
    referenced.add(url);
  }
}
assert(referenced.size > 0, "No application media references found");

// Also include newly committed audio/video and other public media, even when
// they have not been attached to an app screen yet.
const publicFiles = await files(publicDir);
const sidecars = publicFiles.filter((file) => path.basename(file).startsWith("._"));
const publicMedia = publicFiles.filter(
  (file) => mediaExtension.test(file) && !path.basename(file).startsWith("._"),
);
if (sidecars.length)
  console.log(
    `Ignoring ${sidecars.length} macOS AppleDouble sidecar file(s); these are metadata, not playable media.`,
  );
const urls = new Set([
  ...referenced,
  ...publicMedia.map((file) => "/" + path.relative(publicDir, file).split(path.sep).join("/")),
]);
const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
for (const url of [...urls].sort()) {
  const relative = url.slice(1);
  let dir = publicDir;
  for (const segment of relative.split("/")) {
    assert(
      (await readdir(dir)).includes(segment),
      `Missing file or incorrect capitalization: public${url}`,
    );
    dir = path.join(dir, segment);
  }
  const original = await readFile(dir);
  assert(original.length > 0, `Empty media file: ${url}`);
  assert(
    original.subarray(0, 4).toString("hex") !== "00051607",
    `AppleDouble metadata is not playable media: ${url}`,
  );
  assert(
    !original.subarray(0, 100).toString().includes("git-lfs.github.com/spec"),
    `Undownloaded Git LFS pointer: ${url}`,
  );
  if (url.endsWith(".png"))
    assert.equal(original.subarray(1, 4).toString(), "PNG", `Invalid PNG: ${url}`);
  if (url.endsWith(".gif"))
    assert.match(original.subarray(0, 6).toString(), /^GIF8[79]a$/, `Invalid GIF: ${url}`);
  if (/\.jpe?g$/.test(url))
    assert(original[0] === 0xff && original[1] === 0xd8, `Invalid JPEG: ${url}`);
  if (outputDir) {
    const built = await readFile(path.resolve(root, outputDir, relative));
    assert.equal(hash(built), hash(original), `Production artifact differs from public${url}`);
  }
  if (baseUrl) {
    const response = await fetch(new URL(url, baseUrl));
    assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
    const type = response.headers.get("content-type") ?? "";
    assert.match(
      type,
      /^(?:image|font|audio|video)\/|application\/(?:octet-stream|font|vnd\.ms-fontobject)/,
      `${url}: wrong content type ${type}`,
    );
    const served = Buffer.from(await response.arrayBuffer());
    assert.equal(hash(served), hash(original), `HTTP response is not the original media: ${url}`);
  }
}
console.log(
  `Verified ${urls.size} original public media/font files (${referenced.size} referenced URLs): exact case, extensions and file contents${outputDir ? ", production output" : ""}${baseUrl ? ", HTTP 200 + content types + SHA-256" : ""}.`,
);
