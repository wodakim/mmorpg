# Security

This MVP applies the following baseline controls:

- No `eval`, `new Function`, or raw `innerHTML`.
- Server-side Zod validation for every Socket.io payload.
- Username and chat sanitation through whitelist rules and length caps.
- Socket rate limiting for spam-sensitive actions such as chat, attack, interact, craft, potion, and social calls.
- Server-authoritative validation for movement distance, combat resolution, crafting, loot, and cooldown timing.
- Local-only asset generation for the MVP. No user-provided asset URLs are loaded.
- Auto-save on a fixed interval, on disconnect, and on critical progression events.

Residual risks:

- Guest auth is intentionally weak and should be replaced by account auth in a later phase.
- File-based persistence is not suitable for horizontal scaling and should be replaced by MongoDB through the store adapter already prepared in this repo.
