import { randomUUID } from "node:crypto";
import type { Server, Socket } from "socket.io";
import {
  DEFAULT_HOTBAR,
  WORLD_BOUNDS,
  type AuthGuestPayload,
  type BlacklistPayload,
  type ChatMessage,
  type ChatPayload,
  type ChestState,
  type ClientToServerEvents,
  type Colors,
  type EquipPayload,
  type FriendPayload,
  type GroupPayload,
  type ItemInstance,
  type PlayerState,
  type QuestInstance,
  type RemotePlayer,
  type ReportPayload,
  type ServerToClientEvents,
  type SlimeState,
  type StatBlock,
  type Toast,
  type TreeState,
  type WorldState
} from "@maestria/shared";
import type { IPlayerStore } from "../store/IPlayerStore.js";
import { log } from "../utils/logger.js";
import { sanitizeChat, sanitizeUsername } from "../utils/sanitize.js";

type RuntimePlayer = {
  socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  state: PlayerState;
  input: { x: number; y: number };
  connectedAt: number;
  lastTickAt: number;
  attackReadyAt: number;
  interactReadyAt: number;
  potionReadyAt: number;
};

type SlimeRuntime = SlimeState & {
  respawnAt: number;
  attackReadyAt: number;
};

const TREE_RESPAWN_MS = 8000;
const CHEST_EXPIRE_MS = 45000;
const SAVE_INTERVAL_MS = Number(process.env.SAVE_INTERVAL_MS ?? 10000);
const TICK_RATE_MS = Number(process.env.TICK_RATE_MS ?? 100);

const STARTER_COLORS: Colors = { hair: 0, body: 0, pants: 0 };
const BASE_STATS: StatBlock = { str: 3, vit: 3, agi: 3, dex: 3, int: 3 };
type StatKey = keyof StatBlock & string;

export class GameService {
  private readonly players = new Map<string, RuntimePlayer>();
  private readonly trees: TreeState[] = [];
  private readonly slimes: SlimeRuntime[] = [];
  private readonly chests: ChestState[] = [];
  private readonly chatLog: ChatMessage[] = [];
  private readonly saveTimer: NodeJS.Timeout;
  private readonly tickTimer: NodeJS.Timeout;

  constructor(
    private readonly io: Server<ClientToServerEvents, ServerToClientEvents>,
    private readonly store: IPlayerStore
  ) {
    this.seedWorld();
    this.saveTimer = setInterval(() => void this.saveAll(), SAVE_INTERVAL_MS);
    this.tickTimer = setInterval(() => this.tick(), TICK_RATE_MS);
  }

  async connectGuest(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    payload: AuthGuestPayload
  ): Promise<WorldState> {
    const username = sanitizeUsername(payload.username);
    const existing = await this.store.loadPlayer(payload.userId);
    const state = existing
      ? this.mergePlayer(existing, username, payload.colors)
      : this.createPlayer(payload.userId, username, payload.colors);

    this.players.set(state.userId, {
      socket,
      state,
      input: { x: 0, y: 0 },
      connectedAt: Date.now(),
      lastTickAt: Date.now(),
      attackReadyAt: 0,
      interactReadyAt: 0,
      potionReadyAt: 0
    });

    void this.store.savePlayer(state);
    log("info", "player_connected", { userId: state.userId, username: state.username });
    return this.buildWorldState(state.userId);
  }

  disconnect(socketId: string): void {
    for (const [userId, runtime] of this.players.entries()) {
      if (runtime.socket.id !== socketId) {
        continue;
      }
      runtime.state.lastSave = new Date().toISOString();
      void this.store.savePlayer(runtime.state);
      this.players.delete(userId);
      log("info", "player_disconnected", { userId });
      return;
    }
  }

  setInput(userId: string, input: { x: number; y: number }): void {
    const runtime = this.players.get(userId);
    if (!runtime) {
      return;
    }
    runtime.input = normalizeVector(input.x, input.y);
  }

  attack(userId: string): void {
    const runtime = this.requirePlayer(userId);
    if (!runtime) {
      return;
    }

    const now = Date.now();
    if (runtime.attackReadyAt > now) {
      return;
    }
    runtime.attackReadyAt = now + Math.max(450, 900 - runtime.state.stats.dex * 30);

    const target = this.slimes.find((slime) => slime.alive && distance(runtime.state.position.x, runtime.state.position.y, slime.x, slime.y) < 62);
    if (!target) {
      this.toast(runtime.state.userId, "No slime in range");
      return;
    }

    const damage = 4 + runtime.state.stats.str + getEquipmentBonus(runtime.state, "dmg");
    target.hp = Math.max(0, target.hp - damage);
    this.toast(runtime.state.userId, `Hit slime for ${damage}`);

    if (target.hp === 0) {
      target.alive = false;
      target.respawnAt = now + 10000;
      this.spawnChest(target.x, target.y, "slime_gel");
      this.grantExp(runtime.state, 18);
      this.incrementMastery(runtime.state, "warrior", 1);
      this.updateQuestProgress(runtime.state, "slime", 1);
      this.saveCritical(runtime.state);
    }
  }

  interact(userId: string): void {
    const runtime = this.requirePlayer(userId);
    if (!runtime) {
      return;
    }

    const now = Date.now();
    if (runtime.interactReadyAt > now) {
      return;
    }
    runtime.interactReadyAt = now + 500;

    const tree = this.trees.find((entry) => entry.available && distance(runtime.state.position.x, runtime.state.position.y, entry.x, entry.y) < 54);
    if (tree) {
      tree.available = false;
      tree.respawnAt = now + TREE_RESPAWN_MS;
      addStackableItem(runtime.state.inventory, makeMaterial("wood", "Wood", 2));
      this.incrementMastery(runtime.state, "woodcutter", 1);
      this.grantExp(runtime.state, 6);
      this.updateQuestProgress(runtime.state, "wood", 1);
      this.toast(userId, "Collected wood");
      this.saveCritical(runtime.state);
      return;
    }

    const chest = this.chests.find((entry) => !entry.opened && distance(runtime.state.position.x, runtime.state.position.y, entry.x, entry.y) < 48);
    if (chest) {
      chest.opened = true;
      addStackableItem(runtime.state.inventory, makeMaterial("slime_gel", "Slime Gel", 1));
      this.toast(userId, "Looted Slime Gel");
      this.saveCritical(runtime.state);
      return;
    }

    this.toast(userId, "Nothing to interact with");
  }

  craft(userId: string, recipeId: "wood_sword" | "wood_leggings" | "health_potion"): void {
    const runtime = this.requirePlayer(userId);
    if (!runtime) {
      return;
    }

    const recipes: Record<string, { costs: Record<string, number>; name: string }> = {
      wood_sword: { costs: { wood: 5 }, name: "Wood Sword" },
      wood_leggings: { costs: { wood: 4 }, name: "Wood Leggings" },
      health_potion: { costs: { slime_gel: 1 }, name: "Health Potion" }
    };

    const recipe = recipes[recipeId];
    if (!recipe) {
      return;
    }

    for (const [baseId, qty] of Object.entries(recipe.costs)) {
      if (countItem(runtime.state.inventory, baseId) < qty) {
        this.toast(userId, `Missing ${baseId}`);
        return;
      }
    }

    for (const [baseId, qty] of Object.entries(recipe.costs)) {
      consumeItem(runtime.state.inventory, baseId, qty);
    }

    const item =
      recipeId === "health_potion"
        ? makePotion()
        : generateGear(recipeId, recipe.name, runtime.state.level);

    addStackableItem(runtime.state.inventory, item);
    this.incrementMastery(runtime.state, recipeId === "health_potion" ? "alchemist" : "blacksmith", 1);
    this.toast(userId, `${recipe.name} crafted`);
    this.saveCritical(runtime.state);
  }

  equip(userId: string, payload: EquipPayload): void {
    const runtime = this.requirePlayer(userId);
    if (!runtime) {
      return;
    }

    const item = runtime.state.inventory.find((entry: ItemInstance) => entry.instanceId === payload.instanceId);
    if (!item || item.slot === "material" || item.slot === "consumable") {
      return;
    }

    if (item.slot === "weapon") {
      runtime.state.equipment.weapon = item;
    }
    if (item.slot === "legs") {
      runtime.state.equipment.legs = item;
    }
    recalcVitals(runtime.state);
    this.toast(userId, `${item.name} equipped`);
    this.saveCritical(runtime.state);
  }

  usePotion(userId: string): void {
    const runtime = this.requirePlayer(userId);
    if (!runtime) {
      return;
    }

    const now = Date.now();
    if (runtime.potionReadyAt > now) {
      return;
    }

    const potionIndex = runtime.state.inventory.findIndex((entry: ItemInstance) => entry.baseId === "health_potion" && entry.qty > 0);
    if (potionIndex === -1) {
      this.toast(userId, "No potion in hotbar 5");
      return;
    }

    runtime.potionReadyAt = now + 6000;
    const heal = 18 + runtime.state.stats.int * 2;
    runtime.state.hp = Math.min(runtime.state.maxHp, runtime.state.hp + heal);
    decrementInventoryIndex(runtime.state.inventory, potionIndex, 1);
    this.toast(userId, `Recovered ${heal} HP`);
    this.saveCritical(runtime.state);
  }

  allocateStats(userId: string, stat: StatKey, amount: number): void {
    const runtime = this.requirePlayer(userId);
    if (!runtime || runtime.state.statPoints < amount) {
      return;
    }

    runtime.state.stats[stat] += amount;
    runtime.state.statPoints -= amount;
    recalcVitals(runtime.state);
    this.toast(userId, `Allocated ${amount} ${stat.toUpperCase()}`);
    this.saveCritical(runtime.state);
  }

  sendChat(userId: string, payload: ChatPayload): void {
    const runtime = this.requirePlayer(userId);
    if (!runtime) {
      return;
    }

    const text = sanitizeChat(payload.text);
    const message = createChatMessage(runtime.state.username, text, false);
    this.chatLog.push(message);
    this.chatLog.splice(0, Math.max(0, this.chatLog.length - 20));
    this.io.emit("server:chat", message);
    this.respondAsBot(text);
  }

  addFriend(userId: string, payload: FriendPayload): void {
    const runtime = this.requirePlayer(userId);
    if (!runtime) {
      return;
    }
    const username = sanitizeUsername(payload.username);
    if (!runtime.state.social.friends.includes(username)) {
      runtime.state.social.friends.push(username);
      this.toast(userId, `${username} added to friends`);
      this.saveCritical(runtime.state);
    }
  }

  updateGroup(userId: string, payload: GroupPayload): void {
    const runtime = this.requirePlayer(userId);
    if (!runtime) {
      return;
    }
    const username = sanitizeUsername(payload.username);
    const existing = runtime.state.social.groupMembers.indexOf(username);
    if (existing >= 0) {
      runtime.state.social.groupMembers.splice(existing, 1);
      this.toast(userId, `${username} removed from group`);
    } else if (runtime.state.social.groupMembers.length < 4) {
      runtime.state.social.groupMembers.push(username);
      this.toast(userId, `${username} added to group`);
    }
    this.saveCritical(runtime.state);
  }

  reportPlayer(userId: string, payload: ReportPayload): void {
    const runtime = this.requirePlayer(userId);
    if (!runtime) {
      return;
    }
    const username = sanitizeUsername(payload.username);
    runtime.state.social.reports.push(`${username}:${payload.reason.trim().slice(0, 48)}`);
    this.toast(userId, `Report stored for ${username}`);
    this.saveCritical(runtime.state);
  }

  updateBlacklist(userId: string, payload: BlacklistPayload): void {
    const runtime = this.requirePlayer(userId);
    if (!runtime) {
      return;
    }
    const username = sanitizeUsername(payload.username);
    const existing = runtime.state.social.blacklist.indexOf(username);
    if (existing >= 0) {
      runtime.state.social.blacklist.splice(existing, 1);
      this.toast(userId, `${username} removed from blacklist`);
    } else {
      runtime.state.social.blacklist.push(username);
      this.toast(userId, `${username} blacklisted`);
    }
    this.saveCritical(runtime.state);
  }

  resync(userId: string): void {
    const runtime = this.requirePlayer(userId);
    if (!runtime) {
      return;
    }
    runtime.socket.emit("server:state", this.buildWorldState(userId));
  }

  private tick(): void {
    const now = Date.now();

    for (const tree of this.trees) {
      if (!tree.available && tree.respawnAt <= now) {
        tree.available = true;
      }
    }

    for (const chest of this.chests) {
      if (chest.expiresAt <= now) {
        chest.opened = true;
      }
    }

    for (const slime of this.slimes) {
      if (!slime.alive && slime.respawnAt <= now) {
        slime.alive = true;
        slime.hp = slime.maxHp;
        continue;
      }
      if (!slime.alive) {
        continue;
      }

      const target = this.getNearestPlayer(slime.x, slime.y);
      if (!target) {
        continue;
      }

      const targetDistance = distance(target.state.position.x, target.state.position.y, slime.x, slime.y);
      if (targetDistance < 160 && targetDistance > 34) {
        const direction = normalizeVector(target.state.position.x - slime.x, target.state.position.y - slime.y);
        slime.x = clamp(slime.x + direction.x * 16, 24, WORLD_BOUNDS.width - 24);
        slime.y = clamp(slime.y + direction.y * 16, 24, WORLD_BOUNDS.height - 24);
      }

      if (targetDistance <= 36 && slime.attackReadyAt <= now) {
        slime.attackReadyAt = now + 1200;
        const damage = Math.max(2, 5 - getEquipmentBonus(target.state, "armor") + Math.floor(Math.random() * 3));
        target.state.hp = Math.max(0, target.state.hp - damage);
        this.toast(target.state.userId, `Slime hit you for ${damage}`);
        if (target.state.hp === 0) {
          this.handleDeath(target.state);
          this.saveCritical(target.state);
        }
      }
    }

    for (const runtime of this.players.values()) {
      const dt = Math.max(1, Math.min(150, now - runtime.lastTickAt));
      runtime.lastTickAt = now;
      const speed = 80 + runtime.state.stats.agi * 6;
      const maxDistance = (speed * dt) / 1000;
      runtime.state.position.x = clamp(runtime.state.position.x + runtime.input.x * maxDistance, 16, WORLD_BOUNDS.width - 16);
      runtime.state.position.y = clamp(runtime.state.position.y + runtime.input.y * maxDistance, 16, WORLD_BOUNDS.height - 16);
    }

    this.broadcastWorld();
  }

  private broadcastWorld(): void {
    for (const runtime of this.players.values()) {
      runtime.socket.emit("server:state", this.buildWorldState(runtime.state.userId));
    }
  }

  private buildWorldState(userId: string): WorldState {
    const runtime = this.players.get(userId);
    if (!runtime) {
      throw new Error("Player not connected");
    }

    return {
      self: runtime.state,
      players: Array.from(this.players.values())
        .filter((entry) => entry.state.userId !== userId)
        .map((entry): RemotePlayer => ({
          userId: entry.state.userId,
          username: entry.state.username,
          level: entry.state.level,
          hp: entry.state.hp,
          maxHp: entry.state.maxHp,
          position: entry.state.position,
          colors: entry.state.colors
        })),
      trees: this.trees,
      slimes: this.slimes.map(({ respawnAt: _respawnAt, attackReadyAt: _attackReadyAt, ...slime }) => slime),
      chests: this.chests.filter((entry) => !entry.opened),
      chat: this.chatLog.filter((entry) => !runtime.state.social.blacklist.includes(entry.from)),
      serverTime: Date.now()
    };
  }

  private seedWorld(): void {
    const treePositions = [
      [240, 260],
      [288, 228],
      [336, 292],
      [480, 224],
      [540, 280]
    ];
    const slimePositions = [
      [440, 450],
      [520, 500],
      [590, 430]
    ];

    this.trees.push(
      ...treePositions.map(([x, y], index) => ({
        id: `tree-${index + 1}`,
        x,
        y,
        available: true,
        respawnAt: 0
      }))
    );

    this.slimes.push(
      ...slimePositions.map(([x, y], index) => ({
        id: `slime-${index + 1}`,
        x,
        y,
        hp: 18,
        maxHp: 18,
        alive: true,
        respawnAt: 0,
        attackReadyAt: 0
      }))
    );
  }

  private mergePlayer(existing: PlayerState, username: string, colors: Colors): PlayerState {
    const merged: PlayerState = {
      ...existing,
      username,
      colors,
      lastSave: new Date().toISOString()
    };
    recalcVitals(merged);
    if (merged.questsActive.length === 0) {
      merged.questsActive = [generateQuest()];
    }
    return merged;
  }

  private createPlayer(userId: string, username: string, colors: Colors): PlayerState {
    const player: PlayerState = {
      userId,
      username,
      colors: colors ?? STARTER_COLORS,
      level: 1,
      exp: 0,
      expToNext: 40,
      hp: 40,
      maxHp: 40,
      statPoints: 0,
      stats: { ...BASE_STATS },
      position: {
        map: "starter_village",
        x: WORLD_BOUNDS.spawnX,
        y: WORLD_BOUNDS.spawnY
      },
      mastery: {
        woodcutter: 1,
        blacksmith: 1,
        warrior: 1,
        alchemist: 1
      },
      inventory: [makeMaterial("wood", "Wood", 2)],
      equipment: {
        weapon: null,
        legs: null
      },
      hotbar: [...DEFAULT_HOTBAR],
      questsActive: [generateQuest()],
      social: {
        friends: [],
        blacklist: [],
        groupMembers: [],
        reports: []
      },
      lastSave: new Date().toISOString()
    };
    recalcVitals(player);
    return player;
  }

  private getNearestPlayer(x: number, y: number): RuntimePlayer | null {
    let best: RuntimePlayer | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const runtime of this.players.values()) {
      const currentDistance = distance(x, y, runtime.state.position.x, runtime.state.position.y);
      if (currentDistance < bestDistance) {
        best = runtime;
        bestDistance = currentDistance;
      }
    }
    return best;
  }

  private spawnChest(x: number, y: number, lootBaseId: string): void {
    this.chests.push({
      id: `chest-${randomUUID()}`,
      x,
      y,
      lootBaseId,
      opened: false,
      expiresAt: Date.now() + CHEST_EXPIRE_MS
    });
  }

  private grantExp(player: PlayerState, amount: number): void {
    player.exp += amount;
    while (player.exp >= player.expToNext) {
      player.exp -= player.expToNext;
      player.level += 1;
      player.statPoints += 5;
      player.expToNext = 40 + player.level * 24;
      this.toast(player.userId, "Level up! Allocate 5 stat points.");
    }
  }

  private incrementMastery(player: PlayerState, key: string, amount: number): void {
    player.mastery[key] = (player.mastery[key] ?? 0) + amount;
  }

  private updateQuestProgress(player: PlayerState, targetId: string, amount: number): void {
    for (const quest of player.questsActive) {
      if (quest.completed || quest.targetId !== targetId) {
        continue;
      }
      quest.progress = Math.min(quest.goal, quest.progress + amount);
      if (quest.progress >= quest.goal) {
        quest.completed = true;
        this.grantExp(player, quest.reward.exp);
        if (quest.reward.items) {
          for (const item of quest.reward.items) {
            addStackableItem(player.inventory, item);
          }
        }
        this.toast(player.userId, `${quest.title} complete`);
      }
    }

    if (player.questsActive.every((quest: QuestInstance) => quest.completed)) {
      player.questsActive = [generateQuest()];
    }
  }

  private handleDeath(player: PlayerState): void {
    player.exp = Math.floor(player.exp * 0.9);
    player.position.x = WORLD_BOUNDS.spawnX;
    player.position.y = WORLD_BOUNDS.spawnY;
    recalcVitals(player);
    player.hp = player.maxHp;
    this.toast(player.userId, "You died and respawned in the village");
  }

  private toast(userId: string, message: string): void {
    const runtime = this.players.get(userId);
    if (!runtime) {
      return;
    }
    const payload: Toast = { message };
    runtime.socket.emit("server:toast", payload);
  }

  private respondAsBot(text: string): void {
    const lower = text.toLowerCase();
    let response = "Bot: keep moving. Wood, slimes, and potions are all active.";
    if (lower.includes("help")) {
      response = "Bot: harvest trees, craft gear, defeat slimes, then spend your stat points.";
    } else if (lower.includes("quest")) {
      response = "Bot: your quest panel only rolls wood and slime tasks in the starter zone.";
    } else if (lower.includes("friend")) {
      response = "Bot: use the social panel to add friends, group members, report, or blacklist.";
    }

    const message = createChatMessage("Bot", response, true);
    this.chatLog.push(message);
    this.chatLog.splice(0, Math.max(0, this.chatLog.length - 20));
    this.io.emit("server:chat", message);
  }

  private requirePlayer(userId: string): RuntimePlayer | null {
    return this.players.get(userId) ?? null;
  }

  private saveCritical(player: PlayerState): void {
    player.lastSave = new Date().toISOString();
    void this.store.savePlayer(player);
  }

  private async saveAll(): Promise<void> {
    await Promise.all(Array.from(this.players.values()).map(async (runtime) => {
      runtime.state.lastSave = new Date().toISOString();
      await this.store.savePlayer(runtime.state);
    }));
  }
}

function recalcVitals(player: PlayerState): void {
  const armor = getEquipmentBonus(player, "armor");
  player.maxHp = 28 + player.stats.vit * 12 + armor * 2;
  player.hp = Math.min(Math.max(player.hp, 1), player.maxHp);
}

function createChatMessage(from: string, text: string, system: boolean): ChatMessage {
  return {
    id: randomUUID(),
    from,
    text,
    system,
    createdAt: new Date().toISOString()
  };
}

function generateQuest(): QuestInstance {
  if (Math.random() > 0.5) {
    return {
      questId: randomUUID(),
      title: "Cull 2 slimes",
      progress: 0,
      goal: 2,
      kind: "hunt",
      targetId: "slime",
      reward: { exp: 24 },
      completed: false
    };
  }

  return {
    questId: randomUUID(),
    title: "Gather 4 wood",
    progress: 0,
    goal: 4,
    kind: "gather",
    targetId: "wood",
    reward: { exp: 18 },
    completed: false
  };
}

function makeMaterial(baseId: "wood" | "slime_gel", name: string, qty: number): ItemInstance {
  return {
    instanceId: `${baseId}-${randomUUID()}`,
    baseId,
    name,
    tier: 1,
    slot: "material",
    stats: {},
    qty,
    stackable: true
  };
}

function makePotion(): ItemInstance {
  return {
    instanceId: `potion-${randomUUID()}`,
    baseId: "health_potion",
    name: "Health Potion",
    tier: 1,
    slot: "consumable",
    stats: {},
    qty: 1,
    stackable: true
  };
}

function generateGear(baseId: "wood_sword" | "wood_leggings", name: string, level: number): ItemInstance {
  const tier = Math.max(1, Math.ceil(level / 3));
  const budget = 2 + tier + Math.floor(level / 2);
  const stats =
    baseId === "wood_sword"
      ? { dmg: budget + 2, str: Math.max(1, Math.floor(budget / 2)) }
      : { armor: budget + 1, vit: Math.max(1, Math.floor(budget / 2)) };

  return {
    instanceId: `${baseId}-${randomUUID()}`,
    baseId,
    name,
    tier,
    slot: baseId === "wood_sword" ? "weapon" : "legs",
    stats,
    qty: 1,
    stackable: false
  };
}

function addStackableItem(inventory: ItemInstance[], item: ItemInstance): void {
  if (!item.stackable) {
    inventory.push(item);
    return;
  }

  const existing = inventory.find((entry) => entry.baseId === item.baseId && entry.stackable);
  if (existing) {
    existing.qty += item.qty;
    return;
  }

  inventory.push(item);
}

function consumeItem(inventory: ItemInstance[], baseId: string, qty: number): void {
  const index = inventory.findIndex((entry) => entry.baseId === baseId && entry.qty >= qty);
  if (index === -1) {
    return;
  }
  decrementInventoryIndex(inventory, index, qty);
}

function decrementInventoryIndex(inventory: ItemInstance[], index: number, qty: number): void {
  inventory[index].qty -= qty;
  if (inventory[index].qty <= 0) {
    inventory.splice(index, 1);
  }
}

function countItem(inventory: ItemInstance[], baseId: string): number {
  return inventory
    .filter((entry) => entry.baseId === baseId)
    .reduce((sum, entry) => sum + entry.qty, 0);
}

function getEquipmentBonus(player: PlayerState, key: "dmg" | "armor"): number {
  const weapon = player.equipment.weapon?.stats[key] ?? 0;
  const legs = player.equipment.legs?.stats[key] ?? 0;
  return weapon + legs;
}

function normalizeVector(x: number, y: number): { x: number; y: number } {
  const length = Math.hypot(x, y);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return { x: x / length, y: y / length };
}

function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
