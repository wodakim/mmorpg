import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import { CharCreateScene } from "./scenes/CharCreateScene";
import { MenuScene } from "./scenes/MenuScene";
import { TitleScene } from "./scenes/TitleScene";

export type GameSize = {
  width: number;
  height: number;
};

const MIN_WIDTH = 240;
const MIN_HEIGHT = 426;

export function getAdaptiveGameSize(viewportWidth: number, viewportHeight: number): GameSize {
  const safeViewportWidth = Math.max(viewportWidth, MIN_WIDTH);
  const safeViewportHeight = Math.max(viewportHeight, MIN_HEIGHT);

  return {
    width: Math.max(MIN_WIDTH, Math.floor(safeViewportWidth)),
    height: Math.max(MIN_HEIGHT, Math.floor(safeViewportHeight))
  };
}

export function createGame(parent: HTMLElement, size: GameSize): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: size.width,
    height: size.height,
    parent,
    backgroundColor: "#182124",
    pixelArt: true,
    roundPixels: true,
    fps: {
      target: 60,
      forceSetTimeOut: true
    },
    scale: {
      mode: Phaser.Scale.NONE,
      width: size.width,
      height: size.height
    },
    scene: [TitleScene, MenuScene, CharCreateScene, GameScene]
  });
}
