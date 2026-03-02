declare module "socket.io" {
  export interface Socket<ClientEvents = any, ServerEvents = any> {
    id: string;
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    use(fn: (packet: unknown[], next: (err?: Error) => void) => void): void;
  }

  export class Server<ClientEvents = any, ServerEvents = any> {
    constructor(...args: any[]);
    on(event: "connection", listener: (socket: Socket<ClientEvents, ServerEvents>) => void): this;
    emit(event: string, ...args: any[]): boolean;
  }
}
