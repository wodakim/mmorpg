import "./styles/main.css";
import { createGame, getAdaptiveGameSize } from "./game";

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

const initialSize = getAdaptiveGameSize(window.innerWidth, window.innerHeight);
canvasWrap.style.width = `${initialSize.width}px`;
canvasWrap.style.height = `${initialSize.height}px`;
const game = createGame(canvasWrap, initialSize);

function getVisualViewportMetrics(): { height: number; offsetTop: number; bottomInset: number } {
  const viewport = window.visualViewport;
  if (!viewport) {
    return {
      height: window.innerHeight,
      offsetTop: 0,
      bottomInset: 0
    };
  }

  const height = Math.floor(viewport.height);
  const offsetTop = Math.max(0, Math.floor(viewport.offsetTop));
  const bottomInset = Math.max(0, Math.floor(window.innerHeight - (viewport.height + viewport.offsetTop)));

  return { height, offsetTop, bottomInset };
}

function applyViewportMetrics(): void {
  const metrics = getVisualViewportMetrics();
  canvasWrap.style.setProperty("--vv-height", `${metrics.height}px`);
  canvasWrap.style.setProperty("--vv-offset-top", `${metrics.offsetTop}px`);
  canvasWrap.style.setProperty("--vv-bottom-inset", `${metrics.bottomInset}px`);
}

window.addEventListener("resize", applyViewportMetrics);
window.addEventListener("orientationchange", () => {
  window.location.reload();
});
window.visualViewport?.addEventListener("resize", applyViewportMetrics, { passive: true });
window.visualViewport?.addEventListener("scroll", applyViewportMetrics, { passive: true });
applyViewportMetrics();

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
