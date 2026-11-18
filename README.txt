CAREER ROADMAP (tree-gamify-career-content)

What it is: a small website prototype that turns a lineworker career path into a game. You can read it as a story timeline, as a tree you explore, and as an achievements page. You earn experience points and levels as you explore.

What is NOT online: there is no server, no database and no login. Everything you earn is saved only inside your own web browser. Clearing the browser data, or pressing the reset button in the stats window, wipes it.

What you need: Node.js (version 22 is what the automatic checks use) and npm. Nothing else.

How to run it:
1. Run: npm ci
2. Run: npm run dev
3. Open the address it prints, normally http://localhost:5173. The home page forwards you to the timeline.
4. For a production-style build run: npm run build, then npm run preview.
If the port is busy, Vite picks the next free one and tells you. To choose one yourself: npm run dev -- --port 3000

What the pages do:
- Timeline: the 8 career stages in order, with skills and certifications to explore.
- Exploration Tree: the same stages drawn as a tree. Clicking a cluster shows or hides its leaves.
- Achievements: what you have earned by exploring items and finishing stages.
- Top bar on every page: your level, an XP bar, and a stats window with a reset button.
The stage content lives in src/data/careerData.ts.

Tests: there are none. The only check is npm run build, which type-checks the code strictly and then builds it. The automatic check on GitHub runs exactly that, plus a scan for leaked passwords or keys.

Design choices worth knowing: each page is its own HTML file rather than using a router, and links start at the site root, so the site must be hosted at the top of a domain, not in a sub-folder. Progress is stored in the browser so the whole thing can be hosted as plain files.

Known leftovers (owner decision): src/main.ts, src/counter.ts, src/pages/Page1Roadmap.ts and src/typescript.svg are not used by any page.
