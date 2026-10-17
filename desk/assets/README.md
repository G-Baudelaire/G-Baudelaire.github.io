# Desk assets

Each file here is one object on the desk. The placeholders are simple SVGs.
To use the final artwork, replace the file (same name) or edit `src` in `../../src/desk/scene.ts`.

- `background.svg` - the wall and desk surface, full scene, 16:9 (e.g. 1600x900).
- Every other file is a **tightly cropped, transparent** image of one object
  (SVG, PNG or WebP). Its box on the stage is set in `../../src/desk/scene.ts` (x, y, w, h as
  % of the stage), so the image is stretched to fit that box - keep the crop's
  aspect ratio close to the box so it doesn't distort.
- The hover glow follows the image's alpha, so keep edges clean.

| File | Object | Selectable |
|------|--------|-----------|
| frame | Picture frame (wall) | yes |
| cap | Graduation cap (wall) | yes |
| monitor | Monitor with stand | yes |
| books | Book stack | yes |
| phone | iPhone | yes |
| notepad | Notepad (and pencil) | yes |
| keyboard | Keyboard | no |
| mouse | Mouse | no |
