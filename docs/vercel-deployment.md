# Vercel media fix

Deploy branch **`fix/vercel-media`** (or merge it into `main` before deploying main).
This branch includes the completed HAMSA MVP and its original local media.

## Confirmed cause

The live site at `https://hamsa-medathon.vercel.app` serves the older main commit
`055145b33c5b70e62eae3bcf3c3fc0522356a2a2`, according to GitHub's Vercel deployment
status. Its HTML references `/__l5e/assets-v1/...` for the background, logo,
animated fox and still fox. All four welcome image URLs returned HTTP 404.

That path belongs to Lovable's asset gateway; it is not a committed public asset
or a service supplied by Vercel. On this main commit, `public/` contains only
`favicon.png` and `robots.txt`. The artwork exists only as asset-pointer JSON
under `src/assets/`, not actual images that Vercel can serve.

The original local media and portable references were committed on the MVP
branch in `503a657`, but main has not merged that branch. Deploying the old main
commit therefore does not include those fixes.

## What this branch contains

- All 18 runtime artwork files (background, logo, two fox illustrations, welcome
  fox GIF, boy/girl portraits and standing figures, eight symptom GIFs), plus the
  favicon and both local fonts, are committed. Paths and case match the files.
- Active media URLs are root-relative `/media/...`, `/fonts/...`, `/favicon.png`.
  There are no Lovable gateway, localhost, local filesystem, or external asset
  references in the running UI. Pointer JSON remains only as source provenance.
- Original illustrations and animations are retained. No UI component, layout,
  wording, button, reducer or interaction changed in this media-fix commit.
- `vercel.json` selects `npm run build:vercel`. This explicitly builds Nitro's
  Vercel preset and verifies `.vercel/output/static` against the original files.
- `npm run build` now checks public media before bundling. Missing media,
  wrong-case paths, empty files, Git LFS pointers or renewed runtime imports of
  Lovable asset-pointer JSON fail the build with a concrete error.
- Generated `.vercel/` files are ignored by Git and ESLint.

## Vercel settings

1. Deploy the **`fix/vercel-media`** branch, not the old main commit.
2. Use the repository root as Root Directory.
3. The repository's `vercel.json` supplies Build Command: `npm run build:vercel`.
4. Leave Output Directory at its framework/default setting; do not override it
   with `public`, `src`, `dist` or `.output/public`. Nitro generates Vercel's
   Build Output API in `.vercel/output`, including `static/media` and the SSR
   function. Its filesystem route serves media before the SSR fallback.
5. No media secrets, Lovable account, storage bucket or proxy are needed.

Once deployed, `/media/fox.gif`, `/media/welcome-scene.png` and
`/media/room-original.jpg` should return actual image bytes, not an HTML page.
The old `/__l5e/` URLs are not used and do not need to be proxied.

## Production verification

```sh
npm run build:vercel
# Starts the built Vercel handler and built static files, without Vite dev:
./node_modules/.bin/srvx --prod \
  --entry .vercel/output/functions/__server.func/index.mjs \
  --static "$PWD/.vercel/output/static" --host 127.0.0.1 --port 4175
```

In another terminal:

```sh
node scripts/check-media.mjs --output .vercel/output/static --url http://127.0.0.1:4175
HAMSA_BASE_URL=http://127.0.0.1:4175 npm run test:browser
```

The production HTTP check covers all 21 image/GIF/font files, requiring HTTP
200, a media content type and SHA-256 equality with the committed originals.
It catches HTML fallbacks masquerading as successful image requests. Browser
verification exercises English/Arabic, both avatars, every symptom GIF, answers
and summary exports across tablet/laptop/mobile sizes.

The existing `npm run preview` goes through TanStack's Vite preview adapter,
which currently looks for `dist/server/server.js` rather than Nitro's Vercel
output. The explicit `srvx` command above verifies the real deployment files.
This adapter limitation is separate from the confirmed production media issue.

During verification, main received `public/._AUDIO-2026-11-13-19-25-24.mp3` in
commit `6835b5a`. This file is 4,096 bytes and identifies as AppleDouble Macintosh
metadata; `ffprobe` rejects it as invalid media. It is not the actual recording.
The main update is merged into this branch so that upload is preserved.
The checker ignores unreferenced `._*` sidecars, rejects them if referenced as
media, and Git ignores future sidecars. There is still no playable recording or
app audio URL to repair. Upload the original MP3 without the `._` prefix to add
audio; no substitute recording was added.

Provider reference: [Nitro's Vercel deployment documentation](https://nitro.build/deploy/providers/vercel).
