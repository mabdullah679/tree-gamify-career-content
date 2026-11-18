# tree-gamify-career-content

Static Vite + TypeScript front end (no framework, no backend). Global working rules live in `~/.claude/CLAUDE.md`; this file only holds repo facts.

## Commands (run and verified 2026-11-18)
- `npm ci` then `npm run build` (runs `tsc` then `vite build`; this is the only check, there are no tests and no linter)
- `npm run dev` (Vite dev server), `npm run preview` (serve `dist/`)

## Layout
- `index.html` redirects to `/timeline/`; `timeline/`, `tree/`, `achievements/` are the three pages, each a Vite multi-page entry (see `vite.config.ts`)
- `src/pages/` page classes, `src/shell.ts` shared top bar + HUD, `src/data/` stores and the career content (`careerData.ts`), `src/components/` overlays
- All progress lives in browser `localStorage` (keys `career-roadmap-*`); there is no server

## Do not touch / watch for
- `src/data/careerData.ts` is the content (8 stages); treat edits as content decisions
- `src/main.ts`, `src/counter.ts`, `src/pages/Page1Roadmap.ts`, `src/typescript.svg` are not reachable from any HTML entry (unused leftovers); left in place pending owner decision
- Branch + PR only; never push to `main`
