import type { Server, Socket } from "socket.io";
import {
  AllocateStatsPayloadSchema,
  type AllocateStatsPayload,
  AuthGuestPayloadSchema,
  type AuthGuestPayload,
  BlacklistPayloadSchema,
  type BlacklistPayload,
  ChatPayloadSchema,
  type ChatPayload,
  CraftPayloadSchema,
  type CraftPayload,
  EquipPayloadSchema,
  type EquipPayload,
  FriendPayloadSchema,
  type FriendPayload,
  GroupPayloadSchema,
  type GroupPayload,
  MovementInputPayloadSchema,
  type MovementInputPayload,
  ReportPayloadSchema,
  type ReportPayload,
  SimpleActionPayloadSchema,
  type ClientToServerEvents,
  type ServerToClientEvents
} from "@maestria/shared";
import { GameService } from "../domain/gameService.js";
import { attachSocketRateLimit } from "../middleware/rateLimit.js";

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  game: GameService
): void {
  io.on("connection", (socket) => {
    attachSocketRateLimit(socket);

    let userId = "";

    socket.on("auth:guest", async (payload: AuthGuestPayload, ack: (state: Awaited<ReturnType<GameService["connectGuest"]>>) => void) => {
      const parsed = AuthGuestPayloadSchema.parse(payload);
      userId = parsed.userId;
      const state = await game.connectGuest(socket as Socket<ClientToServerEvents, ServerToClientEvents>, parsed);
      ack(state);
    });

    socket.on("player:input", (payload: MovementInputPayload) => {
      if (!userId) {
        return;
      }
      game.setInput(userId, MovementInputPayloadSchema.parse(payload));
    });

    socket.on("action:attack", (payload: { intent: "primary" }) => {
      if (!userId) {
        return;
      }
      SimpleActionPayloadSchema.parse(payload);
      game.attack(userId);
    });

    socket.on("action:interact", (payload: { intent: "primary" }) => {
      if (!userId) {
        return;
      }
      SimpleActionPayloadSchema.parse(payload);
      game.interact(userId);
    });

    socket.on("action:craft", (payload: CraftPayload) => {
      if (!userId) {
        return;
      }
      const parsed = CraftPayloadSchema.parse(payload);
      game.craft(userId, parsed.recipeId);
    });

    socket.on("action:equip", (payload: EquipPayload) => {
      if (!userId) {
        return;
      }
      game.equip(userId, EquipPayloadSchema.parse(payload));
    });

    socket.on("action:potion", (payload: { intent: "primary" }) => {
      if (!userId) {
        return;
      }
      SimpleActionPayloadSchema.parse(payload);
      game.usePotion(userId);
    });

    socket.on("action:allocateStats", (payload: AllocateStatsPayload) => {
      if (!userId) {
        return;
      }
      const parsed = AllocateStatsPayloadSchema.parse(payload);
      game.allocateStats(userId, parsed.stat, parsed.amount);
    });

    socket.on("social:chat", (payload: ChatPayload) => {
      if (!userId) {
        return;
      }
      game.sendChat(userId, ChatPayloadSchema.parse(payload));
    });

    socket.on("social:addFriend", (payload: FriendPayload) => {
      if (!userId) {
        return;
      }
      game.addFriend(userId, FriendPayloadSchema.parse(payload));
    });

    socket.on("social:group", (payload: GroupPayload) => {
      if (!userId) {
        return;
      }
      game.updateGroup(userId, GroupPayloadSchema.parse(payload));
    });

    socket.on("social:report", (payload: ReportPayload) => {
      if (!userId) {
        return;
      }
      game.reportPlayer(userId, ReportPayloadSchema.parse(payload));
    });

    socket.on("social:blacklist", (payload: BlacklistPayload) => {
      if (!userId) {
        return;
      }
      game.updateBlacklist(userId, BlacklistPayloadSchema.parse(payload));
    });

    socket.on("client:resync", () => {
      if (!userId) {
        return;
      }
      game.resync(userId);
    });

    socket.on("disconnect", () => {
      game.disconnect(socket.id);
    });
  });
}
