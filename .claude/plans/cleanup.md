# Project Cleanup Plan

<!--toc:start-->
- [Project Cleanup Plan](#project-cleanup-plan)
  - [Status](#status)
  - [Why this order](#why-this-order)
  - [Phase 1: Vite + GitHub Actions](#phase-1-vite-github-actions)
    - [Vite](#vite)
    - [GitHub Actions: `.github/workflows/pages.yml`](#github-actions-githubworkflowspagesyml)
    - [Manual steps (user)](#manual-steps-user)
  - [Phase 2: Asset consolidation](#phase-2-asset-consolidation)
    - [Target layout](#target-layout)
    - [Tasks](#tasks)
  - [Phase 3: `desk.ts` refactor](#phase-3-deskts-refactor)
    - [Target modules (`src/desk/`)](#target-modules-srcdesk)
    - [Steps (build and click through after each one)](#steps-build-and-click-through-after-each-one)
  - [Phase 4: Hash routing](#phase-4-hash-routing)
    - [Design](#design)
    - [Tasks](#tasks-1)
  - [Phase 5: Content tidy-ups](#phase-5-content-tidy-ups)
  - [Later / maybe](#later-maybe)
  - [Lit: when it would pay off](#lit-when-it-would-pay-off)
  - [Open decisions](#open-decisions)
  - [Decision log](#decision-log)
<!--toc:end-->

Working plan for the cleanup that started 2026-10-18. It is meant to carry across context windows: tick the boxes as work lands, and add anything decided to the **Decision log** at the bottom (and to `.claude/decisions.md`).

**Decided:** Vite + vanilla TypeScript, deployed by GitHub Actions, with hash routing added after the refactor. Lit is deferred (see "Later / maybe").

## Status

- [ ] Phase 1: Vite + GitHub Actions deploy — code done on branch `cleanup/vite-deploy`; waiting on the manual Pages steps, merge, and a browser click-through
- [ ] Phase 2: Asset consolidation into `public/`
- [ ] Phase 3: `desk.ts` single-responsibility refactor
- [ ] Phase 4: Hash routing
- [ ] Phase 5: Content tidy-ups

## Why this order

- Phase 1 is urgent. `js/` is in `.gitignore` and has never been committed, so on GitHub Pages `js/index.js` and `js/desk/desk.js` return 404 and the desk page is blank. The commits that caused this (7d3840c, d4a554b) are already on origin/master.
- Phase 2 goes with Phase 1, because Vite doesn't rewrite asset paths written as plain strings in TS. Those files have to live in `public/`, so this is the natural time to merge `desk/assets/` and `images/`.
- Phase 3 comes before Phase 4, because routing belongs in the new `selection.ts`. Building it into today's `desk.ts` would mean writing it twice.

---

## Phase 1: Vite + GitHub Actions

### Vite

- [x] `npm i -D vite`. Keep `typescript` on `^5.9`; TS 7 (the native compiler) is a separate, optional upgrade.
- [x] Add `vite.config.ts`:

  ```ts
  import { defineConfig } from "vite";

  export default defineConfig({
    base: "/", // user site on a custom domain, served at the root
    build: {
      rollupOptions: {
        input: { main: "index.html", desk: "desk/index.html" },
      },
    },
  });
  ```

- [x] `package.json` scripts:

  ```json
  "dev": "vite --open /desk/",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit"
  ```

  Remove `watch`, and the `live-server` part of `dev`.
- [x] `tsconfig.json`: add `"noEmit": true`, remove `outDir`, add `"types": ["vite/client"]`, and include `vite.config.ts`.
- [x] Script tags:
  - `index.html`: `./js/index.js` becomes `/src/index.ts`
  - `desk/index.html`: `../js/desk/desk.js` becomes `/src/desk/desk.ts`
  - Import specifiers ending in `.js` inside `src/` still resolve, so they can stay.
- [x] `.gitignore`: remove `js/`, add `dist/` and `.DS_Store`. Delete the local `js/` folder.
- [x] Move `CNAME` into `public/` so Vite copies it into `dist/`.
- [ ] Check: `npm run dev` serves both pages with hot reload, and `npm run build && npm run preview` works with the desk fully functional.
- [x] Interim (done 2026-10-18): moved `images/`, `fonts/`, `pdfs/`, `CNAME` to `public/` and `desk/assets/` to `public/desk/assets/` with names unchanged, and changed the HTML/CSS refs to root-absolute (`/images/...`, `/fonts/...`). TS string paths are untouched. `vite preview`: all referenced URLs return 200. The JS behaviour has not been clicked through in a browser yet.

### GitHub Actions: `.github/workflows/pages.yml`

```yaml
name: CI / Deploy Pages

on:
  pull_request:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: pages-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run build # type-check + vite build -> dist/
      - name: Upload Pages artifact
        if: github.event_name != 'pull_request'
        uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  deploy:
    if: github.event_name != 'pull_request'
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/configure-pages@v6
      - id: deployment
        uses: actions/deploy-pages@v5
```

These action versions were checked on 2026-10-18. GitHub's starter workflow still pins older majors, so don't copy those.

### Manual steps (user)

- [ ] Settings → Pages → Build and deployment → Source: **GitHub Actions**. Until then, Pages keeps serving the branch.
- [ ] Settings → Pages → Custom domain: confirm `gmccaulayjones.com` is still set and **Enforce HTTPS** is on. With the Actions source, the domain comes from this setting, not the `CNAME` file.
- [ ] Optional: branch protection on `master` that requires the `build` check. The check only appears after the workflow has run once.
- [ ] After the first deploy, check the live `/` and `/desk/` pages.

Notes: `.nojekyll` isn't needed, because Jekyll doesn't run on Actions deploys. Vite only bundles what is linked from the two HTML entries or placed in `public/`, so `src/`, `.claude/` and the config files are never published.

---

## Phase 2: Asset consolidation

There is no duplication today: hashing every file found no shared content or names. But `images/` is mixed (old-site only, desk only, and shared), and the desk keeps adding new icons to it.

### Target layout

```
public/
  CNAME
  assets/
    desk/        <- desk/assets/* (scene placeholders + README.md)
    images/
      photos/    germain-mccaulay-jones.jpg, header.jpg
      projects/  CrowLogo.svg, age-prediction-website-image.png, matrix-project.png
      badges/    4 pngs (rename to kebab-case, no spaces)
      icons/     favicon.svg, arrow-up.svg, github.svg, linkedin.svg, mail-app.svg,
                 GitHub_Invertocat_{Black,White}.svg, substack-app-logo.png
    fonts/       <- fonts/*
    pdfs/        <- pdfs/*   (see open decision)
```

**Naming clash:** Vite writes its hashed bundles to `dist/assets/`, so `public/assets/` would mix with them. Use a different top-level name (for example `public/static/`) or set `build.assetsDir` in `vite.config.ts`.

Reference assets with root-absolute paths (`/assets/...`). They then work from both `/` and `/desk/`, so paths no longer depend on which page loads them.

### Tasks

- [ ] Delete unused files:
  - `images/heart.svg`
  - `images/github/GitHub_Invertocat_{Black,White}_Clearspace.svg`
  - `images/substack/substack.png`
  - `images/substack/substack_wordmark.png`
  - `fonts/HKGrotesk-Regular.woff`
- [ ] `images/LICENSE.txt`: delete it, or move it to the root if it's needed. It overlaps `LICENSE.md`.
- [ ] Shrink `substack-app-logo.png` (895K for an icon). Consider `germain-mccaulay-jones.jpg` (1.5M) too.
- [ ] Fix `index.css:9,16`: the `.ttf` fonts are labelled `format('woff')`; they should be `format('truetype')`.
- [ ] Optional: move image path strings into one `IMAGES` base constant in `config.ts` (see Phase 3).
- [ ] Update references. Only these files contain asset paths:
  - `index.html`, `index.css`
  - `desk/index.html`, `desk/desk.css`
  - `src/desk/scene.ts` (lines 7, 88–114), `monitor.ts` (11, 14), `phone.ts` (10, 31–34), `projects.ts` (29–74)
  - `desk/assets/README.md`, `.claude/decisions.md` (17, 47, 48, 60)
- [ ] Check: no 404s in the network tab on either page in `npm run preview`.

---

## Phase 3: `desk.ts` refactor

`desk.ts` (287 lines) does about 12 jobs. The other files are fine; `monitor.ts` and `phone.ts` keep both the item's placement and its screen content, as decided earlier. Avoid splitting things into many tiny files.

### Target modules (`src/desk/`)

| File | Owns | Imports |
| --- | --- | --- |
| `config.ts` | Timings (with comments pointing to the matching `desk.css` lines), `MAX_ZOOM`, fits, `VIEWPORT_CENTRE`, side values, image base path, `OS_NAME`, `PHONE_TIME` | – |
| `types.ts` | `PanelId`, `ViewKind`, `Rect`, `View`, `Item`, `panelElementId(id)`, optional `buildPanel?: () => HTMLElement` on items | – |
| `dom.ts` | `getElement`, `el`, `img`, `externalLink`, `percentStyle` | – |
| `scene.ts` | Data only: `BACKGROUND`, `ITEMS` (monitor and phone included) | types, monitor, phone |
| `monitor.ts`, `phone.ts` | Placement + panel content, each with `buildPanel` | types, dom, config, content |
| `projects.ts`, `links.ts` | unchanged | – |
| `camera.ts` | Pure `zoomTarget(item)`, plus `applyZoom` / `resetZoom` | types, config |
| `render.ts` | `buildScene(stage, host, handlers)` returns `Map<id, {wrapper, screen?, panel}>` | types, dom |
| `selection.ts` | `createSelection(...)`: open state, open/close, panel show/hide, side, screen `inert`, hover label, tracked timers | types, camera, config, dom |
| `desk.ts` | Entry point, about 20 lines: look up elements, wire render to selection, back button and Esc | render, selection, dom |

There are no import cycles. Keeping the name `desk.ts` means `desk/index.html` doesn't change.

### Steps (build and click through after each one)

Check each time: every item zooms in and out, Esc works, the back button works, the hover label shows, the screens are inert when zoomed out and usable when zoomed in, and the side panel lands on the correct half.

- [ ] 1. `dom.ts`: move `el`, `getElement` and `percentStyle`, add `img` and `externalLink`, and remove the copies from `monitor.ts`, `phone.ts` and `desk.ts`.
- [ ] 2. `config.ts`: move the constants (`desk.ts:7-22`, `172`, the `50` at `251`), `OS_NAME`, `"9:41"` and the image base path.
- [ ] 3. `types.ts`: move the types out of `scene.ts:13-86`, and use `panelElementId()` in the 4 places that build `panel-${id}`.
- [ ] 4. Self-describing items: add `buildPanel` to the monitor and phone items and put them in `ITEMS`. `desk.ts` then no longer imports monitor or phone directly.
- [ ] 5. `camera.ts`: move `desk.ts:157-218` as-is, taking `stage` as a parameter.
- [ ] 6. `render.ts`: `buildScene` takes `{onSelect, onHover, onLeave}` callbacks and returns element references, so `setScreenLive` no longer needs `querySelector`.
- [ ] 7. `selection.ts`: open state lives inside a closure. **Fix the timer bug:** keep the reveal and hide timer ids and clear both on every open and close. At the moment the hide timer (`desk.ts:265`) is never cancelled; it only works because `PANEL_REVEAL_MS` (490) is longer than `FADE_MS` (300).
- [ ] 8. Shrink `desk.ts` to the entry point, and remove side effects that run on import from every other module.

---

## Phase 4: Hash routing

Goal: `/desk/#projects` opens the monitor directly, the browser back button zooms out, and links can be shared.

### Design

- The hash is the item's `PanelId`, for example `#projects`, `#contact`, `#bio`, `#quals`, `#books`, `#notes`. An empty hash means the desk is zoomed out.
- The URL is the source of truth. UI actions change the URL, and a single `hashchange` handler applies it:
  - Clicking an item sets `location.hash = id`. That adds a history entry, so Back closes it.
  - Back button or Esc: if the current entry was pushed by the app, call `history.back()`. Otherwise (the page was loaded on `#projects`), use `history.replaceState(null, "", location.pathname)` and close.
  - The `hashchange` handler looks up the item by id: `selection.open(item)`, or `selection.close()` when the hash is empty or unknown.
- On page load, if there is a valid hash, open that item. Consider skipping the zoom animation on load.
- Switching straight from one open item to another (hash goes A → B) should just open B. `selection.open` must work when something is already open, which the step 7 timer fix makes possible.
- Ignore unknown hashes, and replace them with an empty hash so they don't stay in the URL.

### Tasks

- [ ] Add `router.ts` (about 20–30 lines): `startRouter({ items, selection })`, with `navigate(id)` and `navigateHome()` exported for UI handlers.
- [ ] `desk.ts` wires item clicks, the back button and Esc through the router instead of calling `selection` directly.
- [ ] Optional: change the main page's "Work in Progress" link to go straight to a section, for example `/desk/#projects`.
- [ ] Check: deep links for every id on a fresh load, back and forward through several items, Esc and Back after a deep-link load (the user should stay on the page), and that unknown hashes are cleaned up.

---

## Phase 5: Content tidy-ups

- [ ] `projects.ts:47-76`: five "TEST PROJECT" placeholders with `source: ""` produce GitHub links that point back to the current page. Fill them in or remove them.
- [ ] Decide whether the HTML panels (bio, quals, books, notes in `desk/index.html`) should move to TS for consistency with the projects and contact panels.
- [ ] Placeholders still open from `.claude/decisions.md`: phone number, Substack URL, fuller bio, degree details, current books, Obsidian notes.
- [ ] Replace the 5-byte `README.md` with a short description of the project and how to develop it (`npm i`, `npm run dev`, how deploys happen).

---

## Later / maybe

- **Motion** (`animate()` returns a promise, ~2.5 KB mini): replaces the `setTimeout(ZOOM_MS * 0.7)` timing with `await`. Worth it when the zoom and reveal sequence gets more complicated.
- **Lit**: only if GermainOS grows into real windowed apps with state that changes. See the next section.
- **Skip:** Astro (too much for one page), Alpine and petite-vue (the scene is generated from data; petite-vue is unmaintained), Svelte, Preact and Solid (each a full rewrite for little benefit).

## Lit: when it would pay off

Lit gives you two things: **declarative templates** (an `html\`` tagged template instead of`el()` calls) and **reactive re-rendering** (change a property and the component updates only the parts that changed). It is about 5 KB and stays plain TypeScript, with no JSX or new file format.

Today every panel is **built once and never changes**, so Lit adds nothing. It starts paying off when a screen has to *update* after it's built:

- **GermainOS windows:** several apps on the monitor, opening, closing and focusing windows, a dock that shows the running app. An `<os-window>` component with an `open` / `active` property is much simpler than adding and removing classes by hand.
- **Phone apps that do something:** a working clock instead of `"9:41"`, a Substack app that fetches and lists recent posts with loading and error states, a contact app that opens a detail view.
- **Data-driven lists that change:** filtering or sorting projects by tag, books grouped as read and reading.
- **Reusable chrome:** the same title bar, app icon and panel frame on many screens, defined once as components.

Rule of thumb: adopt it once you're writing code to *update* existing DOM in response to state, rather than building it once. If templates alone would help, `lit-html` on its own (~3 KB) is a lighter step. If you adopt it, render into light DOM (`createRenderRoot() { return this; }`) so the global `desk.css` and the `cqw` sizing keep working; Shadow DOM would cut them off.

---

## Open decisions

- [ ] PDF path: moving `/pdfs/Germain%20McCaulay-Jones.pdf` breaks any link shared elsewhere. Keep the old path (`public/pdfs/`) or move it?
- [ ] `.claude/design/layout-sketch.png` (2.4M): with Vite it's no longer deployed. Keep it tracked in git?
- [ ] Rename badge files to kebab-case? This also changes their paths in `index.html`.

## Decision log

- 2026-10-18: Use Vite + vanilla TS, built and deployed by GitHub Actions. This replaces the earlier "commit `js/`" approach, which never actually happened because `js/` was gitignored.
- 2026-10-18: Add hash routing after the refactor, in a `router.ts` module.
- 2026-10-18: Lit deferred until screens need state that changes after they're built.
