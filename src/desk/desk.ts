/* Builds the desk from scene.ts and handles hover / select / zoom. */

import { BACKGROUND, ITEMS, ViewKind, type Item, type PanelId, type Photo, type Rect, type SelectableItem, type View } from "./scene.js";

const ZOOM_MS = 700;
const FADE_MS = 300;
const MAX_ZOOM = 10;
/* Show the panel part-way through the zoom rather than after it lands. */
const PANEL_REVEAL_MS = ZOOM_MS * 0.7;

/* How much of the viewport a zoomed item may fill (fraction of width / height). */
const OVERLAY_FIT = { w: 0.4, h: 0.55 };
const SIDE_FIT = { w: 0.4, h: 0.7 };

/* Which half of the viewport a side panel takes. Values match `data-side` in desk.css. */
const PanelSide = {
  Left: "left",
  Right: "right",
} as const;
type PanelSide = (typeof PanelSide)[keyof typeof PanelSide];

function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

const stage = getElement<HTMLDivElement>("stage");
const panels = getElement<HTMLDivElement>("panels");
const backButton = getElement<HTMLButtonElement>("back");
const label = getElement<HTMLDivElement>("label");

interface OpenState {
  item: SelectableItem;
  wrapper: HTMLElement;
  panel: HTMLElement;
}

let open: OpenState | null = null;

function percentStyle(r: Rect): string {
  return `left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%`;
}

/* ----- Building the scene ----- */

function buildScene(): void {
  stage.appendChild(buildBackground());
  for (const item of ITEMS) stage.appendChild(buildItem(item));
}

function buildBackground(): HTMLImageElement {
  const bg = document.createElement("img");
  bg.src = BACKGROUND;
  bg.alt = "";
  bg.className = "stage__bg";
  return bg;
}

function buildItem(item: Item): HTMLElement {
  const wrapper = buildItemWrapper(item);
  const image = buildItemImage(item);

  if (!item.selectable) {
    buildItemDecor(image, wrapper);
    return wrapper;
  }

  buildItemButton(wrapper, item, image);
  if (item.photo) buildItemPhoto(item.photo, wrapper);
  if (item.view.kind === ViewKind.Screen) buildItemScreen(item.panel, item.view.screen, wrapper);
  return wrapper;
}

function buildItemWrapper(item: Item): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "item " + (item.selectable ? "item--select" : "item--decor");
  wrapper.style.cssText = percentStyle(item);
  wrapper.dataset["id"] = item.id;
  return wrapper;
}

function buildItemImage(item: Item): HTMLImageElement {
  const image = document.createElement("img");
  image.src = item.src;
  image.alt = "";
  image.draggable = false;
  return image;
}

function buildItemDecor(image: HTMLImageElement, wrapper: HTMLElement): void {
  wrapper.appendChild(image);
}

function buildItemButton(wrapper: HTMLElement, item: SelectableItem, image: HTMLImageElement): void {
  const hit = document.createElement("button");
  hit.className = "item__hit";
  hit.setAttribute("aria-label", item.label);
  hit.appendChild(image);
  hit.addEventListener("click", () => zoomTo(item, wrapper));
  hit.addEventListener("mouseenter", () => showLabel(item));
  hit.addEventListener("focus", () => showLabel(item));
  hit.addEventListener("mouseleave", hideLabel);
  hit.addEventListener("blur", hideLabel);
  wrapper.appendChild(hit);
}

function buildItemPhoto(photo: Photo, wrapper: HTMLElement): void {
  const img = document.createElement("img");
  img.className = "item__photo";
  img.src = photo.src;
  img.alt = photo.alt;
  img.draggable = false;
  img.style.cssText = percentStyle(photo);
  wrapper.appendChild(img);
}

/* Move the panel onto the object so its content lives on the screen. */
function buildItemScreen(panelId: PanelId, area: Rect, wrapper: HTMLElement): void {
  const screen = document.createElement("div");
  screen.className = "screen";
  screen.style.cssText = percentStyle(area);
  const panel = getElement(`panel-${panelId}`);
  panel.hidden = false;
  panel.classList.add("panel--screen");
  screen.appendChild(panel);
  wrapper.appendChild(screen);
}

/* ----- Hover label ----- */

function showLabel(item: SelectableItem): void {
  if (open) return;
  label.textContent = item.label;
  label.classList.add("label--visible");
  positionLabelAbove(item);
}

function positionLabelAbove(item: Item): void {
  const rect = stage.getBoundingClientRect();
  label.style.left = `${rect.left + ((item.x + item.w / 2) / 100) * rect.width}px`;
  label.style.top = `${rect.top + (item.y / 100) * rect.height}px`;
}

function hideLabel(): void {
  label.classList.remove("label--visible");
}

/* ----- Zoom maths ----- */

/*
 * Where to point the stage: (cx, cy) is the centre of the box being framed,
 * in percent of the stage; (ax, ay) is where that centre should land, in percent
 * of the viewport; scale is the zoom factor.
 */
interface ZoomTarget {
  scale: number;
  cx: number;
  cy: number;
  ax: number;
  ay: number;
}

const VIEWPORT_CENTRE = { x: 50, y: 50 };

function centreOf(r: Rect): { cx: number; cy: number } {
  return { cx: r.x + r.w / 2, cy: r.y + r.h / 2 };
}

/* Scale at which a box fills at most `fit.w` / `fit.h` of the viewport. */
function scaleToFit(box: Rect, fit: { w: number; h: number }): number {
  return Math.min(MAX_ZOOM, fit.w / (box.w / 100), fit.h / (box.h / 100));
}

/* An item-relative rect (percent of the item) as a stage-relative rect. */
function toStageRect(item: Rect, inner: Rect): Rect {
  return {
    x: item.x + (inner.x / 100) * item.w,
    y: item.y + (inner.y / 100) * item.h,
    w: (inner.w / 100) * item.w,
    h: (inner.h / 100) * item.h,
  };
}

function zoomTarget(item: SelectableItem): ZoomTarget {
  const view = item.view;
  switch (view.kind) {
    case ViewKind.Screen: {
      const area = toStageRect(item, view.screen);
      const scale = scaleToFit(area, { w: view.fit, h: view.fit });
      return { scale, ...centreOf(area), ax: VIEWPORT_CENTRE.x, ay: VIEWPORT_CENTRE.y };
    }
    case ViewKind.Side:
      return { scale: scaleToFit(item, SIDE_FIT), ...centreOf(item), ax: view.anchor.x, ay: view.anchor.y };
    case ViewKind.Overlay:
      return { scale: scaleToFit(item, OVERLAY_FIT), ...centreOf(item), ax: VIEWPORT_CENTRE.x, ay: VIEWPORT_CENTRE.y };
  }
}

/* ----- Zooming in and out ----- */

function applyZoom({ scale, cx, cy, ax, ay }: ZoomTarget): void {
  stage.style.transform = `translate(${ax - cx * scale}%, ${ay - cy * scale}%) scale(${scale})`;
  document.body.classList.add("zoomed");
}

function resetZoom(): void {
  stage.style.transform = "";
  document.body.classList.remove("zoomed");
}

function zoomTo(item: SelectableItem, wrapper: HTMLElement): void {
  if (open) return;
  hideLabel();
  applyZoom(zoomTarget(item));

  const current: OpenState = { item, wrapper, panel: getElement(`panel-${item.panel}`) };
  open = current;

  window.setTimeout(() => {
    if (open !== current) return; // closed again before the zoom landed
    showContent(current);
    backButton.focus();
  }, PANEL_REVEAL_MS);
}

/* Screen content fades in on the object; other panels fade in over the scene. */
function showContent({ item, wrapper, panel }: OpenState): void {
  if (item.view.kind === ViewKind.Screen) {
    wrapper.classList.add("item--open");
    return;
  }
  panels.dataset["mode"] = item.view.kind;
  panels.dataset["side"] = panelSide(item.view);
  panel.hidden = false;
  panels.hidden = false;
  requestAnimationFrame(() => panels.classList.add("panels--open"));
}

/* Which half of the viewport the panel takes: the opposite one to the zoomed item. */
function panelSide(view: View): PanelSide {
  return view.kind === ViewKind.Side && view.anchor.x > 50 ? PanelSide.Left : PanelSide.Right;
}

function hideContent({ item, wrapper, panel }: OpenState): void {
  wrapper.classList.remove("item--open");
  panels.classList.remove("panels--open");
  if (item.view.kind === ViewKind.Screen) return;
  window.setTimeout(() => {
    panel.hidden = true;
    panels.hidden = true;
  }, FADE_MS);
}

function zoomOut(): void {
  if (!open) return;
  const closing = open;
  open = null;
  hideContent(closing);
  resetZoom();
}

backButton.addEventListener("click", zoomOut);
window.addEventListener("keydown", (e: KeyboardEvent) => {
  switch (e.key) {
    case "Escape":
      zoomOut();
  }
});

buildScene();
