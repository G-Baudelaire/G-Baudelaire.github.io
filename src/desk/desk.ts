/* Builds the desk from scene.ts and handles hover / select / zoom. */

import { BACKGROUND, ITEMS, type Item, type SelectableItem } from "./scene.js";

const ZOOM_MS = 700;
const MAX_ZOOM = 4;

function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

const stage = getElement<HTMLDivElement>("stage");
const panels = getElement<HTMLDivElement>("panels");
const backButton = getElement<HTMLButtonElement>("back");
const label = getElement<HTMLDivElement>("label");

let openPanel: HTMLElement | null = null;

function buildItem(item: Item): HTMLElement {
  const box = document.createElement(item.selectable ? "button" : "div");
  box.className = "item " + (item.selectable ? "item--select" : "item--decor");
  box.style.cssText = `left:${item.x}%;top:${item.y}%;width:${item.w}%;height:${item.h}%`;
  box.dataset.id = item.id;

  const img = document.createElement("img");
  img.src = item.src;
  img.alt = "";
  img.draggable = false;
  box.appendChild(img);

  if (item.selectable) {
    box.setAttribute("aria-label", item.label);
    box.addEventListener("click", () => zoomTo(item));
    box.addEventListener("mouseenter", () => showLabel(item));
    box.addEventListener("focus", () => showLabel(item));
    box.addEventListener("mouseleave", hideLabel);
    box.addEventListener("blur", hideLabel);
  }
  return box;
}

function buildScene(): void {
  const bg = document.createElement("img");
  bg.src = BACKGROUND;
  bg.alt = "";
  bg.className = "stage__bg";
  stage.appendChild(bg);

  for (const item of ITEMS) stage.appendChild(buildItem(item));
}

function showLabel(item: SelectableItem): void {
  if (openPanel) return;
  label.textContent = item.label;
  label.classList.add("label--visible");
  const rect = stage.getBoundingClientRect();
  label.style.left = `${rect.left + ((item.x + item.w / 2) / 100) * rect.width}px`;
  label.style.top = `${rect.top + (item.y / 100) * rect.height}px`;
}

function hideLabel(): void {
  label.classList.remove("label--visible");
}

/* Zoom the stage so the item is centred and fills a good share of the view. */
function zoomTo(item: SelectableItem): void {
  if (openPanel) return;
  hideLabel();
  const scale = Math.min(MAX_ZOOM, 0.4 / (item.w / 100), 0.55 / (item.h / 100));
  const cx = item.x + item.w / 2;
  const cy = item.y + item.h / 2;
  stage.style.transform =
    `translate(${50 - cx * scale}%, ${50 - cy * scale}%) scale(${scale})`;
  document.body.classList.add("zoomed");

  openPanel = getElement(`panel-${item.panel}`);
  window.setTimeout(() => {
    if (!openPanel) return;
    openPanel.hidden = false;
    panels.hidden = false;
    requestAnimationFrame(() => panels.classList.add("panels--open"));
    backButton.focus();
  }, ZOOM_MS * 0.7);
}

function zoomOut(): void {
  if (!openPanel) return;
  panels.classList.remove("panels--open");
  const closing = openPanel;
  openPanel = null;
  stage.style.transform = "";
  document.body.classList.remove("zoomed");
  window.setTimeout(() => {
    closing.hidden = true;
    panels.hidden = true;
  }, 300);
}

backButton.addEventListener("click", zoomOut);
window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape") zoomOut();
});

buildScene();
