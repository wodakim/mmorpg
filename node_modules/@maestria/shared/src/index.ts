import { z } from "zod";

export const WORLD_BOUNDS = {
  width: 768,
  height: 768,
  spawnX: 384,
  spawnY: 416
} as const;

export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,16}$/;
export const CHAT_REGEX = /^[a-zA-Z0-9 _.,!?@#:'"()\-+/*]{1,140}$/;

export const UserIdSchema = z.string().uuid();
export const UsernameSchema = z.string().trim().regex(USERNAME_REGEX);
export const ChatTextSchema = z.string().trim().min(1).max(140).regex(CHAT_REGEX);

export const ColorsSchema = z.object({
  hair: z.number().int().min(0).max(2),
  body: z.number().int().min(0).max(2),
  pants: z.number().int().min(0).max(2)
});

export const StatBlockSchema = z.object({
  str: z.number().int().min(1),
  vit: z.number().int().min(1),
  agi: z.number().int().min(1),
  dex: z.number().int().min(1),
  int: z.number().int().min(1)
});

export const PositionSchema = z.object({
  map: z.string().min(1).max(32),
  x: z.number().min(0).max(WORLD_BOUNDS.width),
  y: z.number().min(0).max(WORLD_BOUNDS.height)
});

export const ItemStatsSchema = z.object({
  str: z.number().int().optional(),
  vit: z.number().int().optional(),
  agi: z.number().int().optional(),
  dex: z.number().int().optional(),
  int: z.number().int().optional(),
  dmg: z.number().int().optional(),
  armor: z.number().int().optional()
});

export const ItemInstanceSchema = z.object({
  instanceId: z.string().min(1).max(64),
  baseId: z.string().min(1).max(64),
  name: z.string().min(1).max(64),
  tier: z.number().int().min(1).max(99),
  slot: z.enum(["weapon", "legs", "consumable", "material"]),
  stats: ItemStatsSchema,
  qty: z.number().int().min(1).max(999),
  stackable: z.boolean()
});

export const QuestInstanceSchema = z.object({
  questId: z.string().min(1).max(64),
  title: z.string().min(1).max(80),
  progress: z.number().int().min(0).max(999),
  goal: z.number().int().min(1).max(999),
  kind: z.enum(["gather", "hunt"]),
  targetId: z.string().min(1).max(64),
  reward: z.object({
    exp: z.number().int().min(0).max(999999),
    items: z.array(ItemInstanceSchema).optional()
  }),
  completed: z.boolean()
});

export const EquipmentSchema = z.object({
  weapon: ItemInstanceSchema.nullable(),
  legs: ItemInstanceSchema.nullable()
});

export const SocialStateSchema = z.object({
  friends: z.array(z.string().min(1).max(32)),
  blacklist: z.array(z.string().min(1).max(32)),
  groupMembers: z.array(z.string().min(1).max(32)),
  reports: z.array(z.string().min(1).max(64))
});

export const HotbarSlotSchema = z.string().min(1).max(64).nullable();
export const DEFAULT_HOTBAR: Array<string | null> = [null, null, null, null, null];

export const PlayerStateSchema = z.object({
  userId: UserIdSchema,
  username: UsernameSchema,
  colors: ColorsSchema,
  level: z.number().int().min(1).max(999),
  exp: z.number().int().min(0).max(9999999),
  expToNext: z.number().int().min(1).max(9999999),
  hp: z.number().int().min(0).max(999999),
  maxHp: z.number().int().min(1).max(999999),
  statPoints: z.number().int().min(0).max(999),
  stats: StatBlockSchema,
  position: PositionSchema,
  mastery: z.record(z.string(), z.number().int().min(0).max(999)),
  inventory: z.array(ItemInstanceSchema),
  equipment: EquipmentSchema,
  hotbar: z.array(HotbarSlotSchema).length(5).default(() => [...DEFAULT_HOTBAR]),
  questsActive: z.array(QuestInstanceSchema),
  social: SocialStateSchema,
  lastSave: z.string().datetime()
});

export const RemotePlayerSchema = z.object({
  userId: UserIdSchema,
  username: UsernameSchema,
  level: z.number().int().min(1).max(999),
  hp: z.number().int().min(0).max(999999),
  maxHp: z.number().int().min(1).max(999999),
  position: PositionSchema,
  colors: ColorsSchema
});

export const TreeStateSchema = z.object({
  id: z.string().min(1).max(64),
  x: z.number(),
  y: z.number(),
  available: z.boolean(),
  respawnAt: z.number().int().min(0)
});

export const SlimeStateSchema = z.object({
  id: z.string().min(1).max(64),
  x: z.number(),
  y: z.number(),
  hp: z.number().int().min(0).max(9999),
  maxHp: z.number().int().min(1).max(9999),
  alive: z.boolean()
});

export const ChestStateSchema = z.object({
  id: z.string().min(1).max(64),
  x: z.number(),
  y: z.number(),
  lootBaseId: z.string().min(1).max(64),
  opened: z.boolean(),
  expiresAt: z.number().int().min(0)
});

export const ChatMessageSchema = z.object({
  id: z.string().min(1).max(64),
  from: z.string().min(1).max(32),
  text: z.string().min(1).max(140),
  system: z.boolean(),
  createdAt: z.string().datetime()
});

export const WorldStateSchema = z.object({
  self: PlayerStateSchema,
  players: z.array(RemotePlayerSchema),
  trees: z.array(TreeStateSchema),
  slimes: z.array(SlimeStateSchema),
  chests: z.array(ChestStateSchema),
  chat: z.array(ChatMessageSchema),
  serverTime: z.number().int().min(0)
});

export const AuthGuestPayloadSchema = z.object({
  userId: UserIdSchema,
  username: UsernameSchema,
  colors: ColorsSchema
});

export const MovementInputPayloadSchema = z.object({
  x: z.number().min(-1).max(1),
  y: z.number().min(-1).max(1)
});

export const SimpleActionPayloadSchema = z.object({
  intent: z.enum(["primary"])
});

export const CraftPayloadSchema = z.object({
  recipeId: z.enum(["wood_sword", "wood_leggings", "health_potion"])
});

export const EquipPayloadSchema = z.object({
  instanceId: z.string().min(1).max(64)
});

export const AllocateStatsPayloadSchema = z.object({
  stat: z.enum(["str", "vit", "agi", "dex", "int"]),
  amount: z.number().int().min(1).max(5)
});

export const ChatPayloadSchema = z.object({
  text: ChatTextSchema
});

export const FriendPayloadSchema = z.object({
  username: UsernameSchema
});

export const GroupPayloadSchema = z.object({
  username: UsernameSchema
});

export const ReportPayloadSchema = z.object({
  username: UsernameSchema,
  reason: z.string().trim().min(3).max(64)
});

export const BlacklistPayloadSchema = z.object({
  username: UsernameSchema
});

export const ServerErrorSchema = z.object({
  message: z.string().min(1).max(200)
});

export const ToastSchema = z.object({
  message: z.string().min(1).max(160)
});

export type Colors = z.infer<typeof ColorsSchema>;
export type StatBlock = z.infer<typeof StatBlockSchema>;
export type ItemInstance = z.infer<typeof ItemInstanceSchema>;
export type QuestInstance = z.infer<typeof QuestInstanceSchema>;
export type PlayerState = z.infer<typeof PlayerStateSchema>;
export type RemotePlayer = z.infer<typeof RemotePlayerSchema>;
export type TreeState = z.infer<typeof TreeStateSchema>;
export type SlimeState = z.infer<typeof SlimeStateSchema>;
export type ChestState = z.infer<typeof ChestStateSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type WorldState = z.infer<typeof WorldStateSchema>;

export type AuthGuestPayload = z.infer<typeof AuthGuestPayloadSchema>;
export type MovementInputPayload = z.infer<typeof MovementInputPayloadSchema>;
export type CraftPayload = z.infer<typeof CraftPayloadSchema>;
export type EquipPayload = z.infer<typeof EquipPayloadSchema>;
export type AllocateStatsPayload = z.infer<typeof AllocateStatsPayloadSchema>;
export type ChatPayload = z.infer<typeof ChatPayloadSchema>;
export type FriendPayload = z.infer<typeof FriendPayloadSchema>;
export type GroupPayload = z.infer<typeof GroupPayloadSchema>;
export type ReportPayload = z.infer<typeof ReportPayloadSchema>;
export type BlacklistPayload = z.infer<typeof BlacklistPayloadSchema>;
export type Toast = z.infer<typeof ToastSchema>;

export interface ServerToClientEvents {
  "server:state": (payload: WorldState) => void;
  "server:chat": (payload: ChatMessage) => void;
  "server:toast": (payload: Toast) => void;
  "server:error": (payload: z.infer<typeof ServerErrorSchema>) => void;
}

export interface ClientToServerEvents {
  "auth:guest": (payload: AuthGuestPayload, ack: (payload: WorldState) => void) => void;
  "player:input": (payload: MovementInputPayload) => void;
  "action:attack": (payload: z.infer<typeof SimpleActionPayloadSchema>) => void;
  "action:interact": (payload: z.infer<typeof SimpleActionPayloadSchema>) => void;
  "action:craft": (payload: CraftPayload) => void;
  "action:equip": (payload: EquipPayload) => void;
  "action:potion": (payload: z.infer<typeof SimpleActionPayloadSchema>) => void;
  "action:allocateStats": (payload: AllocateStatsPayload) => void;
  "social:chat": (payload: ChatPayload) => void;
  "social:addFriend": (payload: FriendPayload) => void;
  "social:group": (payload: GroupPayload) => void;
  "social:report": (payload: ReportPayload) => void;
  "social:blacklist": (payload: BlacklistPayload) => void;
  "client:resync": () => void;
}
