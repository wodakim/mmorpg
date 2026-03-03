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

type LayoutMetrics = {
  baseX: number;
  baseY: number;
  scale: number;
  width: number;
  height: number;
};

const REF_WIDTH = 1024;
const REF_HEIGHT = 2400;

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

    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;
    const layout = this.computeLayout(screenWidth, screenHeight);

    this.cameras.main.setBackgroundColor("#0a1833");

    this.addTextureOrFallback({
      key: TITLE_TEXTURES.background,
      x: screenWidth / 2,
      y: screenHeight / 2,
      depth: 0,
      fallbackWidth: screenWidth,
      fallbackHeight: screenHeight,
      fallbackColor: 0x0a1833
    });

    this.add.rectangle(screenWidth / 2, screenHeight / 2, screenWidth, screenHeight, 0x081428, 0.22).setDepth(1);

    if (SHOW_MOCKUP_OVERLAY && this.textures.exists(TITLE_TEXTURES.mockup)) {
      this.placeByRef({ key: TITLE_TEXTURES.mockup, x: REF_WIDTH / 2, y: REF_HEIGHT / 2, depth: 98, alpha: 0.3 }, layout, REF_HEIGHT / this.getTextureHeight(TITLE_TEXTURES.mockup));
    }

    this.renderFrame(layout);
    this.renderBranding(layout);
    this.renderEntities(layout);
    this.renderBottomVfxAndCta(layout);

    const hintFont = `${Math.max(11, Math.round(28 * layout.scale))}px`;
    const hint = this.add
      .text(layout.baseX + REF_WIDTH / 2 * layout.scale, layout.baseY + 2130 * layout.scale, "Touchez l'écran pour continuer", {
        fontFamily: "Press Start 2P",
        fontSize: hintFont,
        color: "#eef3ff",
        stroke: "#0c1425",
        strokeThickness: Math.max(2, Math.round(layout.scale * 6))
      })
      .setOrigin(0.5)
      .setDepth(60);

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

  private computeLayout(screenWidth: number, screenHeight: number): LayoutMetrics {
    const scale = Math.max(0.2, Math.min(screenWidth / REF_WIDTH, screenHeight / REF_HEIGHT));
    const width = Math.floor(REF_WIDTH * scale);
    const height = Math.floor(REF_HEIGHT * scale);

    return {
      scale,
      width,
      height,
      baseX: Math.floor((screenWidth - width) / 2),
      baseY: Math.floor((screenHeight - height) / 2)
    };
  }

  private renderFrame(layout: LayoutMetrics): void {
    const topY = 0;
    const bottomY = REF_HEIGHT;
    const leftX = 0;
    const rightX = REF_WIDTH;

    this.placeByRef({ key: TITLE_TEXTURES.frameBarHorizontal, x: REF_WIDTH / 2, y: topY, originY: 0, depth: 40, fallbackWidth: REF_WIDTH - 120, fallbackHeight: 54 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.frameBarHorizontal, x: REF_WIDTH / 2, y: bottomY, originY: 1, depth: 40, fallbackWidth: REF_WIDTH - 120, fallbackHeight: 54 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.frameBarVertical, x: leftX, y: REF_HEIGHT / 2, originX: 0, depth: 40, fallbackWidth: 56, fallbackHeight: REF_HEIGHT - 120 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.frameBarVertical, x: rightX, y: REF_HEIGHT / 2, originX: 1, depth: 40, fallbackWidth: 56, fallbackHeight: REF_HEIGHT - 120 }, layout);

    this.placeByRef({ key: TITLE_TEXTURES.frameCornerUpLeft, x: leftX, y: topY, originX: 0, originY: 0, depth: 45 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.frameCornerUpRight, x: rightX, y: topY, originX: 1, originY: 0, depth: 45 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.frameCornerDownLeft, x: leftX, y: bottomY, originX: 0, originY: 1, depth: 45 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.frameCornerDownRight, x: rightX, y: bottomY, originX: 1, originY: 1, depth: 45 }, layout);

    this.placeByRef({ key: TITLE_TEXTURES.frameMiddleUp, x: REF_WIDTH / 2, y: topY, originY: 0, depth: 46 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.frameMiddleDown, x: REF_WIDTH / 2, y: bottomY, originY: 1, depth: 46 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.frameMiddleLeft, x: leftX, y: REF_HEIGHT / 2, originX: 0, depth: 46 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.frameMiddleRight, x: rightX, y: REF_HEIGHT / 2, originX: 1, depth: 46 }, layout);

    this.placeByRef({ key: TITLE_TEXTURES.frameDecorUpLeft, x: 140, y: 630, depth: 44 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.frameDecorUpRight, x: 884, y: 630, depth: 44 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.frameDecorDownLeft, x: 140, y: 1690, depth: 44 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.frameDecorDownRight, x: 884, y: 1690, depth: 44 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.frameDecorJewel, x: REF_WIDTH / 2, y: 70, depth: 47 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.frameDecorJewel, x: REF_WIDTH / 2, y: REF_HEIGHT - 70, depth: 47 }, layout);
  }

  private renderBranding(layout: LayoutMetrics): void {
    const centerX = REF_WIDTH / 2;
    const logoY = 430;

    this.toggleTwoFrame({
      keyA: TITLE_TEXTURES.brandingLogoBg01,
      keyB: TITLE_TEXTURES.brandingLogoBg02,
      x: layout.baseX + centerX * layout.scale,
      y: layout.baseY + logoY * layout.scale,
      intervalMs: 580,
      depth: 12,
      alpha: 0.95,
      scale: layout.scale
    });

    this.placeByRef({ key: TITLE_TEXTURES.brandingLogo, x: centerX, y: logoY, depth: 20, fallbackWidth: 520, fallbackHeight: 210, fallbackColor: 0x223850 }, layout);
    this.placeByRef({ key: TITLE_TEXTURES.brandingLogoBg2, x: 310, y: 660, depth: 24, alpha: 0.92 }, layout);

    const titleFont = `${Math.max(11, Math.round(42 * layout.scale))}px`;
    const subFont = `${Math.max(10, Math.round(28 * layout.scale))}px`;

    this.add
      .text(layout.baseX + centerX * layout.scale, layout.baseY + 860 * layout.scale, "Boucle Infinie", {
        fontFamily: "Press Start 2P",
        fontSize: titleFont,
        color: "#ffffff",
        stroke: "#0c1425",
        strokeThickness: Math.max(2, Math.round(layout.scale * 8))
      })
      .setOrigin(0.5)
      .setDepth(25);

    this.add
      .text(layout.baseX + centerX * layout.scale, layout.baseY + 980 * layout.scale, "MMORPG mobile portrait-first", {
        fontFamily: "Press Start 2P",
        fontSize: subFont,
        color: "#eef3ff",
        stroke: "#0c1425",
        strokeThickness: Math.max(2, Math.round(layout.scale * 7))
      })
      .setOrigin(0.5)
      .setDepth(25);
  }

  private renderEntities(layout: LayoutMetrics): void {
    this.toggleTwoFrame({
      keyA: TITLE_TEXTURES.heroIdle01,
      keyB: TITLE_TEXTURES.heroIdle02,
      x: layout.baseX + 170 * layout.scale,
      y: layout.baseY + 1770 * layout.scale,
      intervalMs: 620,
      depth: 28,
      scale: layout.scale
    });

    this.toggleTwoFrame({
      keyA: TITLE_TEXTURES.demonIdle01,
      keyB: TITLE_TEXTURES.demonIdle02,
      x: layout.baseX + 854 * layout.scale,
      y: layout.baseY + 1770 * layout.scale,
      intervalMs: 620,
      depth: 28,
      scale: layout.scale
    });
  }

  private renderBottomVfxAndCta(layout: LayoutMetrics): void {
    const centerX = layout.baseX + REF_WIDTH / 2 * layout.scale;
    const ctaY = layout.baseY + 1935 * layout.scale;

    this.toggleTwoFrame({ keyA: TITLE_TEXTURES.rayPurple01, keyB: TITLE_TEXTURES.rayPurple02, x: centerX - 85 * layout.scale, y: ctaY - 36 * layout.scale, intervalMs: 420, depth: 18, alpha: 0.96, scale: layout.scale });
    this.toggleTwoFrame({ keyA: TITLE_TEXTURES.rayBlue01, keyB: TITLE_TEXTURES.rayBlue02, x: centerX + 85 * layout.scale, y: ctaY - 36 * layout.scale, intervalMs: 420, depth: 18, alpha: 0.96, scale: layout.scale });

    this.cycleThreeFrame([TITLE_TEXTURES.flame01, TITLE_TEXTURES.flame02, TITLE_TEXTURES.flame03], centerX - 140 * layout.scale, ctaY - 135 * layout.scale, 260, 19, layout.scale);
    this.cycleThreeFrame([TITLE_TEXTURES.flame2_01, TITLE_TEXTURES.flame2_02, TITLE_TEXTURES.flame2_03], centerX + 140 * layout.scale, ctaY - 135 * layout.scale, 260, 19, layout.scale);

    const cta = this.placeByRef({
      key: TITLE_TEXTURES.ctaButton,
      x: REF_WIDTH / 2,
      y: 1935,
      depth: 30,
      fallbackWidth: 620,
      fallbackHeight: 180,
      fallbackColor: 0x7a8ea5
    }, layout).setInteractive({ useHandCursor: false });

    this.tweens.add({
      targets: cta,
      alpha: { from: 1, to: 0.88 },
      yoyo: true,
      repeat: -1,
      duration: 850
    });

    cta.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });
  }

  private toggleTwoFrame(config: TwoFrameConfig): void {
    const { keyA, keyB, x, y, intervalMs = 500, scale = 1, alpha = 1, depth = 0 } = config;

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

  private cycleThreeFrame(keys: string[], x: number, y: number, intervalMs: number, depth: number, scale: number): void {
    const sprites = keys.map((key, index) =>
      this.addTextureOrFallback({
        key,
        x,
        y,
        alpha: index === 0 ? 0.92 : 0,
        depth,
        scale,
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

  private placeByRef(config: Placement, layout: LayoutMetrics, scaleMultiplier = 1): Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle {
    return this.addTextureOrFallback({
      ...config,
      x: layout.baseX + config.x * layout.scale,
      y: layout.baseY + config.y * layout.scale,
      scale: (config.scale ?? 1) * layout.scale * scaleMultiplier,
      fallbackWidth: (config.fallbackWidth ?? 18) * layout.scale,
      fallbackHeight: (config.fallbackHeight ?? 18) * layout.scale
    });
  }

  private getTextureHeight(key: string): number {
    const texture = this.textures.get(key);
    const source = texture.getSourceImage() as HTMLImageElement;
    return source?.height ?? REF_HEIGHT;
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
