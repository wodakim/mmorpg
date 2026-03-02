import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_HOTBAR, PlayerStateSchema, type PlayerState } from "@maestria/shared";
import type { IPlayerStore } from "./IPlayerStore.js";
import { log } from "../utils/logger.js";

export class FilePlayerStore implements IPlayerStore {
  constructor(private readonly rootDir: string) {}

  async loadPlayer(userId: string): Promise<PlayerState | null> {
    const filePath = this.getPlayerPath(userId);
    try {
      const raw = await readFile(filePath, "utf8");
      const parsedJson = JSON.parse(raw) as unknown;
      const migrated = migrateLegacyPlayerSave(parsedJson);
      const validated = PlayerStateSchema.safeParse(migrated);
      if (!validated.success) {
        log("warn", "player_save_invalid_fallback_default", {
          userId,
          filePath,
          issues: validated.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        });
        return null;
      }
      return validated.data;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      log("warn", "player_save_load_failed_fallback_default", {
        userId,
        filePath,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  async savePlayer(player: PlayerState): Promise<void> {
    await mkdir(this.rootDir, { recursive: true });
    const filePath = this.getPlayerPath(player.userId);
    await writeFile(filePath, JSON.stringify(player, null, 2), "utf8");
  }

  private getPlayerPath(userId: string): string {
    return path.join(this.rootDir, `${userId}.json`);
  }
}

function migrateLegacyPlayerSave(input: unknown): unknown {
  if (!isRecord(input)) {
    return input;
  }

  return {
    ...input,
    hotbar: normalizeHotbar(input.hotbar)
  };
}

function normalizeHotbar(input: unknown): Array<string | null> {
  if (!Array.isArray(input)) {
    return [...DEFAULT_HOTBAR];
  }

  const normalized = input.slice(0, 5).map((slot) => {
    if (typeof slot !== "string") {
      return null;
    }

    const trimmed = slot.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

  while (normalized.length < 5) {
    normalized.push(null);
  }

  return normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
