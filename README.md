## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Caveats

- This is a work in progress (this is a big one)
- Exporting only works if videos are the same resolution

## Future Features

- Add audio option
- Resolution options on export
- Support for multiple resolutions in video editor
- Support for photos (with editable time length)
- Add video sections of rendered text
- Fix ffmpeg.wasm complaining about how it does not support nodejs

## How it's built

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [FFmpeg.js](https://github.com/ffmpeg.wasm/ffmpeg.wasm)
- [DnD Kit](https://dndkit.com/)
