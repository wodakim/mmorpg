import Phaser from "phaser";
import { network } from "../net/NetworkManager";
import { getSession, updateSession } from "../state/session";
import { BODY_COLORS, HAIR_COLORS, PANTS_COLORS } from "../utils/colors";
import { createButton, createDiv, createPanel } from "../ui/dom";
import { resetOverlay } from "../ui/overlay";

export class CharCreateScene extends Phaser.Scene {
  private preview?: Phaser.GameObjects.Container;

  constructor() {
    super("CharCreateScene");
  }

  create(): void {
    const overlay = resetOverlay();
    const session = getSession();
    this.cameras.main.setBackgroundColor("#1b2427");

    this.add.text(144, 60, "Character Create", {
      fontFamily: "Trebuchet MS",
      fontSize: "22px",
      color: "#f6f1d8"
    }).setOrigin(0.5);

    this.preview = this.makePreview(144, 180);
    this.redrawPreview();

    const panel = createPanel("bottom");
    const stack = createDiv("menu-stack");
    const title = createDiv("subtitle", "Choose one color in each row");
    const hairRow = createDiv("row");
    const bodyRow = createDiv("row");
    const pantsRow = createDiv("row");
    const confirm = createButton("Enter World");
    const back = createButton("Back", "button secondary");
    const status = createDiv("subtitle");

    HAIR_COLORS.forEach((_, index) => hairRow.appendChild(this.makeColorButton("Hair", index, () => {
      const current = getSession();
      updateSession({ colors: { hair: index, body: current.colors.body, pants: current.colors.pants } });
      this.redrawPreview();
    })));
    BODY_COLORS.forEach((_, index) => bodyRow.appendChild(this.makeColorButton("Body", index, () => {
      updateSession({ colors: { hair: getSession().colors.hair, body: index, pants: getSession().colors.pants } });
      this.redrawPreview();
    })));
    PANTS_COLORS.forEach((_, index) => pantsRow.appendChild(this.makeColorButton("Pants", index, () => {
      updateSession({ colors: { hair: getSession().colors.hair, body: getSession().colors.body, pants: index } });
      this.redrawPreview();
    })));

    back.addEventListener("click", () => this.scene.start("MenuScene"));
    confirm.addEventListener("click", async () => {
      status.textContent = "Connecting...";
      confirm.disabled = true;
      try {
        await network.connectAndAuth(getSession());
        this.scene.start("GameScene");
      } catch (error) {
        status.textContent = (error as Error).message;
        confirm.disabled = false;
      }
    });

    stack.append(
      title,
      createDiv("subtitle", "Hair"),
      hairRow,
      createDiv("subtitle", "Body"),
      bodyRow,
      createDiv("subtitle", "Pants"),
      pantsRow,
      confirm,
      back,
      status
    );
    panel.appendChild(stack);
    overlay.appendChild(panel);
  }

  private makeColorButton(label: string, index: number, onClick: () => void): HTMLButtonElement {
    const button = createButton(`${label} ${index + 1}`, "button small secondary");
    button.addEventListener("click", onClick);
    return button;
  }

  private makePreview(x: number, y: number): Phaser.GameObjects.Container {
    const shadow = this.add.rectangle(0, 30, 54, 12, 0x0d1114, 0.5);
    const pants = this.add.rectangle(0, 10, 18, 16, 0xffffff);
    const body = this.add.rectangle(0, -8, 18, 20, 0xffffff);
    const hair = this.add.rectangle(0, -24, 18, 10, 0xffffff);
    return this.add.container(x, y, [shadow, pants, body, hair]);
  }

  private redrawPreview(): void {
    const preview = this.preview;
    if (!preview) {
      return;
    }
    const colors = getSession().colors;
    (preview.list[1] as Phaser.GameObjects.Rectangle).setFillStyle(PANTS_COLORS[colors.pants]);
    (preview.list[2] as Phaser.GameObjects.Rectangle).setFillStyle(BODY_COLORS[colors.body]);
    (preview.list[3] as Phaser.GameObjects.Rectangle).setFillStyle(HAIR_COLORS[colors.hair]);
  }
}
