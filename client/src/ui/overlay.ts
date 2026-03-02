import { clearNode } from "./dom";

export function getOverlayRoot(): HTMLDivElement {
  const root = document.getElementById("overlay-root");
  if (!(root instanceof HTMLDivElement)) {
    throw new Error("Missing overlay root");
  }
  return root;
}

export function resetOverlay(): HTMLDivElement {
  const root = getOverlayRoot();
  clearNode(root);
  return root;
}
