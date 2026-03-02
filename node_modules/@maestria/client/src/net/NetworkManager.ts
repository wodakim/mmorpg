import { io, type Socket } from "socket.io-client";
import type {
  AuthGuestPayload,
  ChatPayload,
  ClientToServerEvents,
  EquipPayload,
  ServerToClientEvents,
  WorldState
} from "@maestria/shared";

type Listener<T> = (payload: T) => void;

class NetworkManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private authPayload: AuthGuestPayload | null = null;
  private state: WorldState | null = null;
  private stateListeners = new Set<Listener<WorldState>>();
  private toastListeners = new Set<Listener<string>>();
  private chatListeners = new Set<Listener<void>>();
  private errorListeners = new Set<Listener<string>>();

  async connectAndAuth(payload: AuthGuestPayload): Promise<WorldState> {
    this.authPayload = payload;
    if (!this.socket) {
      this.createSocket();
    }

    const socket = this.socket;
    if (!socket) {
      throw new Error("Socket unavailable");
    }

    if (!socket.connected) {
      await new Promise<void>((resolve, reject) => {
        socket.once("connect", () => resolve());
        socket.once("connect_error", (error) => reject(error));
        socket.connect();
      });
    }

    return await new Promise<WorldState>((resolve) => {
      socket.emit("auth:guest", payload, (world: WorldState) => {
        this.state = world;
        this.emitState(world);
        resolve(world);
      });
    });
  }

  getState(): WorldState | null {
    return this.state;
  }

  onState(listener: Listener<WorldState>): () => void {
    this.stateListeners.add(listener);
    if (this.state) {
      listener(this.state);
    }
    return () => this.stateListeners.delete(listener);
  }

  onToast(listener: Listener<string>): () => void {
    this.toastListeners.add(listener);
    return () => this.toastListeners.delete(listener);
  }

  onChat(listener: Listener<void>): () => void {
    this.chatListeners.add(listener);
    return () => this.chatListeners.delete(listener);
  }

  onError(listener: Listener<string>): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  sendInput(x: number, y: number): void {
    this.socket?.emit("player:input", { x, y });
  }

  attack(): void {
    this.socket?.emit("action:attack", { intent: "primary" });
  }

  interact(): void {
    this.socket?.emit("action:interact", { intent: "primary" });
  }

  craft(recipeId: "wood_sword" | "wood_leggings" | "health_potion"): void {
    this.socket?.emit("action:craft", { recipeId });
  }

  equip(instanceId: string): void {
    const payload: EquipPayload = { instanceId };
    this.socket?.emit("action:equip", payload);
  }

  usePotion(): void {
    this.socket?.emit("action:potion", { intent: "primary" });
  }

  allocateStats(stat: "str" | "vit" | "agi" | "dex" | "int", amount = 1): void {
    this.socket?.emit("action:allocateStats", { stat, amount });
  }

  chat(text: string): void {
    const payload: ChatPayload = { text };
    this.socket?.emit("social:chat", payload);
  }

  addFriend(username: string): void {
    this.socket?.emit("social:addFriend", { username });
  }

  toggleGroup(username: string): void {
    this.socket?.emit("social:group", { username });
  }

  report(username: string, reason: string): void {
    this.socket?.emit("social:report", { username, reason });
  }

  toggleBlacklist(username: string): void {
    this.socket?.emit("social:blacklist", { username });
  }

  requestResync(): void {
    this.socket?.emit("client:resync");
  }

  private createSocket(): void {
    const url = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3001";
    const socket = io(url, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 5000
    });

    socket.on("server:state", (payload) => {
      this.state = payload;
      this.emitState(payload);
    });

    socket.on("server:chat", (payload) => {
      if (!this.state) {
        return;
      }
      this.state = {
        ...this.state,
        chat: [...this.state.chat, payload].slice(-20)
      };
      this.emitState(this.state);
      this.chatListeners.forEach((listener) => listener());
    });

    socket.on("server:toast", (payload) => {
      this.toastListeners.forEach((listener) => listener(payload.message));
    });

    socket.on("server:error", (payload) => {
      this.errorListeners.forEach((listener) => listener(payload.message));
    });

    socket.io.on("reconnect", () => {
      if (!this.authPayload) {
        return;
      }
      socket.emit("auth:guest", this.authPayload, (world: WorldState) => {
        this.state = world;
        this.emitState(world);
      });
    });

    this.socket = socket;
  }

  private emitState(state: WorldState): void {
    this.stateListeners.forEach((listener) => listener(state));
  }
}

export const network = new NetworkManager();
