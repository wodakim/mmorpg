import { z } from "zod";
export declare const WORLD_BOUNDS: {
    readonly width: 768;
    readonly height: 768;
    readonly spawnX: 384;
    readonly spawnY: 416;
};
export declare const USERNAME_REGEX: RegExp;
export declare const CHAT_REGEX: RegExp;
export declare const UserIdSchema: z.ZodString;
export declare const UsernameSchema: z.ZodString;
export declare const ChatTextSchema: z.ZodString;
export declare const ColorsSchema: z.ZodObject<{
    hair: z.ZodNumber;
    body: z.ZodNumber;
    pants: z.ZodNumber;
}, z.core.$strip>;
export declare const StatBlockSchema: z.ZodObject<{
    str: z.ZodNumber;
    vit: z.ZodNumber;
    agi: z.ZodNumber;
    dex: z.ZodNumber;
    int: z.ZodNumber;
}, z.core.$strip>;
export declare const PositionSchema: z.ZodObject<{
    map: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
}, z.core.$strip>;
export declare const ItemStatsSchema: z.ZodObject<{
    str: z.ZodOptional<z.ZodNumber>;
    vit: z.ZodOptional<z.ZodNumber>;
    agi: z.ZodOptional<z.ZodNumber>;
    dex: z.ZodOptional<z.ZodNumber>;
    int: z.ZodOptional<z.ZodNumber>;
    dmg: z.ZodOptional<z.ZodNumber>;
    armor: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const ItemInstanceSchema: z.ZodObject<{
    instanceId: z.ZodString;
    baseId: z.ZodString;
    name: z.ZodString;
    tier: z.ZodNumber;
    slot: z.ZodEnum<{
        weapon: "weapon";
        legs: "legs";
        consumable: "consumable";
        material: "material";
    }>;
    stats: z.ZodObject<{
        str: z.ZodOptional<z.ZodNumber>;
        vit: z.ZodOptional<z.ZodNumber>;
        agi: z.ZodOptional<z.ZodNumber>;
        dex: z.ZodOptional<z.ZodNumber>;
        int: z.ZodOptional<z.ZodNumber>;
        dmg: z.ZodOptional<z.ZodNumber>;
        armor: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    qty: z.ZodNumber;
    stackable: z.ZodBoolean;
}, z.core.$strip>;
export declare const QuestInstanceSchema: z.ZodObject<{
    questId: z.ZodString;
    title: z.ZodString;
    progress: z.ZodNumber;
    goal: z.ZodNumber;
    kind: z.ZodEnum<{
        gather: "gather";
        hunt: "hunt";
    }>;
    targetId: z.ZodString;
    reward: z.ZodObject<{
        exp: z.ZodNumber;
        items: z.ZodOptional<z.ZodArray<z.ZodObject<{
            instanceId: z.ZodString;
            baseId: z.ZodString;
            name: z.ZodString;
            tier: z.ZodNumber;
            slot: z.ZodEnum<{
                weapon: "weapon";
                legs: "legs";
                consumable: "consumable";
                material: "material";
            }>;
            stats: z.ZodObject<{
                str: z.ZodOptional<z.ZodNumber>;
                vit: z.ZodOptional<z.ZodNumber>;
                agi: z.ZodOptional<z.ZodNumber>;
                dex: z.ZodOptional<z.ZodNumber>;
                int: z.ZodOptional<z.ZodNumber>;
                dmg: z.ZodOptional<z.ZodNumber>;
                armor: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            qty: z.ZodNumber;
            stackable: z.ZodBoolean;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    completed: z.ZodBoolean;
}, z.core.$strip>;
export declare const EquipmentSchema: z.ZodObject<{
    weapon: z.ZodNullable<z.ZodObject<{
        instanceId: z.ZodString;
        baseId: z.ZodString;
        name: z.ZodString;
        tier: z.ZodNumber;
        slot: z.ZodEnum<{
            weapon: "weapon";
            legs: "legs";
            consumable: "consumable";
            material: "material";
        }>;
        stats: z.ZodObject<{
            str: z.ZodOptional<z.ZodNumber>;
            vit: z.ZodOptional<z.ZodNumber>;
            agi: z.ZodOptional<z.ZodNumber>;
            dex: z.ZodOptional<z.ZodNumber>;
            int: z.ZodOptional<z.ZodNumber>;
            dmg: z.ZodOptional<z.ZodNumber>;
            armor: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        qty: z.ZodNumber;
        stackable: z.ZodBoolean;
    }, z.core.$strip>>;
    legs: z.ZodNullable<z.ZodObject<{
        instanceId: z.ZodString;
        baseId: z.ZodString;
        name: z.ZodString;
        tier: z.ZodNumber;
        slot: z.ZodEnum<{
            weapon: "weapon";
            legs: "legs";
            consumable: "consumable";
            material: "material";
        }>;
        stats: z.ZodObject<{
            str: z.ZodOptional<z.ZodNumber>;
            vit: z.ZodOptional<z.ZodNumber>;
            agi: z.ZodOptional<z.ZodNumber>;
            dex: z.ZodOptional<z.ZodNumber>;
            int: z.ZodOptional<z.ZodNumber>;
            dmg: z.ZodOptional<z.ZodNumber>;
            armor: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        qty: z.ZodNumber;
        stackable: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const SocialStateSchema: z.ZodObject<{
    friends: z.ZodArray<z.ZodString>;
    blacklist: z.ZodArray<z.ZodString>;
    groupMembers: z.ZodArray<z.ZodString>;
    reports: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const HotbarSlotSchema: z.ZodNullable<z.ZodString>;
export declare const DEFAULT_HOTBAR: Array<string | null>;
export declare const PlayerStateSchema: z.ZodObject<{
    userId: z.ZodString;
    username: z.ZodString;
    colors: z.ZodObject<{
        hair: z.ZodNumber;
        body: z.ZodNumber;
        pants: z.ZodNumber;
    }, z.core.$strip>;
    level: z.ZodNumber;
    exp: z.ZodNumber;
    expToNext: z.ZodNumber;
    hp: z.ZodNumber;
    maxHp: z.ZodNumber;
    statPoints: z.ZodNumber;
    stats: z.ZodObject<{
        str: z.ZodNumber;
        vit: z.ZodNumber;
        agi: z.ZodNumber;
        dex: z.ZodNumber;
        int: z.ZodNumber;
    }, z.core.$strip>;
    position: z.ZodObject<{
        map: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strip>;
    mastery: z.ZodRecord<z.ZodString, z.ZodNumber>;
    inventory: z.ZodArray<z.ZodObject<{
        instanceId: z.ZodString;
        baseId: z.ZodString;
        name: z.ZodString;
        tier: z.ZodNumber;
        slot: z.ZodEnum<{
            weapon: "weapon";
            legs: "legs";
            consumable: "consumable";
            material: "material";
        }>;
        stats: z.ZodObject<{
            str: z.ZodOptional<z.ZodNumber>;
            vit: z.ZodOptional<z.ZodNumber>;
            agi: z.ZodOptional<z.ZodNumber>;
            dex: z.ZodOptional<z.ZodNumber>;
            int: z.ZodOptional<z.ZodNumber>;
            dmg: z.ZodOptional<z.ZodNumber>;
            armor: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        qty: z.ZodNumber;
        stackable: z.ZodBoolean;
    }, z.core.$strip>>;
    equipment: z.ZodObject<{
        weapon: z.ZodNullable<z.ZodObject<{
            instanceId: z.ZodString;
            baseId: z.ZodString;
            name: z.ZodString;
            tier: z.ZodNumber;
            slot: z.ZodEnum<{
                weapon: "weapon";
                legs: "legs";
                consumable: "consumable";
                material: "material";
            }>;
            stats: z.ZodObject<{
                str: z.ZodOptional<z.ZodNumber>;
                vit: z.ZodOptional<z.ZodNumber>;
                agi: z.ZodOptional<z.ZodNumber>;
                dex: z.ZodOptional<z.ZodNumber>;
                int: z.ZodOptional<z.ZodNumber>;
                dmg: z.ZodOptional<z.ZodNumber>;
                armor: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            qty: z.ZodNumber;
            stackable: z.ZodBoolean;
        }, z.core.$strip>>;
        legs: z.ZodNullable<z.ZodObject<{
            instanceId: z.ZodString;
            baseId: z.ZodString;
            name: z.ZodString;
            tier: z.ZodNumber;
            slot: z.ZodEnum<{
                weapon: "weapon";
                legs: "legs";
                consumable: "consumable";
                material: "material";
            }>;
            stats: z.ZodObject<{
                str: z.ZodOptional<z.ZodNumber>;
                vit: z.ZodOptional<z.ZodNumber>;
                agi: z.ZodOptional<z.ZodNumber>;
                dex: z.ZodOptional<z.ZodNumber>;
                int: z.ZodOptional<z.ZodNumber>;
                dmg: z.ZodOptional<z.ZodNumber>;
                armor: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            qty: z.ZodNumber;
            stackable: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    hotbar: z.ZodDefault<z.ZodArray<z.ZodNullable<z.ZodString>>>;
    questsActive: z.ZodArray<z.ZodObject<{
        questId: z.ZodString;
        title: z.ZodString;
        progress: z.ZodNumber;
        goal: z.ZodNumber;
        kind: z.ZodEnum<{
            gather: "gather";
            hunt: "hunt";
        }>;
        targetId: z.ZodString;
        reward: z.ZodObject<{
            exp: z.ZodNumber;
            items: z.ZodOptional<z.ZodArray<z.ZodObject<{
                instanceId: z.ZodString;
                baseId: z.ZodString;
                name: z.ZodString;
                tier: z.ZodNumber;
                slot: z.ZodEnum<{
                    weapon: "weapon";
                    legs: "legs";
                    consumable: "consumable";
                    material: "material";
                }>;
                stats: z.ZodObject<{
                    str: z.ZodOptional<z.ZodNumber>;
                    vit: z.ZodOptional<z.ZodNumber>;
                    agi: z.ZodOptional<z.ZodNumber>;
                    dex: z.ZodOptional<z.ZodNumber>;
                    int: z.ZodOptional<z.ZodNumber>;
                    dmg: z.ZodOptional<z.ZodNumber>;
                    armor: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>;
                qty: z.ZodNumber;
                stackable: z.ZodBoolean;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        completed: z.ZodBoolean;
    }, z.core.$strip>>;
    social: z.ZodObject<{
        friends: z.ZodArray<z.ZodString>;
        blacklist: z.ZodArray<z.ZodString>;
        groupMembers: z.ZodArray<z.ZodString>;
        reports: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    lastSave: z.ZodString;
}, z.core.$strip>;
export declare const RemotePlayerSchema: z.ZodObject<{
    userId: z.ZodString;
    username: z.ZodString;
    level: z.ZodNumber;
    hp: z.ZodNumber;
    maxHp: z.ZodNumber;
    position: z.ZodObject<{
        map: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strip>;
    colors: z.ZodObject<{
        hair: z.ZodNumber;
        body: z.ZodNumber;
        pants: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const TreeStateSchema: z.ZodObject<{
    id: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    available: z.ZodBoolean;
    respawnAt: z.ZodNumber;
}, z.core.$strip>;
export declare const SlimeStateSchema: z.ZodObject<{
    id: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    hp: z.ZodNumber;
    maxHp: z.ZodNumber;
    alive: z.ZodBoolean;
}, z.core.$strip>;
export declare const ChestStateSchema: z.ZodObject<{
    id: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    lootBaseId: z.ZodString;
    opened: z.ZodBoolean;
    expiresAt: z.ZodNumber;
}, z.core.$strip>;
export declare const ChatMessageSchema: z.ZodObject<{
    id: z.ZodString;
    from: z.ZodString;
    text: z.ZodString;
    system: z.ZodBoolean;
    createdAt: z.ZodString;
}, z.core.$strip>;
export declare const WorldStateSchema: z.ZodObject<{
    self: z.ZodObject<{
        userId: z.ZodString;
        username: z.ZodString;
        colors: z.ZodObject<{
            hair: z.ZodNumber;
            body: z.ZodNumber;
            pants: z.ZodNumber;
        }, z.core.$strip>;
        level: z.ZodNumber;
        exp: z.ZodNumber;
        expToNext: z.ZodNumber;
        hp: z.ZodNumber;
        maxHp: z.ZodNumber;
        statPoints: z.ZodNumber;
        stats: z.ZodObject<{
            str: z.ZodNumber;
            vit: z.ZodNumber;
            agi: z.ZodNumber;
            dex: z.ZodNumber;
            int: z.ZodNumber;
        }, z.core.$strip>;
        position: z.ZodObject<{
            map: z.ZodString;
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strip>;
        mastery: z.ZodRecord<z.ZodString, z.ZodNumber>;
        inventory: z.ZodArray<z.ZodObject<{
            instanceId: z.ZodString;
            baseId: z.ZodString;
            name: z.ZodString;
            tier: z.ZodNumber;
            slot: z.ZodEnum<{
                weapon: "weapon";
                legs: "legs";
                consumable: "consumable";
                material: "material";
            }>;
            stats: z.ZodObject<{
                str: z.ZodOptional<z.ZodNumber>;
                vit: z.ZodOptional<z.ZodNumber>;
                agi: z.ZodOptional<z.ZodNumber>;
                dex: z.ZodOptional<z.ZodNumber>;
                int: z.ZodOptional<z.ZodNumber>;
                dmg: z.ZodOptional<z.ZodNumber>;
                armor: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            qty: z.ZodNumber;
            stackable: z.ZodBoolean;
        }, z.core.$strip>>;
        equipment: z.ZodObject<{
            weapon: z.ZodNullable<z.ZodObject<{
                instanceId: z.ZodString;
                baseId: z.ZodString;
                name: z.ZodString;
                tier: z.ZodNumber;
                slot: z.ZodEnum<{
                    weapon: "weapon";
                    legs: "legs";
                    consumable: "consumable";
                    material: "material";
                }>;
                stats: z.ZodObject<{
                    str: z.ZodOptional<z.ZodNumber>;
                    vit: z.ZodOptional<z.ZodNumber>;
                    agi: z.ZodOptional<z.ZodNumber>;
                    dex: z.ZodOptional<z.ZodNumber>;
                    int: z.ZodOptional<z.ZodNumber>;
                    dmg: z.ZodOptional<z.ZodNumber>;
                    armor: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>;
                qty: z.ZodNumber;
                stackable: z.ZodBoolean;
            }, z.core.$strip>>;
            legs: z.ZodNullable<z.ZodObject<{
                instanceId: z.ZodString;
                baseId: z.ZodString;
                name: z.ZodString;
                tier: z.ZodNumber;
                slot: z.ZodEnum<{
                    weapon: "weapon";
                    legs: "legs";
                    consumable: "consumable";
                    material: "material";
                }>;
                stats: z.ZodObject<{
                    str: z.ZodOptional<z.ZodNumber>;
                    vit: z.ZodOptional<z.ZodNumber>;
                    agi: z.ZodOptional<z.ZodNumber>;
                    dex: z.ZodOptional<z.ZodNumber>;
                    int: z.ZodOptional<z.ZodNumber>;
                    dmg: z.ZodOptional<z.ZodNumber>;
                    armor: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>;
                qty: z.ZodNumber;
                stackable: z.ZodBoolean;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        hotbar: z.ZodDefault<z.ZodArray<z.ZodNullable<z.ZodString>>>;
        questsActive: z.ZodArray<z.ZodObject<{
            questId: z.ZodString;
            title: z.ZodString;
            progress: z.ZodNumber;
            goal: z.ZodNumber;
            kind: z.ZodEnum<{
                gather: "gather";
                hunt: "hunt";
            }>;
            targetId: z.ZodString;
            reward: z.ZodObject<{
                exp: z.ZodNumber;
                items: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    instanceId: z.ZodString;
                    baseId: z.ZodString;
                    name: z.ZodString;
                    tier: z.ZodNumber;
                    slot: z.ZodEnum<{
                        weapon: "weapon";
                        legs: "legs";
                        consumable: "consumable";
                        material: "material";
                    }>;
                    stats: z.ZodObject<{
                        str: z.ZodOptional<z.ZodNumber>;
                        vit: z.ZodOptional<z.ZodNumber>;
                        agi: z.ZodOptional<z.ZodNumber>;
                        dex: z.ZodOptional<z.ZodNumber>;
                        int: z.ZodOptional<z.ZodNumber>;
                        dmg: z.ZodOptional<z.ZodNumber>;
                        armor: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strip>;
                    qty: z.ZodNumber;
                    stackable: z.ZodBoolean;
                }, z.core.$strip>>>;
            }, z.core.$strip>;
            completed: z.ZodBoolean;
        }, z.core.$strip>>;
        social: z.ZodObject<{
            friends: z.ZodArray<z.ZodString>;
            blacklist: z.ZodArray<z.ZodString>;
            groupMembers: z.ZodArray<z.ZodString>;
            reports: z.ZodArray<z.ZodString>;
        }, z.core.$strip>;
        lastSave: z.ZodString;
    }, z.core.$strip>;
    players: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        username: z.ZodString;
        level: z.ZodNumber;
        hp: z.ZodNumber;
        maxHp: z.ZodNumber;
        position: z.ZodObject<{
            map: z.ZodString;
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strip>;
        colors: z.ZodObject<{
            hair: z.ZodNumber;
            body: z.ZodNumber;
            pants: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    trees: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
        available: z.ZodBoolean;
        respawnAt: z.ZodNumber;
    }, z.core.$strip>>;
    slimes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
        hp: z.ZodNumber;
        maxHp: z.ZodNumber;
        alive: z.ZodBoolean;
    }, z.core.$strip>>;
    chests: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
        lootBaseId: z.ZodString;
        opened: z.ZodBoolean;
        expiresAt: z.ZodNumber;
    }, z.core.$strip>>;
    chat: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        from: z.ZodString;
        text: z.ZodString;
        system: z.ZodBoolean;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
    serverTime: z.ZodNumber;
}, z.core.$strip>;
export declare const AuthGuestPayloadSchema: z.ZodObject<{
    userId: z.ZodString;
    username: z.ZodString;
    colors: z.ZodObject<{
        hair: z.ZodNumber;
        body: z.ZodNumber;
        pants: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const MovementInputPayloadSchema: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, z.core.$strip>;
export declare const SimpleActionPayloadSchema: z.ZodObject<{
    intent: z.ZodEnum<{
        primary: "primary";
    }>;
}, z.core.$strip>;
export declare const CraftPayloadSchema: z.ZodObject<{
    recipeId: z.ZodEnum<{
        wood_sword: "wood_sword";
        wood_leggings: "wood_leggings";
        health_potion: "health_potion";
    }>;
}, z.core.$strip>;
export declare const EquipPayloadSchema: z.ZodObject<{
    instanceId: z.ZodString;
}, z.core.$strip>;
export declare const AllocateStatsPayloadSchema: z.ZodObject<{
    stat: z.ZodEnum<{
        str: "str";
        vit: "vit";
        agi: "agi";
        dex: "dex";
        int: "int";
    }>;
    amount: z.ZodNumber;
}, z.core.$strip>;
export declare const ChatPayloadSchema: z.ZodObject<{
    text: z.ZodString;
}, z.core.$strip>;
export declare const FriendPayloadSchema: z.ZodObject<{
    username: z.ZodString;
}, z.core.$strip>;
export declare const GroupPayloadSchema: z.ZodObject<{
    username: z.ZodString;
}, z.core.$strip>;
export declare const ReportPayloadSchema: z.ZodObject<{
    username: z.ZodString;
    reason: z.ZodString;
}, z.core.$strip>;
export declare const BlacklistPayloadSchema: z.ZodObject<{
    username: z.ZodString;
}, z.core.$strip>;
export declare const ServerErrorSchema: z.ZodObject<{
    message: z.ZodString;
}, z.core.$strip>;
export declare const ToastSchema: z.ZodObject<{
    message: z.ZodString;
}, z.core.$strip>;
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
//# sourceMappingURL=index.d.ts.map