import "./styles/main.css";
import { createGame, GAME_HEIGHT, GAME_WIDTH } from "./game";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing app root");
}

const shell = document.createElement("div");
shell.className = "game-shell";
const canvasWrap = document.createElement("div");
canvasWrap.className = "canvas-wrap";
canvasWrap.id = "game-root";
const overlay = document.createElement("div");
overlay.className = "overlay-root";
overlay.id = "overlay-root";

canvasWrap.appendChild(overlay);
shell.appendChild(canvasWrap);
app.appendChild(shell);

const game = createGame(canvasWrap);

function resizeGame(): void {
  const scale = Math.max(1, Math.floor(Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT)));
  canvasWrap.style.width = `${GAME_WIDTH * scale}px`;
  canvasWrap.style.height = `${GAME_HEIGHT * scale}px`;
}

window.addEventListener("resize", resizeGame);
window.addEventListener("orientationchange", resizeGame);
resizeGame();

document.addEventListener(
  "visibilitychange",
  () => {
    if (document.hidden) {
      game.loop.sleep();
      return;
    }
    game.loop.wake();
  },
  { passive: true }
);
