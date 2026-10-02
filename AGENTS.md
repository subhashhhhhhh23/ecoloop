# SortWise

Mobile-first SUSS food-sorting prototype. Pure static front-end (`index.html`, `app.js`, `styles.css`) plus one Anthropic-backed serverless function (`scan.js`, originally a Vercel function) exposed at `POST /api/scan`. No framework, no build step, no runtime dependencies.

## Running here (Base44)

The app runs via `docker-compose.base44.yml` — a single `node:22` service that bind-mounts the repo and runs `server.js`, a tiny dev server that serves the static files and mounts the Vercel-style handler from `scan.js` at `POST /api/scan`.

- Bring up: `docker compose -f docker-compose.base44.yml up -d --build`
- Preview entry point: host port 3000 → `/`.
- `node --watch` restarts on changes to `server.js`/`scan.js`. Static front-end edits (`app.js`, `styles.css`) are served fresh but have no HMR — force a preview reload after editing them.

## Secrets

`ANTHROPIC_API_KEY` is optional for boot. Without it the app still loads and **demo** scans work; real photo scans call Anthropic and will return "Scan service unavailable" until a valid key is supplied. It is delivered via the platform-managed `/run/base44/app.env` (never committed).

## Verification

- `curl -s http://localhost:3000/` returns the SortWise HTML.
- `curl -s -X POST http://localhost:3000/api/scan -H 'Content-Type: application/json' -d '{}'` returns `{"error":"No image received"}` (handler reachable).
- In the preview, the camera screen has a demo mode that returns a sample scan without Anthropic.

## Deploy

Deployed on Vercel (see README). Vercel serves `index.html` and turns `scan.js` into the `/api/scan` function; `ANTHROPIC_API_KEY` is set in Vercel project environment variables.
