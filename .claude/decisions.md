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
- A friend will draw the final scene later, so the scene is **layered and config-driven**: one background plus one tightly cropped transparent image per object, each positioned by `src/desk/scene.ts` (x, y, w, h in % of a 16:9 stage). Placeholders are SVGs in `desk/assets/` (now `public/desk/assets/`); swap files or edit `src` to use real art. See `public/desk/assets/README.md`.
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

## 2026-10-17 (diegetic selections)

- Each selectable item has a `view` in `src/desk/scene.ts`: `screen` (content rendered on the object, interactive), `side` (item zooms to an anchor, panel beside it) or `overlay` (old floating panel).
- Monitor and phone use `screen`: the panel element is moved into a `.screen` box over the art's screen area (`screen` rect = % of the item's box) and sized in `cqw` (stage is a size container), so text scales with the scene. **When real art arrives, re-measure each `screen` rect.**
- Picture frame uses `side`: the photo (`photo` in scene.ts) is inside the frame on the desk from the start; zooming moves the frame to the left and the bio text appears on the right.
- Still `overlay`: cap (qualifications), books, notepad. Candidates for diegetic treatment later (e.g. certificate on the wall, open book).
- Placeholder art for the phone is tiny on the desk (4% wide) and zooms ~6x; raster art for it will need to be high resolution.

## 2026-10-18 (monitor / projects plan)

- Monitor screen shows a tiled grid of projects **at all times**, including zoomed out, so the monitor looks real; zooming only lets you see and use what is already on the screen. Zoomed out the tiles are non-interactive; zoomed in they are live.
- Tile layout: fixed square logo slot top-left (image centred and contained inside it, so differing image sizes/ratios all fit); project name immediately right of the slot; description underneath; links after that. Existing images are reused (`CrowLogo.svg`, `age-prediction-website-image.png`, `matrix-project.png`).
- Links: GitHub logo (`images/github.svg`) for source; "Visit site" text link only where a live site exists. Icon links get `aria-label`s and visible focus states.
- Tech stack is not shown on the desk page (people go to GitHub). No "full details on GitHub" line either; the GitHub link implies it.
- Tile hover: small lift, stronger flat shadow, 1-2px solid pink border, image scales ~1.04 inside its slot. No gradients, glow or frosted glass. ~150ms, respects `prefers-reduced-motion`.
- Smaller type and more padding than the old text panel (it felt cramped). Grid scrolls vertically when projects outgrow the visible rows.
- **Main page (`index.html`, `index.css`, `src/index.ts`) is not to be touched** until we convert the whole site to the desk style.
- Code structure (encapsulation): `Project` type and the projects array live in their own file; the monitor setup (tile rendering, screen behaviour) lives in its own file; monitor-specific code is moved out of `desk.ts` and `scene.ts`.

## 2026-10-18 (phone)

- Phone follows the monitor pattern: item + apps in `src/desk/phone.ts`, home screen is `persistent` (always visible on the desk phone, interactive only when zoomed in). Placeholder screen squares removed from `phone.svg`.
- Apps: Mail, GitHub, LinkedIn, Substack, as flat tiles (Substack uses its own app logo, GitHub the white Invertocat on a dark tile). The old "Phone" app is dropped until there is a number to show.
- **All account/link constants live in `src/desk/links.ts`** (email, GitHub profile + Traveler org, LinkedIn, Substack, site). Desk code imports from there; do not hard-code URLs elsewhere in `src/desk/`. The main page is untouched and keeps its own copies.
- Monitor tiles now use `images/github/GitHub_Invertocat_Black.svg` (no CSS invert).

## 2026-10-18 (cleanup)

- **Supersedes "build strategy" above:** `js/` was gitignored and never committed, so the live site has no JS. Move to **Vite + vanilla TS**, built and deployed by GitHub Actions (`dist/`); assets that TS references by string go in `public/`.
- Add **hash routing** (`/desk/#projects` and so on, browser Back zooms out) after the `desk.ts` refactor.
- Lit deferred until screens need state that changes after they're built.
- Full plan and progress: `.claude/plans/cleanup.md`
