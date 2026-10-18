/*
 * The monitor: its place on the desk and the project tiles drawn on its screen.
 * The tiles are always on screen; zooming in just lets you see and use them.
 */

import { PanelId, ViewKind, type SelectableItem } from "./scene.js";
import { PROJECTS, type Project } from "./projects.js";

const GITHUB_ICON = "../images/github.svg";

export const MONITOR_ITEM: SelectableItem = {
  id: "monitor", label: "Projects", src: "assets/monitor.svg",
  x: 28, y: 12.4, w: 36, h: 45.6,
  selectable: true, panel: PanelId.Projects,
  view: { kind: ViewKind.Screen, screen: { x: 3.8, y: 5.4, w: 92.4, h: 73.2 }, fit: 0.8, persistent: true },
};

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function buildLink(href: string, className: string): HTMLAnchorElement {
  const link = el("a", className);
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener";
  return link;
}

function buildLogo(project: Project): HTMLElement {
  const slot = el("div", "tile__logo");
  const img = el("img", "tile__img");
  img.src = project.image.src;
  img.alt = project.image.alt;
  img.draggable = false;
  slot.appendChild(img);
  return slot;
}

function buildLinks(project: Project): HTMLElement {
  const links = el("div", "tile__links");

  const source = buildLink(project.links.source, "tile__source");
  source.setAttribute("aria-label", `${project.name} source code on GitHub`);
  const icon = el("img", "tile__github");
  icon.src = GITHUB_ICON;
  icon.alt = "";
  source.appendChild(icon);
  links.appendChild(source);

  if (project.links.site) {
    const site = buildLink(project.links.site, "tile__site");
    site.textContent = "Visit site →";
    links.appendChild(site);
  }
  return links;
}

function buildTile(project: Project): HTMLElement {
  const tile = el("article", "tile");
  tile.appendChild(buildLogo(project));
  tile.appendChild(el("h3", "tile__name", project.name));
  const body = el("div", "tile__body");
  body.appendChild(el("p", "tile__desc", project.description));
  body.appendChild(buildLinks(project));
  tile.appendChild(body);
  return tile;
}

/* The panel that gets mounted on the monitor's screen. */
export function buildProjectsPanel(): HTMLElement {
  const panel = el("section", "panel");
  panel.id = `panel-${PanelId.Projects}`;
  panel.setAttribute("aria-label", "Projects");
  const grid = el("div", "tiles");
  for (const project of PROJECTS) grid.appendChild(buildTile(project));
  panel.appendChild(grid);
  return panel;
}
