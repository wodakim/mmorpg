import { createButton, createDiv, createPanel } from "./dom";
import { getOverlayRoot } from "./overlay";

export function showConstructionPopup(title: string, detail: string): void {
  const root = getOverlayRoot();
  const backdrop = createDiv("popup-backdrop");
  const panel = createPanel("center");
  panel.classList.add("popup-panel");

  const stack = createDiv("panel-stack");
  stack.append(
    createDiv("title", title),
    createDiv("subtitle", detail),
    createDiv("subtitle", "Ce module est branché mais encore en construction.")
  );

  const close = createButton("Fermer", "button");
  const closePopup = () => {
    backdrop.remove();
  };

  close.addEventListener("click", closePopup);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) {
      closePopup();
    }
  });

  panel.append(stack, close);
  backdrop.appendChild(panel);
  root.appendChild(backdrop);
}

