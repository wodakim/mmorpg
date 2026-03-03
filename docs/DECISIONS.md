# Decisions

## 2026-03-02

- `PLAN_ANDROID.md` existed, but `PLAN.md` did not. A lightweight `PLAN.md` alias was added so repo references stay consistent with the requested canonical path.
- The client uses a portrait-first internal resolution of `288x512`, which matches 9:16 exactly, keeps integer scaling simple, and preserves 32px world tiles.
- Menus and data-heavy panels use safe DOM overlays created through `createElement`, while the game world and touch controls stay inside Phaser. This keeps mobile text input stable for Android WebView without using raw HTML injection.
- All art is generated locally with Phaser graphics or simple shapes for the MVP so the project stays runnable without external asset downloads.
- The persistence milestone uses `server/data/players/<userId>.json` behind `IPlayerStore`, which keeps the migration path to MongoDB clean.
- The MVP quest system is procedural but constrained to entities already available in the starter zone: gather wood or defeat slimes.
- To reduce UI clutter on smaller portrait screens, the in-game chat panel is now collapsed by default and expanded on demand, while overlay panels are scrollable with bounded height.
- Buttons labeled as not-yet-implemented features must open an explicit in-construction popup so no touch target is silent.
- Small button style was raised to a 48px minimum height to stay aligned with the 48dp touch target rule.
- Regression safety decision: the client is pinned back to the proven `288x512` internal portrait resolution with integer scaling at runtime because adaptive internal-size boot caused a white-screen regression on target devices; playability is prioritized until a safer adaptive approach is validated on Android hardware.
- HUD and chat overlays now anchor to visual viewport metrics (`visualViewport` height/offset/bottom inset) so very small Android screens and virtual keyboard states keep panels inside usable space without forcing abrupt game-canvas jumps.
- Login menu visual cleanup: remove duplicate Phaser header text in `MenuScene` and pin the login overlay panel to viewport edges (top/bottom) so the UI matches mobile mock expectations and avoids stacked redundant blocks.
- Title screen was redesigned as a single centered, full-height mobile panel with a large 58px tap CTA to improve first-screen readability and thumb reach on smartphones.
- UI typography now uses Google Font `Press Start 2P` globally (DOM + Phaser text) to provide a consistent retro style across all screens.
- The game viewport now fills the full available smartphone viewport dimensions at boot (with minimum guards) to avoid visible side/top gutters.
