import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import { CharCreateScene } from "./scenes/CharCreateScene";
import { MenuScene } from "./scenes/MenuScene";
import { TitleScene } from "./scenes/TitleScene";

export const GAME_WIDTH = 288;
export const GAME_HEIGHT = 512;

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
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
      width: GAME_WIDTH,
      height: GAME_HEIGHT
    },
    scene: [TitleScene, MenuScene, CharCreateScene, GameScene]
  });
}
