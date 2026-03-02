# AGENTS.md - Codex Agent Contract

Source of truth: [PLAN.md](/D:/Game_test/PLAN.md)

Priority order:
- security
- mobile stability
- performance
- gameplay feel
- feature breadth

Delivery rules:
- Work mobile-first for Android Chrome/WebView.
- Default orientation is portrait 9:16.
- Desktop is debug-only and must not drive UX decisions.
- Keep all touch targets at or above 48dp equivalent.
- Do not add hover-based interactions.
- Use `PLAN.md` for product and technical decisions.
- If `PLAN.md` leaves a mobile-critical detail unspecified, document the decision in [docs/DECISIONS.md](/D:/Game_test/docs/DECISIONS.md).

Non-negotiable rendering rules:
- Phaser must run with `pixelArt: true`.
- Phaser must run with `roundPixels: true`.
- Use integer scaling against the viewport.
- Avoid blur and heavy post-processing.
- Keep assets local and whitelisted only.

Non-negotiable platform rules:
- Support pause/resume for Android WebView.
- Handle virtual keyboard without layout jumps or browser zoom.
- Unlock audio only after first user interaction.
- Support reconnect and authoritative resync after unstable network events.

Security rules:
- Never use `eval`, `new Function`, or raw `innerHTML`.
- Validate every Socket.io payload with Zod on the server.
- Sanitize and length-limit usernames, chat, and user-generated input.
- Rate-limit socket actions.
- Keep the server authoritative for movement, distance, combat, craft, loot, and cooldowns.

Architecture rules:
- Monorepo workspaces: `client/`, `server/`, `shared/`, `docs/`.
- `shared/` owns cross-package types and schemas.
- `server/` must expose `IPlayerStore` plus a runnable JSON `FileStore`.
- Auto-save every 10 seconds, on disconnect, and on critical events.

Definition of done for this MVP:
- `npm run dev` boots client and server.
- Guest flow works: Title -> Menu -> Character Create -> Game.
- Mobile controls work: joystick left, actions right.
- Trees, slimes, chest loot, crafting, potions, level-up stats, and social stubs work through the server.
- Reconnect restores authoritative state from the server.
