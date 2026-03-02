import type { PlayerState } from "@maestria/shared";

export interface IPlayerStore {
  loadPlayer(userId: string): Promise<PlayerState | null>;
  savePlayer(player: PlayerState): Promise<void>;
}
