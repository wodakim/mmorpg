export function clearNode(node: HTMLElement): void {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

export function createPanel(position: "top" | "center" | "bottom"): HTMLDivElement {
  const panel = document.createElement("div");
  panel.className = `overlay-panel ${position}`;
  return panel;
}

export function createButton(label: string, className = "button"): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  return button;
}

export function createInput(placeholder: string, value = "", maxLength = 16): HTMLInputElement {
  const input = document.createElement("input");
  input.className = "input";
  input.value = value;
  input.placeholder = placeholder;
  input.autocomplete = "off";
  input.spellcheck = false;
  input.maxLength = maxLength;
  return input;
}

export function createTextArea(placeholder: string): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  textarea.className = "textarea";
  textarea.placeholder = placeholder;
  textarea.maxLength = 140;
  return textarea;
}

export function createDiv(className: string, text?: string): HTMLDivElement {
  const div = document.createElement("div");
  div.className = className;
  if (text) {
    div.textContent = text;
  }
  return div;
}
