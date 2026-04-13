# Local video files (Deutsch im Blick)

MP4s are loaded in Electron via the custom `app://` protocol from this folder (`electron-app/resources/videos/`).

## Naming

- **Chapter intro** (first visit overlay): `chapter01/intro.mp4`, `chapter02/intro.mp4`, …
- **Harald & Peter interviews** (Aktivität 1 & 2):  
  - `chapter01/k01_interview_harald.mp4`  
  - `chapter01/k01_interview_peter.mp4`
- **Other activities with the “videoclips” icon** use the automatic pattern:  
  `chapterXX/kXX_aYY.mp4`  
  Examples: Kapitel 1, Aktivität 10 → `chapter01/k01_a10.mp4` · Kapitel 2, Aktivität 16 → `chapter02/k02_a16.mp4`

Create the `chapter01` folder if it does not exist. You can rename your downloads to match these paths, or adjust paths in `react-app/scripts/build-chapter1-json.mjs` and regenerate `activites.json`.

## Rights

Use only material you are allowed to host locally (e.g. your own recordings or COERLL/OER usage that permits download). Streaming links remain on the [COERLL Deutsch im Blick](https://coerll.utexas.edu/dib/) site.

## Git

`*.mp4` files under `resources/videos/` are gitignored so large binaries stay on your machine.
