import Phaser from "phaser";

type TouchCallbacks = {
  onAttack: () => void;
  onInteract: () => void;
  onPotion: () => void;
  onInventory: () => void;
  onStats: () => void;
  onQuests: () => void;
};

export class InputTouchManager {
  private readonly root: Phaser.GameObjects.Container;
  private readonly joystickBase: Phaser.GameObjects.Arc;
  private readonly joystickStick: Phaser.GameObjects.Arc;
  private vector = new Phaser.Math.Vector2(0, 0);
  private activePointerId: number | null = null;
  private readonly joystickCenter: Phaser.Math.Vector2;
  private readonly maxRadius = 30;
  private readonly leftZoneMaxX: number;
  private readonly leftZoneMinY: number;

  constructor(private readonly scene: Phaser.Scene, callbacks: TouchCallbacks) {
    const width = scene.scale.width;
    const height = scene.scale.height;

    this.joystickCenter = new Phaser.Math.Vector2(70, height - 84);
    this.leftZoneMaxX = width * 0.5;
    this.leftZoneMinY = height - 200;

    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(50);

    this.joystickBase = scene.add.circle(this.joystickCenter.x, this.joystickCenter.y, 34, 0x20343d, 0.8);
    this.joystickStick = scene.add.circle(this.joystickCenter.x, this.joystickCenter.y, 16, 0x8acb88, 0.95);
    this.root.add([this.joystickBase, this.joystickStick]);

    const rightMainX = width - 54;
    const rightAltX = width - 102;
    const baseY = height - 94;

    this.makeButton(rightMainX, baseY, "ATK", callbacks.onAttack);
    this.makeButton(rightAltX, baseY + 32, "ACT", callbacks.onInteract);
    this.makeButton(rightMainX, baseY + 64, "P5", callbacks.onPotion);

    this.makeButton(rightAltX, height - 166, "INV", callbacks.onInventory, 24);
    this.makeButton(rightMainX, height - 198, "STAT", callbacks.onStats, 24);
    this.makeButton(rightMainX, height - 246, "QST", callbacks.onQuests, 24);

    this.joystickBase.setInteractive(
      new Phaser.Geom.Circle(this.joystickCenter.x, this.joystickCenter.y, 42),
      Phaser.Geom.Circle.Contains
    );

    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < this.leftZoneMaxX && pointer.y > this.leftZoneMinY && this.activePointerId === null) {
        this.activePointerId = pointer.id;
        this.updateJoystick(pointer);
      }
    });

    this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.activePointerId) {
        this.updateJoystick(pointer);
      }
    });

    const reset = (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.activePointerId) {
        this.activePointerId = null;
        this.vector.set(0, 0);
        this.joystickStick.setPosition(this.joystickCenter.x, this.joystickCenter.y);
      }
    };

    this.scene.input.on("pointerup", reset);
    this.scene.input.on("pointerupoutside", reset);
  }

  getVector(): Phaser.Math.Vector2 {
    return this.vector.clone();
  }

  destroy(): void {
    this.root.destroy(true);
  }

  private updateJoystick(pointer: Phaser.Input.Pointer): void {
    const delta = new Phaser.Math.Vector2(pointer.x - this.joystickCenter.x, pointer.y - this.joystickCenter.y);
    if (delta.length() > this.maxRadius) {
      delta.setLength(this.maxRadius);
    }
    this.joystickStick.setPosition(this.joystickCenter.x + delta.x, this.joystickCenter.y + delta.y);
    this.vector = delta.scale(1 / this.maxRadius);
  }

  private makeButton(
    x: number,
    y: number,
    label: string,
    onPress: () => void,
    radius = 28
  ): void {
    const bg = this.scene.add.circle(x, y, radius, 0x20343d, 0.92);
    const txt = this.scene.add.text(x, y, label, {
      fontFamily: "Press Start 2P",
      fontSize: radius >= 28 ? "12px" : "10px",
      color: "#f6f1d8"
    }).setOrigin(0.5);

    bg.setInteractive(new Phaser.Geom.Circle(x, y, radius), Phaser.Geom.Circle.Contains);
    bg.on("pointerdown", () => onPress());
    this.root.add([bg, txt]);
  }
}
