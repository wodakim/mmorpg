import path from "node:path";
import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@maestria/shared";
import { GameService } from "./domain/gameService.js";
import { registerSocketHandlers } from "./sockets/registerSocketHandlers.js";
import { FilePlayerStore } from "./store/FilePlayerStore.js";
import { log } from "./utils/logger.js";

const app = express();
const httpServer = createServer(app as never);
const port = Number(process.env.PORT ?? 3001);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());

app.get("/health", (_req: unknown, res: { json: (payload: unknown) => void }) => {
  res.json({
    ok: true,
    name: "maestria-server",
    now: new Date().toISOString()
  });
});

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: clientOrigin,
    credentials: true
  },
  pingInterval: 8000,
  pingTimeout: 5000
});

const store = new FilePlayerStore(path.join(process.cwd(), "data", "players"));
const game = new GameService(io, store);
registerSocketHandlers(io, game);

httpServer.listen(port, () => {
  log("info", "server_started", { port, clientOrigin });
});
