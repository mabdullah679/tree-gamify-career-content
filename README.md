# Career Roadmap (tree-gamify-career-content)

A browser-only, gamified course-content prototype: a lineworker career path shown as a story timeline, an exploration tree, and an achievements page, with XP and levels stored in the browser.

```
browser ──▶ static files (Vite build: HTML + JS + CSS)
              └─ progress/XP/achievements ──▶ window.localStorage (this browser only)
```

Nothing is hosted or networked: there is no backend, database, or login. Progress exists only in the browser that created it.

## Prerequisites

- Node.js 22 (CI uses 22; the build was also run locally on Node 26) and npm
- No accounts, ports (other than the Vite dev/preview port), or external services

## Run it

1. `npm ci`
2. `npm run dev`, then open the URL Vite prints (default `http://localhost:5173`). `/` redirects to `/timeline/`.
3. For a production build: `npm run build`, then `npm run preview`.

If the default port is busy, Vite picks the next free one and prints it; to force one use `npm run dev -- --port 3000`.

## What it does

| Page | Path | What you see |
| --- | --- | --- |
| Story Timeline | `/timeline/` | The 8 career stages in order, with skills and certifications to explore |
| Exploration Tree | `/tree/` | The same stages as a tree; clicking clusters toggles leaf bubbles |
| Achievements | `/achievements/` | Achievements earned by exploring items and completing stages |
| HUD (every page) | top bar | Level, XP bar, stats overlay with a reset-progress button |

Content for the 8 stages is in [src/data/careerData.ts](src/data/careerData.ts).

## Tests

There are no automated tests. The only check is `npm run build`, which type-checks with `tsc` (strict mode) and then builds with Vite. CI runs exactly that, plus a gitleaks secrets scan ([.github/workflows/ci.yml](.github/workflows/ci.yml)).

## Layout

| Path | Role |
| --- | --- |
| [index.html](index.html) | Redirects to `/timeline/` |
| [timeline/](timeline/index.html), [tree/](tree/index.html), [achievements/](achievements/index.html) | The three page entries |
| [src/pages/](src/pages/) | Page rendering classes |
| [src/shell.ts](src/shell.ts) | Shared top bar and HUD |
| [src/data/](src/data/) | Content and the localStorage-backed stores (progress, achievements, XP, profile) |
| [src/components/](src/components/) | Toast, celebration, stats overlay, certificate |
| [vite.config.ts](vite.config.ts) | Declares the four HTML entries |

## Design notes

- Multi-page Vite build instead of a client-side router: each page is its own HTML entry. Links are absolute (`/timeline/`), so the site must be served from a domain root, not a sub-path.
- State is localStorage, not a server: that keeps it deployable as static files, at the cost that progress is per-browser and clearable.
