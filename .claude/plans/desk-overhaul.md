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
