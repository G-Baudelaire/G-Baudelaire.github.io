# Design Decisions

Log of design decisions for the site overhaul. Newest at the bottom.

## 2026-10-17

- Site structure becomes a 2D desk illustration; items are selectable hotspots that zoom into sub-screens.
- Prototype is reached via a "Work in Progress" tab on the existing main page; the current site stays intact until the overhaul replaces it.
- Keyboard and mouse are decorative only (no hover or selection).
- Notepad (Obsidian setup) is low priority.
- Full plan: `.claude/plans/desk-overhaul.md`
- Layout reference sketch saved to `.claude/design/layout-sketch.png` (frame left wall, cap top-right wall, monitor centre, books left of desk, phone and notepad right of monitor, keyboard/mouse front).

## 2026-10-17 (prototype build)

- Y-shaped mark in the sketch is the monitor stand.
- A friend will draw the final scene later, so the scene is **layered and config-driven**: one background plus one tightly cropped transparent image per object, each positioned by `src/desk/scene.ts` (x, y, w, h in % of a 16:9 stage). Placeholders are SVGs in `desk/assets/`; swap files or edit `src` to use real art. See `desk/assets/README.md`.
- Hover = pink glow + small lift (CSS `drop-shadow`, follows image alpha). Click = stage zooms (CSS transform) onto the item, then the sub-screen panel fades in. Esc or "Back to desk" zooms out. Items are `<button>`s so keyboard works.
- Sub-screen content lives as `<section id="panel-*">` blocks in `desk/index.html`.
- Pencil is part of the notepad image rather than a separate item.
- Prototype lives in `desk/`; main site gets a "Work in Progress" nav link.
- Placeholders still to fill: phone number, Substack URL, fuller bio, degree details, current books, Obsidian notes.

## 2026-10-17 (TypeScript)

- **All new code is written in TypeScript from here on.** Legacy `index.js` has been converted to `src/index.ts`; no hand-written JS remains.
- Sources live in `src/` (`src/index.ts` for the main page, `src/desk/*.ts` for the desk); `tsc` (strict) compiles to `js/` as ES modules, mirroring the folder structure. The compiled JS is **committed** because GitHub Pages serves static files with no build step.
- Build with `npm install` once, then `npm run build` (or `npm run watch`). Run the build before committing TS changes. `node_modules/` is gitignored.
- `index.html` loads `js/index.js` and `desk/index.html` loads `../js/desk/desk.js`, both via `<script type="module">`, so the page must be served over http (not opened as `file://`).

## 2026-10-17 (build strategy)

- Long-term: build TypeScript in CI (GitHub Actions runs `tsc` and deploys to Pages), `js/` gitignored, repo contains only `.ts`. Requires switching the Pages source to "GitHub Actions" in repo settings.
- For now: keep committing the generated `js/` output; edit only `.ts` files. CI work is deferred.
