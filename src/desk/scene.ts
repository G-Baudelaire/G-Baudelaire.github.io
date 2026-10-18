/*
 * Scene layout. Everything on the desk is described here.
 *
 * x, y, w, h are percentages of the 16:9 stage (top-left origin).
 * To swap in real artwork: export each item as a tightly cropped transparent
 * image, drop it in ./assets over the placeholder (or change `src`), and tweak
 * the box below until it sits right. See assets/README.md.
 *
 * selectable: true  -> hover highlight, click zooms in and opens panel `panel`
 * selectable: false -> decorative only
 */

export type PanelId = "bio" | "quals" | "projects" | "books" | "contact" | "notes";

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
 * side:    the item zooms to `anchor` (percent of the viewport) and the panel
 *          appears beside it, on the right.
 * overlay: the item zooms to the centre and the panel floats over the scene.
 */
export type View =
  | { kind: "screen"; screen: Rect; fit: number }
  | { kind: "side"; anchor: { x: number; y: number } }
  | { kind: "overlay" };

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

export const ITEMS: readonly Item[] = [
  {
    id: "frame", label: "About me", src: "assets/frame.svg",
    x: 5, y: 12, w: 15, h: 27,
    selectable: true, panel: "bio", view: { kind: "side", anchor: { x: 25, y: 50 } },
    photo: { src: "../images/germain-mccaulay-jones.jpg", alt: "Germain McCaulay-Jones", x: 10.8, y: 10.7, w: 78.3, h: 78.6 },
  },
  {
    id: "cap", label: "Qualifications", src: "assets/cap.svg",
    x: 76, y: 8, w: 16, h: 20,
    selectable: true, panel: "quals", view: { kind: "overlay" },
  },
  {
    id: "monitor", label: "Projects", src: "assets/monitor.svg",
    x: 28, y: 20, w: 36, h: 38,
    selectable: true, panel: "projects",
    view: { kind: "screen", screen: { x: 3.8, y: 6.4, w: 92.4, h: 67.8 }, fit: 0.8 },
  },
  {
    id: "books", label: "Reading", src: "assets/books.svg",
    x: 17, y: 44, w: 7, h: 14,
    selectable: true, panel: "books", view: { kind: "overlay" },
  },
  {
    id: "phone", label: "Contact", src: "assets/phone.svg",
    x: 66, y: 44, w: 4, h: 12,
    selectable: true, panel: "contact",
    view: { kind: "screen", screen: { x: 12.5, y: 13, w: 75, h: 74 }, fit: 0.55 },
  },
  {
    id: "notepad", label: "Notes setup", src: "assets/notepad.svg",
    x: 72, y: 40, w: 14, h: 20,
    selectable: true, panel: "notes", view: { kind: "overlay" },
  },
  { id: "keyboard", label: "", src: "assets/keyboard.svg", x: 32, y: 66, w: 28, h: 11, selectable: false },
  { id: "mouse",    label: "", src: "assets/mouse.svg",    x: 66, y: 68, w: 4,  h: 8,  selectable: false },
];
