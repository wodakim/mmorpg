import type { Socket } from "socket.io";

type LimitRule = {
  max: number;
  windowMs: number;
};

const RULES: Record<string, LimitRule> = {
  "player:input": { max: 40, windowMs: 1000 },
  "action:attack": { max: 8, windowMs: 1000 },
  "action:interact": { max: 8, windowMs: 1000 },
  "action:craft": { max: 6, windowMs: 5000 },
  "action:potion": { max: 4, windowMs: 5000 },
  "social:chat": { max: 4, windowMs: 5000 },
  "social:addFriend": { max: 6, windowMs: 10000 },
  "social:group": { max: 6, windowMs: 10000 },
  "social:report": { max: 3, windowMs: 10000 },
  "social:blacklist": { max: 6, windowMs: 10000 }
};

export function attachSocketRateLimit(socket: Socket): void {
  const history = new Map<string, number[]>();

  socket.use((packet: unknown[], next: (err?: Error) => void) => {
    const eventName = String(packet[0]);
    const rule = RULES[eventName];
    if (!rule) {
      next();
      return;
    }

    const now = Date.now();
    const samples = (history.get(eventName) ?? []).filter((sample) => now - sample < rule.windowMs);
    if (samples.length >= rule.max) {
      next(new Error(`Rate limit exceeded for ${eventName}`));
      return;
    }

    samples.push(now);
    history.set(eventName, samples);
    next();
  });
}
