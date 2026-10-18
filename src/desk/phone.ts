/*
 * The phone: its place on the desk and the app icons drawn on its screen.
 * Like the monitor, the home screen is always showing; zooming in makes the apps usable.
 */

import { PanelId, ViewKind, type SelectableItem } from "./scene.js";
import { EMAIL_URL, GITHUB_PROFILE, LINKEDIN, SUBSTACK } from "./links.js";

export const PHONE_ITEM: SelectableItem = {
  id: "phone", label: "Contact", src: "assets/phone.svg",
  x: 66, y: 44, w: 4, h: 12,
  selectable: true, panel: PanelId.Contact,
  view: { kind: ViewKind.Screen, screen: { x: 12.5, y: 13, w: 75, h: 74 }, fit: 0.75, persistent: true },
};

/* An app is either an image or a text glyph on a flat coloured tile. */
interface App {
  name: string;
  href: string;
  /* Flat tile colour behind the icon. */
  colour: string;
  /* Icon image, relative to desk/index.html. Omit to use `glyph`. */
  icon?: string;
  glyph?: string;
  /* Icon art fills the whole tile (no padding). */
  fullBleed?: boolean;
  external: boolean;
}

const APPS: readonly App[] = [
  { name: "Mail", href: EMAIL_URL, colour: "#2f7de1", glyph: "✉", external: false },
  { name: "GitHub", href: GITHUB_PROFILE, colour: "#1b1f24", icon: "../images/github/GitHub_Invertocat_White.svg", external: true },
  { name: "LinkedIn", href: LINKEDIN, colour: "#0a66c2", icon: "../images/linkedin.svg", external: true },
  { name: "Substack", href: SUBSTACK, colour: "#ff6719", icon: "../images/substack/substack-app-logo.png", fullBleed: true, external: true },
];

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function buildIcon(app: App): HTMLElement {
  const tile = el("span", "app__icon");
  tile.style.background = app.colour;
  if (app.icon) {
    const img = el("img", "app__img");
    img.src = app.icon;
    img.alt = "";
    img.draggable = false;
    if (app.fullBleed) img.classList.add("app__img--bleed");
    tile.appendChild(img);
  } else if (app.glyph) {
    tile.appendChild(el("span", "app__glyph", app.glyph));
  }
  return tile;
}

function buildApp(app: App): HTMLElement {
  const link = el("a", "app");
  link.href = app.href;
  if (app.external) {
    link.target = "_blank";
    link.rel = "noopener";
  }
  link.appendChild(buildIcon(app));
  link.appendChild(document.createTextNode(app.name));
  return link;
}

/* The panel that gets mounted on the phone's screen. */
export function buildContactPanel(): HTMLElement {
  const panel = el("section", "panel");
  panel.id = `panel-${PanelId.Contact}`;
  panel.setAttribute("aria-label", "Contact");
  panel.appendChild(el("p", "phone__time", "9:41"));
  const apps = el("div", "phone__apps");
  for (const app of APPS) apps.appendChild(buildApp(app));
  panel.appendChild(apps);
  return panel;
}
