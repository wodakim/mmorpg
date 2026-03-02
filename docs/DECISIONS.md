# Decisions

## 2026-03-02

- `PLAN_ANDROID.md` existed, but `PLAN.md` did not. A lightweight `PLAN.md` alias was added so repo references stay consistent with the requested canonical path.
- The client uses a portrait-first internal resolution of `288x512`, which matches 9:16 exactly, keeps integer scaling simple, and preserves 32px world tiles.
- Menus and data-heavy panels use safe DOM overlays created through `createElement`, while the game world and touch controls stay inside Phaser. This keeps mobile text input stable for Android WebView without using raw HTML injection.
- All art is generated locally with Phaser graphics or simple shapes for the MVP so the project stays runnable without external asset downloads.
- The persistence milestone uses `server/data/players/<userId>.json` behind `IPlayerStore`, which keeps the migration path to MongoDB clean.
- The MVP quest system is procedural but constrained to entities already available in the starter zone: gather wood or defeat slimes.
