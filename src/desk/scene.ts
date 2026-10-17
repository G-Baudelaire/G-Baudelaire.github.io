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

interface BaseItem {
  id: string;
  label: string;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SelectableItem extends BaseItem {
  selectable: true;
  panel: PanelId;
}

export interface DecorItem extends BaseItem {
  selectable: false;
}

export type Item = SelectableItem | DecorItem;

export const BACKGROUND = "assets/background.svg";

export const ITEMS: readonly Item[] = [
  { id: "frame",    label: "About me",       src: "assets/frame.svg",    x: 5,  y: 12, w: 15, h: 27, selectable: true,  panel: "bio" },
  { id: "cap",      label: "Qualifications", src: "assets/cap.svg",      x: 76, y: 8,  w: 16, h: 20, selectable: true,  panel: "quals" },
  { id: "monitor",  label: "Projects",       src: "assets/monitor.svg",  x: 28, y: 20, w: 36, h: 38, selectable: true,  panel: "projects" },
  { id: "books",    label: "Reading",        src: "assets/books.svg",    x: 17, y: 44, w: 7,  h: 14, selectable: true,  panel: "books" },
  { id: "phone",    label: "Contact",        src: "assets/phone.svg",    x: 66, y: 44, w: 4,  h: 12, selectable: true,  panel: "contact" },
  { id: "notepad",  label: "Notes setup",    src: "assets/notepad.svg",  x: 72, y: 40, w: 14, h: 20, selectable: true,  panel: "notes" },
  { id: "keyboard", label: "",               src: "assets/keyboard.svg", x: 32, y: 66, w: 28, h: 11, selectable: false },
  { id: "mouse",    label: "",               src: "assets/mouse.svg",    x: 66, y: 68, w: 4,  h: 8,  selectable: false },
];
