import Phaser from "phaser";
import { resetOverlay } from "../ui/overlay";

type Placement = {
  key: string;
  x: number;
  y: number;
  originX?: number;
  originY?: number;
  scale?: number;
  alpha?: number;
  fallbackWidth?: number;
  fallbackHeight?: number;
  fallbackColor?: number;
  depth?: number;
};

type TwoFrameConfig = {
  keyA: string;
  keyB: string;
  x: number;
  y: number;
  intervalMs?: number;
  scale?: number;
  alpha?: number;
  depth?: number;
};

const SHOW_MOCKUP_OVERLAY = false;

const TITLE_TEXTURES = {
  mockup: "title_mockup",
  background: "title_background",

  frameCornerUpLeft: "title_frame_corner_up_left",
  frameCornerUpRight: "title_frame_corner_up_right",
  frameCornerDownLeft: "title_frame_corner_down_left",
  frameCornerDownRight: "title_frame_corner_down_right",
  frameBarHorizontal: "title_frame_bar_horizontal",
  frameBarVertical: "title_frame_bar_vertical",
  frameMiddleUp: "title_frame_middle_up",
  frameMiddleDown: "title_frame_middle_down",
  frameMiddleLeft: "title_frame_middle_left",
  frameMiddleRight: "title_frame_middle_right",
  frameDecorUpLeft: "title_frame_decor_up_left",
  frameDecorUpRight: "title_frame_decor_up_right",
  frameDecorDownLeft: "title_frame_decor_down_left",
  frameDecorDownRight: "title_frame_decor_down_right",
  frameDecorJewel: "title_frame_decor_jewel",

  brandingLogo: "title_branding_logo",
  brandingLogoBg01: "title_branding_logobg_01",
  brandingLogoBg02: "title_branding_logobg_02",
  brandingLogoBg2: "title_branding_logobg2",

  heroIdle01: "title_hero_idle_01",
  heroIdle02: "title_hero_idle_02",
  demonIdle01: "title_demon_idle_01",
  demonIdle02: "title_demon_idle_02",

  ctaButton: "title_cta_button",

  rayBlue01: "title_ray_blue_01",
  rayBlue02: "title_ray_blue_02",
  rayPurple01: "title_ray_purple_01",
  rayPurple02: "title_ray_purple_02",

  flame01: "title_flame_01",
  flame02: "title_flame_02",
  flame03: "title_flame_03",
  flame2_01: "title_flame2_01",
  flame2_02: "title_flame2_02",
  flame2_03: "title_flame2_03"
} as const;

const TITLE_TEXTURE_LOADS: Array<{ key: string; path: string }> = [
  { key: TITLE_TEXTURES.mockup, path: "assets/title/mockup/Mockup_titlescreen.png" },
  { key: TITLE_TEXTURES.background, path: "assets/title/background/asset_image_background_titlescreen.png" },

  { key: TITLE_TEXTURES.frameCornerUpLeft, path: "assets/title/frame/asset_ornement_corner_up_left.png" },
  { key: TITLE_TEXTURES.frameCornerUpRight, path: "assets/title/frame/asset_ornement_corner_up_right.png" },
  { key: TITLE_TEXTURES.frameCornerDownLeft, path: "assets/title/frame/asset_ornement_corner_down_left.png" },
  { key: TITLE_TEXTURES.frameCornerDownRight, path: "assets/title/frame/asset_ornement_corner_down_right.png" },
  { key: TITLE_TEXTURES.frameBarHorizontal, path: "assets/title/frame/asset_ornement_bar_horizontal.png" },
  { key: TITLE_TEXTURES.frameBarVertical, path: "assets/title/frame/asset_ornement_bar_vertical.png" },
  { key: TITLE_TEXTURES.frameMiddleUp, path: "assets/title/frame/asset_ornement_middle_up.png" },
  { key: TITLE_TEXTURES.frameMiddleDown, path: "assets/title/frame/asset_ornement_middle_down.png" },
  { key: TITLE_TEXTURES.frameMiddleLeft, path: "assets/title/frame/asset_ornement_middle_left.png" },
  { key: TITLE_TEXTURES.frameMiddleRight, path: "assets/title/frame/asset_ornement_middle_right.png" },
  { key: TITLE_TEXTURES.frameDecorUpLeft, path: "assets/title/frame/asset_ornement_decor_up_left.png" },
  { key: TITLE_TEXTURES.frameDecorUpRight, path: "assets/title/frame/asset_ornement_decor_up_right.png" },
  { key: TITLE_TEXTURES.frameDecorDownLeft, path: "assets/title/frame/asset_ornement_decor_down_left.png" },
  { key: TITLE_TEXTURES.frameDecorDownRight, path: "assets/title/frame/asset_ornement_decor_down_right.png" },
  { key: TITLE_TEXTURES.frameDecorJewel, path: "assets/title/frame/asset_ornement_decor_jewel.png" },

  { key: TITLE_TEXTURES.brandingLogo, path: "assets/title/branding/asset_branding_logo_sample_v01.png" },
  { key: TITLE_TEXTURES.brandingLogoBg01, path: "assets/title/branding/asset_branding_logobg_sprite_01.png" },
  { key: TITLE_TEXTURES.brandingLogoBg02, path: "assets/title/branding/asset_branding_logobg_sprite_02.png" },
  { key: TITLE_TEXTURES.brandingLogoBg2, path: "assets/title/branding/asset_branding_logobg2_sprite_01.png" },

  { key: TITLE_TEXTURES.heroIdle01, path: "assets/title/entities/asset_entity_character_hero_idle_sprite_01.png" },
  { key: TITLE_TEXTURES.heroIdle02, path: "assets/title/entities/asset_entity_character_hero_idle_sprite_02.png" },
  { key: TITLE_TEXTURES.demonIdle01, path: "assets/title/entities/asset_entity_enemy_demon_idle_sprite_01.png" },
  { key: TITLE_TEXTURES.demonIdle02, path: "assets/title/entities/asset_entity_enemy_demon_idle_sprite_02.png" },

  { key: TITLE_TEXTURES.ctaButton, path: "assets/title/cta/asset_btn_start_sample_v01.png" },

  { key: TITLE_TEXTURES.rayBlue01, path: "assets/title/vfx/asset_effect_blueray_sprite_01.png" },
  { key: TITLE_TEXTURES.rayBlue02, path: "assets/title/vfx/asset_effect_blueray_sprite_02.png" },
  { key: TITLE_TEXTURES.rayPurple01, path: "assets/title/vfx/asset_effect_purpleray_sprite_01.png" },
  { key: TITLE_TEXTURES.rayPurple02, path: "assets/title/vfx/asset_effect_purpleray_sprite_02.png" },
  { key: TITLE_TEXTURES.flame01, path: "assets/title/vfx/asset_effect_candleflamme_sprite_01.png" },
  { key: TITLE_TEXTURES.flame02, path: "assets/title/vfx/asset_effect_candleflamme_sprite_02.png" },
  { key: TITLE_TEXTURES.flame03, path: "assets/title/vfx/asset_effect_candleflamme_sprite_03.png" },
  { key: TITLE_TEXTURES.flame2_01, path: "assets/title/vfx/asset_effect_candleflamme2_sprite_01.png" },
  { key: TITLE_TEXTURES.flame2_02, path: "assets/title/vfx/asset_effect_candleflamme2_sprite_02.png" },
  { key: TITLE_TEXTURES.flame2_03, path: "assets/title/vfx/asset_effect_candleflamme2_sprite_03.png" }
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

    this.cameras.main.setBackgroundColor("#0a1833");

    this.addTextureOrFallback({
      key: TITLE_TEXTURES.background,
      x: centerX,
      y: height / 2,
      depth: 0,
      fallbackWidth: width,
      fallbackHeight: height,
      fallbackColor: 0x0a1833
    });

    if (SHOW_MOCKUP_OVERLAY && this.textures.exists(TITLE_TEXTURES.mockup)) {
      this.add.image(centerX, height / 2, TITLE_TEXTURES.mockup).setAlpha(0.25).setDepth(99);
    }

    this.renderFrame(width, height);
    this.renderBranding(width, height);
    this.renderEntities(width, height);
    this.renderBottomVfxAndCta(width, height);

    const hint = this.add
      .text(centerX, height * 0.9, "Touchez l'écran pour continuer", {
        fontFamily: "Press Start 2P",
        fontSize: "11px",
        color: "#eef3ff"
      })
      .setOrigin(0.5)
      .setDepth(50);

    let started = false;
    const startGame = () => {
      if (started) {
        return;
      }
      started = true;
      this.scene.start("MenuScene");
    };

    this.input.once("pointerdown", startGame);
    hint.setInteractive({ useHandCursor: false }).on("pointerdown", startGame);
  }

  private renderFrame(width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const sideInset = 14;
    const topInset = 14;
    const bottomInset = 14;

    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameBarHorizontal, x: centerX, y: topInset, originY: 0, depth: 40, fallbackWidth: width - 48, fallbackHeight: 24 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameBarHorizontal, x: centerX, y: height - bottomInset, originY: 1, depth: 40, fallbackWidth: width - 48, fallbackHeight: 24 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameBarVertical, x: sideInset, y: centerY, originX: 0, depth: 40, fallbackWidth: 24, fallbackHeight: height - 48 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameBarVertical, x: width - sideInset, y: centerY, originX: 1, depth: 40, fallbackWidth: 24, fallbackHeight: height - 48 });

    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameCornerUpLeft, x: sideInset, y: topInset, originX: 0, originY: 0, depth: 42 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameCornerUpRight, x: width - sideInset, y: topInset, originX: 1, originY: 0, depth: 42 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameCornerDownLeft, x: sideInset, y: height - bottomInset, originX: 0, originY: 1, depth: 42 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameCornerDownRight, x: width - sideInset, y: height - bottomInset, originX: 1, originY: 1, depth: 42 });

    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameMiddleUp, x: centerX, y: topInset, originY: 0, depth: 43 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameMiddleDown, x: centerX, y: height - bottomInset, originY: 1, depth: 43 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameMiddleLeft, x: sideInset, y: centerY, originX: 0, depth: 43 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameMiddleRight, x: width - sideInset, y: centerY, originX: 1, depth: 43 });

    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameDecorUpLeft, x: width * 0.22, y: height * 0.23, depth: 35 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameDecorUpRight, x: width * 0.78, y: height * 0.23, depth: 35 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameDecorDownLeft, x: width * 0.22, y: height * 0.72, depth: 35 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameDecorDownRight, x: width * 0.78, y: height * 0.72, depth: 35 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameDecorJewel, x: centerX, y: topInset + 16, depth: 45 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.frameDecorJewel, x: centerX, y: height - bottomInset - 16, depth: 45 });
  }

  private renderBranding(width: number, height: number): void {
    const centerX = width / 2;
    const logoY = height * 0.2;

    this.toggleTwoFrame({
      keyA: TITLE_TEXTURES.brandingLogoBg01,
      keyB: TITLE_TEXTURES.brandingLogoBg02,
      x: centerX,
      y: logoY - 4,
      intervalMs: 560,
      depth: 10,
      alpha: 0.85,
      scale: 0.95
    });

    this.addTextureOrFallback({ key: TITLE_TEXTURES.brandingLogo, x: centerX, y: logoY, depth: 20, fallbackWidth: 220, fallbackHeight: 64, fallbackColor: 0x223850 });
    this.addTextureOrFallback({ key: TITLE_TEXTURES.brandingLogoBg2, x: centerX - 95, y: logoY + 22, depth: 22, alpha: 0.9 });

    this.add
      .text(centerX, logoY + 92, "Boucle Infinie", {
        fontFamily: "Press Start 2P",
        fontSize: "16px",
        color: "#ffffff",
        stroke: "#0c1425",
        strokeThickness: 5
      })
      .setOrigin(0.5)
      .setDepth(25);

    this.add
      .text(centerX, logoY + 132, "MMORPG mobile portrait-first", {
        fontFamily: "Press Start 2P",
        fontSize: "11px",
        color: "#eef3ff",
        stroke: "#0c1425",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(25);
  }

  private renderEntities(width: number, height: number): void {
    this.toggleTwoFrame({
      keyA: TITLE_TEXTURES.heroIdle01,
      keyB: TITLE_TEXTURES.heroIdle02,
      x: width * 0.22,
      y: height * 0.78,
      intervalMs: 620,
      depth: 26,
      scale: 1
    });

    this.toggleTwoFrame({
      keyA: TITLE_TEXTURES.demonIdle01,
      keyB: TITLE_TEXTURES.demonIdle02,
      x: width * 0.78,
      y: height * 0.78,
      intervalMs: 620,
      depth: 26,
      scale: 1
    });
  }

  private renderBottomVfxAndCta(width: number, height: number): void {
    const centerX = width / 2;
    const ctaY = height * 0.82;

    this.toggleTwoFrame({ keyA: TITLE_TEXTURES.rayPurple01, keyB: TITLE_TEXTURES.rayPurple02, x: centerX - 40, y: ctaY - 16, intervalMs: 420, depth: 18, alpha: 0.95 });
    this.toggleTwoFrame({ keyA: TITLE_TEXTURES.rayBlue01, keyB: TITLE_TEXTURES.rayBlue02, x: centerX + 40, y: ctaY - 16, intervalMs: 420, depth: 18, alpha: 0.95 });

    this.cycleThreeFrame([TITLE_TEXTURES.flame01, TITLE_TEXTURES.flame02, TITLE_TEXTURES.flame03], centerX - 82, ctaY - 78, 260, 17);
    this.cycleThreeFrame([TITLE_TEXTURES.flame2_01, TITLE_TEXTURES.flame2_02, TITLE_TEXTURES.flame2_03], centerX + 82, ctaY - 78, 260, 17);

    const cta = this.addTextureOrFallback({
      key: TITLE_TEXTURES.ctaButton,
      x: centerX,
      y: ctaY,
      depth: 30,
      fallbackWidth: 280,
      fallbackHeight: 84,
      fallbackColor: 0x7a8ea5
    }).setInteractive({ useHandCursor: false });

    this.tweens.add({
      targets: cta,
      alpha: { from: 1, to: 0.86 },
      yoyo: true,
      repeat: -1,
      duration: 820
    });

    cta.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });
  }

  private toggleTwoFrame(config: TwoFrameConfig): void {
    const {
      keyA,
      keyB,
      x,
      y,
      intervalMs = 500,
      scale = 1,
      alpha = 1,
      depth = 0
    } = config;

    const frameA = this.addTextureOrFallback({ key: keyA, x, y, scale, alpha, depth, fallbackWidth: 22, fallbackHeight: 22 });
    const frameB = this.addTextureOrFallback({ key: keyB, x, y, scale, alpha: 0, depth, fallbackWidth: 22, fallbackHeight: 22 });

    this.time.addEvent({
      delay: intervalMs,
      loop: true,
      callback: () => {
        const nextA = frameA.alpha < 0.5 ? alpha : 0;
        frameA.setAlpha(nextA);
        frameB.setAlpha(nextA > 0 ? 0 : alpha);
      }
    });
  }

  private cycleThreeFrame(keys: string[], x: number, y: number, intervalMs: number, depth: number): void {
    const sprites = keys.map((key, index) =>
      this.addTextureOrFallback({
        key,
        x,
        y,
        alpha: index === 0 ? 0.92 : 0,
        depth,
        fallbackWidth: 20,
        fallbackHeight: 28,
        fallbackColor: 0x77d5ff
      })
    );

    let frameIndex = 0;
    this.time.addEvent({
      delay: intervalMs,
      loop: true,
      callback: () => {
        frameIndex = (frameIndex + 1) % sprites.length;
        sprites.forEach((sprite, index) => {
          sprite.setAlpha(index === frameIndex ? 0.92 : 0);
        });
      }
    });
  }

  private addTextureOrFallback(config: Placement): Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle {
    const {
      key,
      x,
      y,
      originX = 0.5,
      originY = 0.5,
      scale = 1,
      alpha = 1,
      fallbackWidth = 18,
      fallbackHeight = 18,
      fallbackColor = 0x4c81b8,
      depth = 0
    } = config;

    if (this.textures.exists(key)) {
      return this.add.image(x, y, key).setOrigin(originX, originY).setScale(scale).setAlpha(alpha).setDepth(depth);
    }

    return this.add
      .rectangle(x, y, fallbackWidth, fallbackHeight, fallbackColor, alpha)
      .setOrigin(originX, originY)
      .setScale(scale)
      .setDepth(depth)
      .setStrokeStyle(1, 0xe4f3ff, 0.7);
  }
}
