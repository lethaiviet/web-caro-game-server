import { Server, ServerOptions } from 'socket.io';
import { Server as HttpServer } from 'http';
import { SocketClientEvents, InterServerEvents, SocketServerEvents, SocketServerEventsName, SocketData } from '@/interfaces/socket.interface';

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

  public getSocketControl(): Server<SocketClientEvents, SocketServerEvents, InterServerEvents, SocketData> {
    if (!SocketIOService.server) {
      throw new Error('IO server requested before initialization');
    }

    return SocketIOService.server;
  }

  public sendMessage(spacename: string, roomId: string | string[], key: SocketServerEventsName, message: any) {
    this.getSocketControl().of(spacename).to(roomId).emit(key, message);
  }

  public sendMessageChatSpace(roomId: string | string[], key: SocketServerEventsName, message: any) {
    if (this.ready()) this.getSocketControl().of('/chat').to(roomId).emit(key, message);
  }

  public sendMessageAllChatSpace(event: SocketServerEventsName, data: any) {
    if (this.ready()) this.getSocketControl().of('/chat').emit(event, data);
  }

  public checkExistRoomChatSpace(roomName: string) {
    const isExist = this.getSocketControl().of('/chat').adapter.rooms.has(roomName);
    return isExist;
  }
}
