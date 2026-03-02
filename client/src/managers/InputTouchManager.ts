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
  private readonly joystickCenter = new Phaser.Math.Vector2(66, 432);
  private readonly maxRadius = 30;

  constructor(private readonly scene: Phaser.Scene, callbacks: TouchCallbacks) {
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(50);

    this.joystickBase = scene.add.circle(this.joystickCenter.x, this.joystickCenter.y, 34, 0x20343d, 0.8);
    this.joystickStick = scene.add.circle(this.joystickCenter.x, this.joystickCenter.y, 16, 0x8acb88, 0.95);
    this.root.add([this.joystickBase, this.joystickStick]);

    this.makeButton(244, 424, "ATK", callbacks.onAttack);
    this.makeButton(196, 456, "ACT", callbacks.onInteract);
    this.makeButton(244, 488, "P5", callbacks.onPotion);
    this.makeButton(204, 364, "INV", callbacks.onInventory, 24);
    this.makeButton(244, 328, "STAT", callbacks.onStats, 24);
    this.makeButton(244, 280, "QST", callbacks.onQuests, 24);

    this.joystickBase.setInteractive(
      new Phaser.Geom.Circle(this.joystickCenter.x, this.joystickCenter.y, 42),
      Phaser.Geom.Circle.Contains
    );

    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < 144 && pointer.y > 320 && this.activePointerId === null) {
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
      fontFamily: "Trebuchet MS",
      fontSize: radius >= 28 ? "12px" : "10px",
      color: "#f6f1d8"
    }).setOrigin(0.5);

    bg.setInteractive(new Phaser.Geom.Circle(x, y, radius), Phaser.Geom.Circle.Contains);
    bg.on("pointerdown", () => onPress());
    this.root.add([bg, txt]);
  }
}
