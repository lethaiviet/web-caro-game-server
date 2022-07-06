import { Server, ServerOptions } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketIOService {
  private static instance: SocketIOService | undefined;
  private static server: Server | undefined;

  private constructor() {
    // Private constructor ensures singleton instance
  }

  public static getInstance(): SocketIOService {
    if (!this.instance) {
      return new SocketIOService();
    }

    return this.instance;
  }

  public initialize(httpServer: HttpServer, opts?: Partial<ServerOptions>) {
    SocketIOService.server = new Server(httpServer, opts);

    return SocketIOService.server;
  }

  public ready() {
    return SocketIOService.server !== null;
  }

  public getSocketControl(): Server {
    if (!SocketIOService.server) {
      throw new Error('IO server requested before initialization');
    }

    return SocketIOService.server;
  }

  public sendMessage(spacename: string, roomId: string | string[], key: string, message: any) {
    this.getSocketControl().of(spacename).to(roomId).emit(key, message);
  }

  public sendMessageChatSpace(roomId: string | string[], key: string, message: any) {
    this.getSocketControl().of('/chat').to(roomId).emit(key, message);
  }

  public sendMessageAll(key: string, message: any) {
    this.getSocketControl().emit(key, message);
  }
}
