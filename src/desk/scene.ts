/*
 * Scene layout. Everything on the desk is described here.
 *
 * x, y, w, h are percentages of the 16:9 stage (top-left origin).
 * To swap in real artwork: export each item as a tightly cropped transparent
 * image, drop it in public/desk/assets over the placeholder (or change `src`), and tweak
 * the box below until it sits right. See public/desk/assets/README.md.
 *
 * selectable: true  -> hover highlight, click zooms in and opens panel `panel`
 * selectable: false -> decorative only
 */

/* Named constants so call sites say PanelId.Quals, not a bare string. The values stay plain strings. */
export const PanelId = {
  Bio: "bio",
  Quals: "quals",
  Projects: "projects",
  Books: "books",
  Contact: "contact",
  Notes: "notes",
} as const;
export type PanelId = (typeof PanelId)[keyof typeof PanelId];

export const ViewKind = {
  Screen: "screen",
  Side: "side",
  Overlay: "overlay",
} as const;
export type ViewKind = (typeof ViewKind)[keyof typeof ViewKind];

/* A box in percent of whatever contains it (the stage, or an item). */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/*
 * How a selected item presents its content.
 *
 * screen:  the panel is rendered ON the object (monitor, phone). `screen` is the
 *          screen area in percent of the item's box; `fit` is how much of the
 *          viewport that area fills once zoomed. The content is interactive.
 *          `persistent` keeps the content visible when zoomed out (not interactive until zoomed in).
 * side:    the item zooms to `anchor` (percent of the viewport) and the panel
 *          appears beside it, on the opposite half (anchor.x > 50 puts the item
 *          on the right and the panel on the left).
 * overlay: the item zooms to the centre and the panel floats over the scene.
 */
export interface ScreenView {
  kind: typeof ViewKind.Screen;
  screen: Rect;
  fit: number;
  persistent?: boolean;
}

export type View =
  | ScreenView
  | { kind: typeof ViewKind.Side; anchor: { x: number; y: number } }
  | { kind: typeof ViewKind.Overlay };

/* An image shown inside an item from the start, e.g. the photo in the frame. */
export interface Photo extends Rect {
  src: string;
  alt: string;
}

interface BaseItem extends Rect {
  id: string;
  label: string;
  src: string;
}

export interface SelectableItem extends BaseItem {
  selectable: true;
  panel: PanelId;
  view: View;
  photo?: Photo;
}

export interface DecorItem extends BaseItem {
  selectable: false;
}

export type Item = SelectableItem | DecorItem;

export const BACKGROUND = "assets/background.svg";

/* The monitor and phone live in monitor.ts and phone.ts; desk.ts adds them to these. */
export const ITEMS: readonly Item[] = [
  {
    id: "frame", label: "About me", src: "assets/frame.svg",
    x: 5, y: 12, w: 15, h: 27,
    selectable: true, panel: PanelId.Bio, view: { kind: ViewKind.Side, anchor: { x: 25, y: 50 } },
    photo: { src: "../images/germain-mccaulay-jones.jpg", alt: "Germain McCaulay-Jones", x: 10.8, y: 10.7, w: 78.3, h: 78.6 },
  },
  {
    id: "cap", label: "Qualifications", src: "assets/cap.svg",
    x: 76, y: 8, w: 16, h: 20,
    selectable: true, panel: PanelId.Quals, view: { kind: ViewKind.Side, anchor: { x: 75, y: 45 } },
  },
  {
    id: "books", label: "Reading", src: "assets/books.svg",
    x: 17, y: 44, w: 7, h: 14,
    selectable: true, panel: PanelId.Books, view: { kind: ViewKind.Side, anchor: { x: 75, y: 45 } },
  },
  {
    id: "notepad", label: "Notes setup", src: "assets/notepad.svg",
    x: 80, y: 60, w: 14, h: 20,
    selectable: true, panel: PanelId.Notes, view: { kind: ViewKind.Side, anchor: { x: 75, y: 45 } },
  },
  { id: "keyboard", label: "", src: "assets/keyboard.svg", x: 32, y: 66, w: 28, h: 11, selectable: false },
  { id: "mouse", label: "", src: "assets/mouse.svg", x: 66, y: 68, w: 4, h: 8, selectable: false },
];
