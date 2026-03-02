import Phaser from "phaser";
import { resetOverlay } from "../ui/overlay";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  create(): void {
    resetOverlay();

    this.cameras.main.setBackgroundColor("#182124");
    this.add.rectangle(144, 256, 288, 512, 0x20343d, 1);
    this.add.text(144, 164, "MAESTRIA PIXEL", {
      fontFamily: "Trebuchet MS",
      fontSize: "26px",
      color: "#f6f1d8"
    }).setOrigin(0.5);
    this.add.text(144, 200, "Boucle Infinie", {
      fontFamily: "Trebuchet MS",
      fontSize: "14px",
      color: "#8acb88"
    }).setOrigin(0.5);
    this.add.text(144, 280, "Tap to Start", {
      fontFamily: "Trebuchet MS",
      fontSize: "18px",
      color: "#f6f1d8"
    }).setOrigin(0.5);
    this.add.text(144, 318, "Portrait-first Android MMORPG skeleton", {
      fontFamily: "Trebuchet MS",
      fontSize: "12px",
      color: "#c6ddb8",
      align: "center"
    }).setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("MenuScene");
    });
  }
}
