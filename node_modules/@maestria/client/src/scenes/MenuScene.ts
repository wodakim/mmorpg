import Phaser from "phaser";
import { USERNAME_REGEX } from "@maestria/shared";
import { getSession, updateSession } from "../state/session";
import { createButton, createDiv, createInput, createPanel } from "../ui/dom";
import { resetOverlay } from "../ui/overlay";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    const session = getSession();
    const overlay = resetOverlay();

    this.cameras.main.setBackgroundColor("#0f1719");
    this.add.text(144, 90, "Guest Login", {
      fontFamily: "Trebuchet MS",
      fontSize: "24px",
      color: "#f6f1d8"
    }).setOrigin(0.5);
    this.add.text(144, 120, "Desktop is debug-only. Build for thumbs first.", {
      fontFamily: "Trebuchet MS",
      fontSize: "12px",
      color: "#c6ddb8",
      align: "center"
    }).setOrigin(0.5);

    const panel = createPanel("center");
    const stack = createDiv("menu-stack");
    const title = createDiv("title", "Guest Login");
    const subtitle = createDiv("subtitle", "Pseudo: 3 to 16 chars, letters, digits, _ or -");
    const input = createInput("Enter nickname", session.username);
    const error = createDiv("subtitle");
    const button = createButton("Continue");

    button.addEventListener("click", () => {
      const username = input.value.trim();
      if (!USERNAME_REGEX.test(username)) {
        error.textContent = "Invalid nickname";
        return;
      }
      updateSession({ username });
      this.scene.start("CharCreateScene");
    });

    stack.append(title, subtitle, input, button, error);
    panel.appendChild(stack);
    overlay.appendChild(panel);
  }
}
