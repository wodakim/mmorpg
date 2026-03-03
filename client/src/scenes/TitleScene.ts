import Phaser from "phaser";
import { resetOverlay } from "../ui/overlay";

type TexturePlacement = {
  key: string;
  x: number;
  y: number;
  scale?: number;
  alpha?: number;
};

const TITLE_TEXTURES = {
  frameTop: "title_frame_top",
  frameBottom: "title_frame_bottom",
  frameLeft: "title_frame_left",
  frameRight: "title_frame_right",
  crystalPinkTall: "title_crystal_pink_tall",
  crystalBlueTall: "title_crystal_blue_tall",
  crystalPinkPedestal: "title_crystal_pink_pedestal",
  crystalBluePedestal: "title_crystal_blue_pedestal",
  sparkleCenter: "title_sparkle_center",
  flameLargeA: "title_flame_large_a",
  flameLargeB: "title_flame_large_b",
  flameLargeC: "title_flame_large_c",
  flameLargeD: "title_flame_large_d",
  flameSmallA: "title_flame_small_a",
  flameSmallB: "title_flame_small_b"
} as const;

const TITLE_TEXTURE_LOADS: Array<{ key: string; path: string }> = [
  { key: TITLE_TEXTURES.frameTop, path: "assets/title/frame/asset_frame_bar_top_gem.png" },
  { key: TITLE_TEXTURES.frameBottom, path: "assets/title/frame/asset_frame_bar_bottom_gem.png" },
  { key: TITLE_TEXTURES.frameLeft, path: "assets/title/frame/asset_frame_bar_left_gem.png" },
  { key: TITLE_TEXTURES.frameRight, path: "assets/title/frame/asset_frame_bar_right_gem.png" },
  { key: TITLE_TEXTURES.crystalPinkTall, path: "assets/title/vfx/asset_crystal_pink_tall.png" },
  { key: TITLE_TEXTURES.crystalBlueTall, path: "assets/title/vfx/asset_crystal_blue_tall.png" },
  { key: TITLE_TEXTURES.crystalPinkPedestal, path: "assets/title/vfx/asset_crystal_pink_pedestal.png" },
  { key: TITLE_TEXTURES.crystalBluePedestal, path: "assets/title/vfx/asset_crystal_blue_pedestal.png" },
  { key: TITLE_TEXTURES.sparkleCenter, path: "assets/title/vfx/asset_sparkle_center.png" },
  { key: TITLE_TEXTURES.flameLargeA, path: "assets/title/vfx/asset_flame_blue_large_a.png" },
  { key: TITLE_TEXTURES.flameLargeB, path: "assets/title/vfx/asset_flame_blue_large_b.png" },
  { key: TITLE_TEXTURES.flameLargeC, path: "assets/title/vfx/asset_flame_blue_large_c.png" },
  { key: TITLE_TEXTURES.flameLargeD, path: "assets/title/vfx/asset_flame_blue_large_d.png" },
  { key: TITLE_TEXTURES.flameSmallA, path: "assets/title/vfx/asset_flame_blue_small_a.png" },
  { key: TITLE_TEXTURES.flameSmallB, path: "assets/title/vfx/asset_flame_blue_small_b.png" }
];

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  preload(): void {
    for (const asset of TITLE_TEXTURE_LOADS) {
      this.load.image(asset.key, asset.path);
    }
  }

  create(): void {
    resetOverlay();

    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;
    const centerY = height / 2;

    this.cameras.main.setBackgroundColor("#0f1726");
    this.add.rectangle(centerX, centerY, width, height, 0x0f1726, 1);

    this.renderFrame(width, height);
    this.renderArcaneLights(width, height);

    const titleY = Math.max(90, height * 0.26);
    this.add
      .text(centerX, titleY, "MAESTRIA PIXEL", {
        fontFamily: "Press Start 2P",
        fontSize: width >= 360 ? "28px" : "24px",
        color: "#efe9cf",
        align: "center"
      })
      .setOrigin(0.5)
      .setShadow(0, 3, "#000000", 8, false, true);

    this.add
      .text(centerX, titleY + 34, "Boucle Infinie", {
        fontFamily: "Press Start 2P",
        fontSize: "12px",
        color: "#9fd7ff"
      })
      .setOrigin(0.5);

    const buttonWidth = Math.min(width - 30, 290);
    const buttonHeight = 64;
    const buttonY = Math.min(height - 110, centerY + 180);

    const startButton = this.add
      .rectangle(centerX, buttonY, buttonWidth, buttonHeight, 0x57c8ff, 0.88)
      .setStrokeStyle(3, 0xd3f5ff, 1)
      .setInteractive({ useHandCursor: false });

    const startLabel = this.add
      .text(centerX, buttonY, "Tap to Start", {
        fontFamily: "Press Start 2P",
        fontSize: "20px",
        color: "#001926"
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(centerX, buttonY + 48, "Touchez l'écran pour continuer", {
        fontFamily: "Press Start 2P",
        fontSize: "11px",
        color: "#9fd7ff"
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: [startButton, startLabel],
      alpha: { from: 1, to: 0.74 },
      yoyo: true,
      repeat: -1,
      duration: 920
    });

    let started = false;
    const startGame = () => {
      if (started) {
        return;
      }
      started = true;
      this.scene.start("MenuScene");
    };

    startButton.on("pointerdown", startGame);
    this.input.once("pointerdown", startGame);
    hint.setInteractive({ useHandCursor: false }).on("pointerdown", startGame);
  }

  private renderFrame(width: number, height: number): void {
    const centerX = width / 2;
    const topY = 34;
    const bottomY = height - 34;
    const leftX = 24;
    const rightX = width - 24;

    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameTop, x: centerX, y: topY, scale: 0.85 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameBottom, x: centerX, y: bottomY, scale: 0.85 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameLeft, x: leftX, y: height / 2, scale: 0.85 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameRight, x: rightX, y: height / 2, scale: 0.85 });
  }

  private renderArcaneLights(width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2;

    this.addTextureOrFallback({ key: TITLE_TEXTURES.crystalPinkTall, x: centerX - 116, y: centerY + 54, scale: 0.9, alpha: 0.9 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.crystalBlueTall, x: centerX + 116, y: centerY + 54, scale: 0.9, alpha: 0.9 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.crystalPinkPedestal, x: centerX - 60, y: centerY + 120, scale: 0.9, alpha: 0.95 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.crystalBluePedestal, x: centerX + 60, y: centerY + 120, scale: 0.9, alpha: 0.95 });

    const sparkle = this.addTextureOrFallback({ key: TITLE_TEXTURES.sparkleCenter, x: centerX, y: centerY + 10, scale: 0.9, alpha: 0.88 });
    this.tweens.add({
      targets: sparkle,
      alpha: { from: 0.5, to: 1 },
      scaleX: { from: 0.82, to: 1 },
      scaleY: { from: 0.82, to: 1 },
      yoyo: true,
      repeat: -1,
      duration: 1250,
      ease: "Sine.easeInOut"
    });

    const flames = [
      { key: TITLE_TEXTURES.flameLargeA, x: centerX - 164, y: centerY + 46 },
      { key: TITLE_TEXTURES.flameLargeB, x: centerX - 136, y: centerY + 78 },
      { key: TITLE_TEXTURES.flameLargeC, x: centerX + 136, y: centerY + 76 },
      { key: TITLE_TEXTURES.flameLargeD, x: centerX + 164, y: centerY + 46 },
      { key: TITLE_TEXTURES.flameSmallA, x: centerX - 184, y: centerY + 12 },
      { key: TITLE_TEXTURES.flameSmallB, x: centerX + 184, y: centerY + 12 }
    ];

    flames.forEach((entry, index) => {
      const flame = this.addTextureOrFallback({ key: entry.key, x: entry.x, y: entry.y, scale: 0.92, alpha: 0.85 });
      this.tweens.add({
        targets: flame,
        y: flame.y - 6,
        alpha: { from: 0.5, to: 0.95 },
        yoyo: true,
        repeat: -1,
        duration: 700 + index * 120,
        delay: index * 70,
        ease: "Sine.easeInOut"
      });
    });
  }

  private addTextureOrFallback(config: TexturePlacement): Phaser.GameObjects.GameObject & { x: number; y: number } {
    const { key, x, y, scale = 1, alpha = 1 } = config;

    if (this.textures.exists(key)) {
      return this.add.image(x, y, key).setScale(scale).setAlpha(alpha);
    }

    return this.add
      .rectangle(x, y, 16, 16, 0x57c8ff, 0.5)
      .setStrokeStyle(1, 0xd3f5ff, 0.8)
      .setScale(scale)
      .setAlpha(alpha);
  }
}
