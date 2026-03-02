import { CHAT_REGEX, USERNAME_REGEX } from "@maestria/shared";

export function sanitizeUsername(input: string): string {
  const trimmed = input.trim();
  if (!USERNAME_REGEX.test(trimmed)) {
    throw new Error("Invalid username");
  }
  return trimmed;
}

export function sanitizeChat(input: string): string {
  const trimmed = input.trim();
  if (!CHAT_REGEX.test(trimmed)) {
    throw new Error("Invalid chat");
  }
  return trimmed;
}
