import Phaser from "phaser";
import type { Colors, ItemInstance, RemotePlayer, WorldState } from "@maestria/shared";
import { network } from "../net/NetworkManager";
import { getSession } from "../state/session";
import { BODY_COLORS, HAIR_COLORS, PANTS_COLORS } from "../utils/colors";
import { InputTouchManager } from "../managers/InputTouchManager";
import { createButton, createDiv, createInput, createPanel } from "../ui/dom";
import { clearNode } from "../ui/dom";
import { resetOverlay } from "../ui/overlay";
import { showConstructionPopup } from "../ui/popup";

type AvatarObjects = {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  pants: Phaser.GameObjects.Rectangle;
  hair: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
};

export class GameScene extends Phaser.Scene {
  private worldState: WorldState | null = null;
  private inputTouch?: InputTouchManager;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<string, Phaser.Input.Keyboard.Key>;
  private lastInputSentAt = 0;
  private selfAvatar?: AvatarObjects;
  private remotePlayers = new Map<string, AvatarObjects>();
  private treeNodes = new Map<string, Phaser.GameObjects.Container>();
  private slimeNodes = new Map<string, Phaser.GameObjects.Container>();
  private chestNodes = new Map<string, Phaser.GameObjects.Container>();
  private unsubscribers: Array<() => void> = [];
  private topBar?: HTMLDivElement;
  private chatList?: HTMLDivElement;
  private inventoryPanel?: HTMLDivElement;
  private statsPanel?: HTMLDivElement;
  private questsPanel?: HTMLDivElement;
  private toastBadge?: HTMLDivElement;
  private toastTimer?: number;
  private chatCollapsed = true;
  private hudCollapsed = true;

  constructor() {
    super("GameScene");
  }

  create(): void {
    const initial = network.getState();
    if (!initial) {
      this.scene.start("MenuScene");
      return;
    }

    this.worldState = initial;
    const overlay = resetOverlay();
    this.drawMap();
    this.createAvatars();
    this.buildHud(overlay);
    this.applyWorldState(initial);

    this.inputTouch = new InputTouchManager(this, {
      onAttack: () => network.attack(),
      onInteract: () => network.interact(),
      onPotion: () => network.usePotion(),
      onInventory: () => this.togglePanel("inventory"),
      onStats: () => this.togglePanel("stats"),
      onQuests: () => this.togglePanel("quests")
    });

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasd = this.input.keyboard?.addKeys("W,A,S,D") as Record<string, Phaser.Input.Keyboard.Key>;
    this.cameras.main.setBounds(0, 0, 768, 768);

    this.unsubscribers.push(
      network.onState((state) => {
        this.worldState = state;
        this.applyWorldState(state);
      }),
      network.onToast((message) => this.showToast(message)),
      network.onError((message) => this.showToast(message))
    );

    const onVisibility = () => {
      if (!document.hidden) {
        network.requestResync();
      }
    };
    document.addEventListener("visibilitychange", onVisibility, { passive: true });
    this.events.once("shutdown", () => {
      document.removeEventListener("visibilitychange", onVisibility);
      this.inputTouch?.destroy();
      this.unsubscribers.forEach((unsubscribe) => unsubscribe());
      resetOverlay();
    });

    this.input.once("pointerdown", () => {
      const soundManager = this.sound as Phaser.Sound.BaseSoundManager & {
        context?: AudioContext;
      };
      if (soundManager.context?.state === "suspended") {
        void soundManager.context.resume();
      }
    });
  }

  update(time: number): void {
    const self = this.worldState?.self;
    if (!self || !this.selfAvatar) {
      return;
    }

    const move = this.collectMovementVector();
    if (time - this.lastInputSentAt > 50) {
      this.lastInputSentAt = time;
      network.sendInput(move.x, move.y);
    }

    this.selfAvatar.container.x = Phaser.Math.Linear(this.selfAvatar.container.x, self.position.x, 0.35);
    this.selfAvatar.container.y = Phaser.Math.Linear(this.selfAvatar.container.y, self.position.y, 0.35);
    this.cameras.main.startFollow(this.selfAvatar.container, true, 0.12, 0.12);
  }

  private drawMap(): void {
    this.cameras.main.setBackgroundColor("#223137");
    const graphics = this.add.graphics();
    graphics.fillStyle(0x537f4f, 1);
    graphics.fillRect(0, 0, 768, 768);
    graphics.fillStyle(0x4b6d48, 1);
    for (let y = 0; y < 24; y += 1) {
      for (let x = 0; x < 24; x += 1) {
        if ((x + y) % 2 === 0) {
          graphics.fillRect(x * 32, y * 32, 32, 32);
        }
      }
    }

    graphics.fillStyle(0x9e8d62, 1);
    graphics.fillRect(320, 360, 128, 96);
    graphics.fillRect(356, 456, 48, 96);

    this.add.text(384, 338, "Village", {
      fontFamily: "Press Start 2P",
      fontSize: "14px",
      color: "#f6f1d8"
    }).setOrigin(0.5);
  }

  private createAvatars(): void {
    this.selfAvatar = this.makeAvatar(getSession().username || "You");
  }

  private makeAvatar(labelText: string): AvatarObjects {
    const shadow = this.add.ellipse(0, 12, 24, 10, 0x0d1114, 0.45);
    const pants = this.add.rectangle(0, 4, 16, 14, 0xffffff);
    const body = this.add.rectangle(0, -10, 16, 18, 0xffffff);
    const hair = this.add.rectangle(0, -22, 16, 8, 0xffffff);
    const label = this.add.text(0, -38, labelText, {
      fontFamily: "Press Start 2P",
      fontSize: "10px",
      color: "#f6f1d8",
      stroke: "#0d1114",
      strokeThickness: 2
    }).setOrigin(0.5);
    const container = this.add.container(384, 416, [shadow, pants, body, hair, label]);
    return { container, body, pants, hair, label };
  }

  private applyWorldState(state: WorldState): void {
    this.syncAvatar(this.selfAvatar, state.self.colors, state.self.username, state.self.position.x, state.self.position.y);
    this.syncTrees(state);
    this.syncSlimes(state);
    this.syncChests(state);
    this.syncPlayers(state.players);
    this.renderHud(state);
  }

  private syncAvatar(avatar: AvatarObjects | undefined, colors: Colors, label: string, x: number, y: number): void {
    if (!avatar) {
      return;
    }
    avatar.hair.setFillStyle(HAIR_COLORS[colors.hair]);
    avatar.body.setFillStyle(BODY_COLORS[colors.body]);
    avatar.pants.setFillStyle(PANTS_COLORS[colors.pants]);
    avatar.label.setText(label);
    avatar.container.setPosition(x, y);
  }

  private syncTrees(state: WorldState): void {
    const liveIds = new Set(state.trees.map((tree: WorldState["trees"][number]) => tree.id));
    state.trees.forEach((tree: WorldState["trees"][number]) => {
      let node = this.treeNodes.get(tree.id);
      if (!node) {
        const trunk = this.add.rectangle(0, 12, 10, 18, 0x6d4825);
        const crown = this.add.circle(0, -2, 18, 0x2d6b3f);
        node = this.add.container(tree.x, tree.y, [trunk, crown]);
        this.treeNodes.set(tree.id, node);
      }
      node.setPosition(tree.x, tree.y);
      node.setAlpha(tree.available ? 1 : 0.35);
    });

    Array.from(this.treeNodes.entries()).forEach(([id, node]) => {
      if (!liveIds.has(id)) {
        node.destroy(true);
        this.treeNodes.delete(id);
      }
    });
  }

  private syncSlimes(state: WorldState): void {
    const liveIds = new Set(state.slimes.map((slime: WorldState["slimes"][number]) => slime.id));
    state.slimes.forEach((slime: WorldState["slimes"][number]) => {
      let node = this.slimeNodes.get(slime.id);
      if (!node) {
        const body = this.add.circle(0, 0, 16, 0x75d36f);
        const eyes = this.add.text(0, -2, ":)", {
          fontFamily: "Press Start 2P",
          fontSize: "10px",
          color: "#0d1114"
        }).setOrigin(0.5);
        node = this.add.container(slime.x, slime.y, [body, eyes]);
        this.slimeNodes.set(slime.id, node);
      }
      node.setPosition(slime.x, slime.y);
      node.setVisible(slime.alive);
      node.setAlpha(slime.alive ? 1 : 0.2);
    });

    Array.from(this.slimeNodes.entries()).forEach(([id, node]) => {
      if (!liveIds.has(id)) {
        node.destroy(true);
        this.slimeNodes.delete(id);
      }
    });
  }

  private syncChests(state: WorldState): void {
    const liveIds = new Set(state.chests.map((chest: WorldState["chests"][number]) => chest.id));
    state.chests.forEach((chest: WorldState["chests"][number]) => {
      let node = this.chestNodes.get(chest.id);
      if (!node) {
        const box = this.add.rectangle(0, 0, 18, 14, 0xa77938);
        const lid = this.add.rectangle(0, -8, 18, 6, 0xc9a259);
        node = this.add.container(chest.x, chest.y, [box, lid]);
        this.chestNodes.set(chest.id, node);
      }
      node.setPosition(chest.x, chest.y);
      node.setVisible(!chest.opened);
    });

    Array.from(this.chestNodes.entries()).forEach(([id, node]) => {
      if (!liveIds.has(id)) {
        node.destroy(true);
        this.chestNodes.delete(id);
      }
    });
  }

  private syncPlayers(players: RemotePlayer[]): void {
    const liveIds = new Set(players.map((player) => player.userId));
    players.forEach((player) => {
      let avatar = this.remotePlayers.get(player.userId);
      if (!avatar) {
        avatar = this.makeAvatar(player.username);
        this.remotePlayers.set(player.userId, avatar);
      }
      this.syncAvatar(avatar, player.colors, `${player.username} Lv${player.level}`, player.position.x, player.position.y);
    });

    Array.from(this.remotePlayers.entries()).forEach(([id, avatar]) => {
      if (!liveIds.has(id)) {
        avatar.container.destroy(true);
        this.remotePlayers.delete(id);
      }
    });
  }

  private collectMovementVector(): Phaser.Math.Vector2 {
    const touch = this.inputTouch?.getVector() ?? new Phaser.Math.Vector2(0, 0);
    const keyboard = new Phaser.Math.Vector2(0, 0);

    if (this.cursors?.left.isDown || this.wasd?.A.isDown) {
      keyboard.x -= 1;
    }
    if (this.cursors?.right.isDown || this.wasd?.D.isDown) {
      keyboard.x += 1;
    }
    if (this.cursors?.up.isDown || this.wasd?.W.isDown) {
      keyboard.y -= 1;
    }
    if (this.cursors?.down.isDown || this.wasd?.S.isDown) {
      keyboard.y += 1;
    }

    const combined = touch.lengthSq() > 0 ? touch : keyboard.normalize();
    if (!Number.isFinite(combined.x) || !Number.isFinite(combined.y)) {
      return new Phaser.Math.Vector2(0, 0);
    }
    return combined;
  }

  private buildHud(overlay: HTMLDivElement): void {
    const top = createPanel("top");
    top.classList.add("collapsible-panel");
    const topToggle = createButton("HUD", "button small secondary");
    const topBar = createDiv("hud-bar hidden");
    const toastBadge = createDiv("badge hidden");
    topBar.appendChild(createDiv("badge", "Connected"));
    topBar.appendChild(toastBadge);
    top.append(topToggle, topBar);

    topToggle.addEventListener("click", () => {
      this.hudCollapsed = !this.hudCollapsed;
      topBar.classList.toggle("hidden", this.hudCollapsed);
      topToggle.textContent = this.hudCollapsed ? "HUD" : "Fermer HUD";
    });

    const bottom = createPanel("bottom");
    bottom.classList.add("collapsible-panel", "chat-panel");
    const chatToggle = createButton("Chat", "button small secondary");
    const chatList = createDiv("list hidden");
    const input = createInput("Chat with the bot or nearby players", "", 140);
    input.classList.add("hidden");
    const send = createButton("Send", "button small");
    send.classList.add("hidden");

    const sendChat = () => {
      const text = input.value.trim();
      if (!text) {
        return;
      }
      network.chat(text);
      input.value = "";
    };

    chatToggle.addEventListener("click", () => {
      this.chatCollapsed = !this.chatCollapsed;
      chatList.classList.toggle("hidden", this.chatCollapsed);
      input.classList.toggle("hidden", this.chatCollapsed);
      send.classList.toggle("hidden", this.chatCollapsed);
      chatToggle.textContent = this.chatCollapsed ? "Chat" : "Fermer chat";
    });

    send.addEventListener("click", sendChat);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendChat();
      }
    });

    bottom.append(chatToggle, chatList, input, send);

    this.inventoryPanel = createPanel("center");
    this.inventoryPanel.classList.add("hidden");
    this.statsPanel = createPanel("center");
    this.statsPanel.classList.add("hidden");
    this.questsPanel = createPanel("center");
    this.questsPanel.classList.add("hidden");

    overlay.append(top, bottom, this.inventoryPanel, this.statsPanel, this.questsPanel);
    this.topBar = topBar;
    this.chatList = chatList;
    this.toastBadge = toastBadge;
  }

  private renderHud(state: WorldState): void {
    if (!this.topBar || !this.chatList || !this.inventoryPanel || !this.statsPanel || !this.questsPanel) {
      return;
    }

    const self = state.self;
    clearNode(this.topBar);
    this.topBar.append(
      createDiv("badge", `${self.username} Lv${self.level}`),
      createDiv("badge", `HP ${self.hp}/${self.maxHp}`),
      createDiv("badge", `EXP ${self.exp}/${self.expToNext}`),
      createDiv("badge", `Wood ${this.countItem(self.inventory, "wood")} Gel ${this.countItem(self.inventory, "slime_gel")}`)
    );
    if (this.toastBadge && !this.toastBadge.classList.contains("hidden")) {
      this.topBar.appendChild(this.toastBadge);
    }

    this.chatList.textContent = "";
    state.chat.slice(-6).forEach((message: WorldState["chat"][number]) => {
      this.chatList?.appendChild(createDiv("item-card", `${message.from}: ${message.text}`));
    });

    this.inventoryPanel.textContent = "";
    const inventoryStack = createDiv("panel-stack");
    inventoryStack.append(
      createDiv("title", "Inventory & Craft"),
      createDiv("subtitle", "Craft and equip items from server-authoritative inventory.")
    );
    const craftRow = createDiv("row");
    const sword = createButton("Craft Sword", "button small");
    const legs = createButton("Craft Legs", "button small");
    const potion = createButton("Craft Potion", "button small");
    sword.addEventListener("click", () => network.craft("wood_sword"));
    legs.addEventListener("click", () => network.craft("wood_leggings"));
    potion.addEventListener("click", () => network.craft("health_potion"));
    craftRow.append(sword, legs, potion);
    inventoryStack.appendChild(craftRow);

    const items = createDiv("list");
    self.inventory.forEach((item: ItemInstance) => items.appendChild(this.renderItemCard(item)));
    inventoryStack.appendChild(items);
    this.inventoryPanel.appendChild(inventoryStack);

    this.statsPanel.textContent = "";
    const statsStack = createDiv("panel-stack");
    statsStack.append(
      createDiv("title", "Stats"),
      createDiv("subtitle", `Unspent points: ${self.statPoints}`)
    );
    (["str", "vit", "agi", "dex", "int"] as const).forEach((stat) => {
      const row = createDiv("row");
      row.appendChild(createDiv("badge", `${stat.toUpperCase()} ${self.stats[stat]}`));
      const plus = createButton("+1", "button small");
      plus.disabled = self.statPoints <= 0;
      plus.addEventListener("click", () => network.allocateStats(stat, 1));
      row.appendChild(plus);
      statsStack.appendChild(row);
    });
    statsStack.appendChild(createDiv("subtitle", "STR=dmg, VIT=max HP, AGI=speed, DEX=attack rate, INT=potion heal"));
    this.statsPanel.appendChild(statsStack);

    this.questsPanel.textContent = "";
    const questStack = createDiv("panel-stack");
    questStack.append(
      createDiv("title", "Quests & Social"),
      createDiv("subtitle", "Starter quests only use wood and slime targets.")
    );
    const questList = createDiv("list");
    self.questsActive.forEach((quest: WorldState["self"]["questsActive"][number]) => {
      questList.appendChild(createDiv("item-card", `${quest.title} ${quest.progress}/${quest.goal}`));
    });
    questStack.appendChild(questList);

    const socialTarget = createInput("Target username", "", 16);
    const reason = createInput("Report reason", "", 64);
    const socialRow = createDiv("row");
    const addFriend = createButton("Friend", "button small");
    const group = createButton("Group", "button small");
    const blacklist = createButton("Blacklist", "button small");
    const report = createButton("Report", "button small");
    const guild = createButton("Guild", "button small secondary");

    const requireTarget = (action: () => void) => {
      if (!socialTarget.value.trim()) {
        showConstructionPopup("Action incomplète", "Entre un pseudo cible pour valider l'action sociale.");
        return;
      }
      action();
    };

    addFriend.addEventListener("click", () => requireTarget(() => network.addFriend(socialTarget.value.trim())));
    group.addEventListener("click", () => requireTarget(() => network.toggleGroup(socialTarget.value.trim())));
    blacklist.addEventListener("click", () => requireTarget(() => network.toggleBlacklist(socialTarget.value.trim())));
    report.addEventListener("click", () => requireTarget(() => network.report(socialTarget.value.trim(), reason.value.trim() || "mvp-report")));
    guild.addEventListener("click", () => {
      showConstructionPopup("Guild", "Le système de guilde est branché côté UI avec popup de construction pour ce MVP.");
    });
    socialRow.append(addFriend, group, blacklist, report, guild);
    questStack.append(socialTarget, reason, socialRow);
    questStack.appendChild(createDiv("subtitle", `Friends: ${self.social.friends.join(", ") || "-"}`));
    questStack.appendChild(createDiv("subtitle", `Group: ${self.social.groupMembers.join(", ") || "-"}`));
    questStack.appendChild(createDiv("subtitle", `Blacklist: ${self.social.blacklist.join(", ") || "-"}`));
    this.questsPanel.appendChild(questStack);
  }

  private renderItemCard(item: ItemInstance): HTMLDivElement {
    const card = createDiv("item-card");
    const statLine = Object.entries(item.stats)
      .map(([key, value]) => `${key}+${value}`)
      .join(" ");
    card.appendChild(createDiv("subtitle", `${item.name} x${item.qty}`));
    card.appendChild(createDiv("subtitle", `${item.baseId} T${item.tier}${statLine ? ` ${statLine}` : ""}`));
    if (item.slot === "weapon" || item.slot === "legs") {
      const equip = createButton("Equip", "button small");
      equip.addEventListener("click", () => network.equip(item.instanceId));
      card.appendChild(equip);
    }
    return card;
  }

  private togglePanel(panel: "inventory" | "stats" | "quests"): void {
    const inventoryHidden = this.inventoryPanel?.classList.contains("hidden") ?? true;
    const statsHidden = this.statsPanel?.classList.contains("hidden") ?? true;
    const questsHidden = this.questsPanel?.classList.contains("hidden") ?? true;

    this.inventoryPanel?.classList.add("hidden");
    this.statsPanel?.classList.add("hidden");
    this.questsPanel?.classList.add("hidden");

    if (panel === "inventory" && inventoryHidden) {
      this.inventoryPanel?.classList.remove("hidden");
    }
    if (panel === "stats" && statsHidden) {
      this.statsPanel?.classList.remove("hidden");
    }
    if (panel === "quests" && questsHidden) {
      this.questsPanel?.classList.remove("hidden");
    }
  }

  private showToast(message: string): void {
    if (!this.toastBadge || !this.topBar) {
      return;
    }

    this.toastBadge.textContent = message;
    this.toastBadge.classList.remove("hidden");
    this.topBar.appendChild(this.toastBadge);
    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
    }
    this.toastTimer = window.setTimeout(() => {
      this.toastBadge?.classList.add("hidden");
    }, 2200);
  }

  private countItem(items: ItemInstance[], baseId: string): number {
    return items.filter((item) => item.baseId === baseId).reduce((sum, item) => sum + item.qty, 0);
  }
}
