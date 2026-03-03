import Phaser from "phaser";
import { USERNAME_REGEX } from "@maestria/shared";
import { getSession, updateSession } from "../state/session";
import { createButton, createDiv, createInput, createPanel } from "../ui/dom";
import { resetOverlay } from "../ui/overlay";
import { showConstructionPopup } from "../ui/popup";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    const session = getSession();
    const overlay = resetOverlay();

    this.cameras.main.setBackgroundColor("#0f1719");

    const panel = createPanel("center");
    panel.classList.add("menu-screen-panel");
    const stack = createDiv("menu-stack");
    const title = createDiv("title", "Guest Login");
    const subtitle = createDiv("subtitle", "Pseudo: 3 to 16 chars, letters, digits, _ or -");
    const input = createInput("Enter nickname", session.username);
    const error = createDiv("subtitle");
    const button = createButton("Continue");
    const settings = createButton("Paramètres", "button secondary");

    button.addEventListener("click", () => {
      const username = input.value.trim();
      if (!USERNAME_REGEX.test(username)) {
        error.textContent = "Invalid nickname";
        return;
      }
      updateSession({ username });
      this.scene.start("CharCreateScene");
    });

    settings.addEventListener("click", () => {
      showConstructionPopup("Paramètres", "Le menu options Android (audio, qualité, contrôles) arrive dans le prochain sprint.");
    });

    stack.append(title, subtitle, input, button, settings, error);
    panel.appendChild(stack);
    overlay.appendChild(panel);
  }
}
