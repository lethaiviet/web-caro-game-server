import { SocketClientEvents, SocketServerEvents, InterServerEvents, SocketData, SocketServerEventsName } from '@/interfaces/socket.interface';
import { User } from '@/interfaces/users.interface';
import { SocketIOService } from '@/services/socketio.service';
import { Socket } from 'socket.io';

abstract class BaseWorker {
  protected socket: Socket<SocketClientEvents, SocketServerEvents, InterServerEvents, SocketData>;

  constructor(socket: Socket) {
    this.socket = socket;
    this.joinSingleRoom();
  }

  protected sendDataToCurrentUserOnChatSpace(key: SocketServerEventsName, value: any) {
    const currentUserId = this.getCurrentUserId();
    SocketIOService.getInstance().sendDataToChatSpace(currentUserId, key, value);
  }

  protected sendDataToCurrentUserOnGameSpace(key: SocketServerEventsName, value: any) {
    const currentUserId = this.getCurrentUserId();
    SocketIOService.getInstance().sendDataToGameSpace(currentUserId, key, value);
  }

  protected disconnectSocket() {
    this.socket.removeAllListeners();
    this.socket.disconnect(true);
  }

  protected getCurrentUserId(): string {
    const currentUser = this.getCurrentUser();
    return currentUser._id.toString();
  }

  protected getCurrentUserName(): string {
    const currentUser = this.getCurrentUser();
    return currentUser.name;
  }

  private getCurrentUser(): User {
    return this.socket.data.user;
  }

  private joinSingleRoom() {
    const id = this.getCurrentUserId();
    this.socket.join(id);
  }
}

export default BaseWorker;
