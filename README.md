# Design Frame To App

Imported website: https://www.figma.com/design/ZJX1Yt1maXHvHkn8mY1cOV/Untitled?node-id=215-362&m=draw

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/de7ea64f-a62d-4c99-aa8c-8c000e63ff73).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## HAMSA MVP

The existing bilingual child journey now continues through the four reference
symptoms to an editable clinician summary, PNG/JSON downloads, print/PDF and a
session ending. Original illustrations and animations are served locally.
Session data is held in memory; refresh, confirmed restart or final End clears
it. No accounts or backend are required.

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

See [MVP reference review and validation](docs/mvp-review.md) for the page map,
implemented behavior, optional browser smoke checks, export schema and remaining
design/device limitations. Use fictional child names for development.

## Deploy to Vercel

Deploy `main` after merging the feature PR you want to use. For background audio,
use **`feat/background-audio`**, or merge that branch into `main` first.
`vercel.json` runs `npm run build:vercel`, which packages the original media
and verifies Vercel's production static output. Keep Vercel's Output Directory
at its default setting. See [Vercel media diagnosis and deployment steps](docs/vercel-deployment.md).

## Background audio

The original `public/AUDIO-2026-11-13-19-25-24.mp3` loops after the child taps
**Start**. It continues across journey screens without restarting. The sound
button in the top-right corner turns it off/on, with English and Arabic labels.
Playback starts at 25% volume where the browser supports software volume;
on devices that use hardware volume, use the device's volume buttons.
Restart and final End pause and reset the track. Refresh waits for another tap;
no sound preference or child data is persisted. Playback errors never block the
journey, and the sound button can retry after a browser blocks playback.

The recording is bundled with the Vercel build; it needs no paid service or
external audio API. Optional actual-audio browser verification:

```sh
HAMSA_BASE_URL=http://127.0.0.1:4176 node scripts/background-audio-smoke.cjs
```

Use the same optional Playwright setup as `npm run test:browser`.
