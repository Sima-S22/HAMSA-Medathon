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

Use branch **`fix/vercel-media`**, or merge that branch into `main` first.
`vercel.json` runs `npm run build:vercel`, which packages the original media
and verifies Vercel's production static output. Keep Vercel's Output Directory
at its default setting. See [Vercel media diagnosis and deployment steps](docs/vercel-deployment.md).
