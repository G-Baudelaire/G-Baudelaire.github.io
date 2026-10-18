# Desk Overhaul Plan

Overhaul of the personal site into an interactive 2D picture of a desk. Hovering over
items highlights them; selecting one zooms in to a sub-screen with that item's content.

## Current goal: prototype

1. Add a "Work in Progress" tab to the current main page (`index.html`) linking to the new page.
2. Build a hover/select process for images on the new page; selecting one navigates to its sub-screen.

## Desk items

| Item | Interaction | Sub-screen content | Priority |
|------|-------------|--------------------|----------|
| Monitor | Selectable | Scrollable list of projects | Normal |
| Picture frame (wall) | Selectable | Frame + photo on the left, biography on the right | Normal |
| Graduation cap (wall) | Selectable | Qualifications: degree and other certificates | Normal |
| Stack of books | Selectable | Books read / currently reading | Normal |
| iPhone | Selectable | Fake apps linking to email, phone number, Substack | Normal |
| Notepad | Selectable | Details of Obsidian setup | Low |
| Keyboard and mouse | NOT selectable | Decorative only, no hover/select | n/a |

## Status

- [x] WIP tab on main page
- [x] New desk page scaffold (desk/)
- [x] Hover + select + zoom mechanism (untested in a browser)
- [~] Sub-screens: all six exist, several with placeholder content

## Layout sketch (2026-10-17)

Hand sketch saved at `.claude/design/layout-sketch.png`. Reading of it:

- **Wall, left:** large square picture frame labelled "ME".
- **Wall, top right:** graduation cap (tilted mortarboard with tassel), labelled "Qualifications".
- **Desk, back row:** large monitor at top-centre ("Projects"); small book stack at the left end of the desk ("What I'm reading"); a small phone to the right of the monitor stand, labelled "Substack"; notepad at the right, labelled "Notes setup", with a pencil beside it.
- **Desk, front row:** keyboard (rectangle) and mouse (oval), decorative only.
- **Open question:** the Y-shaped mark under the monitor is probably the monitor stand; confirm.

## Later

- [ ] Move TypeScript build to GitHub Actions and stop committing `js/` (see decisions.md, "build strategy").

## Todo: diegetic selections (2026-10-17)

Selecting an item should feel like moving closer to it, not opening a web overlay.

- [x] 1. Monitor: zoom in so the screen fills the view; project list is rendered *on* the screen and is interactive (scroll, click links).
- [x] 2. Phone: same treatment; the fake apps render on the phone's own screen.
- [x] 3. Picture frame: zoom with the frame/photo on the left and bio text appearing on the right. The photo of me sits inside the frame on the desk from the start (not only after zoom).

## Todo: monitor and projects (2026-10-18)

Decisions in decisions.md ("monitor / projects plan"). Built 2026-10-18 (compiles; not yet viewed in a browser).

- [x] 1. `Project` type + projects array in their own file (e.g. `src/desk/projects.ts`).
- [x] 2. Monitor module in its own file (e.g. `src/desk/monitor.ts`): renders the tile grid, owns monitor screen behaviour. Move monitor-related code out of `desk.ts` / `scene.ts`.
- [x] 3. Tile: square logo slot top-left (contained, centred), name to its right, description below, links after. GitHub logo for source.
- [x] 4. Grid always visible on the monitor; interactive only when zoomed in; scrolls when it overflows.
- [x] 5. Flat hover (lift, border, image scale); no gradients.
- [x] 6. Reduce type size / add padding; remove tech stack lines from the desk page.
- [x] 7. Remove the old `#panel-projects` text blocks from `desk/index.html`.
