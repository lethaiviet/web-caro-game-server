import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from '@/interfaces/socket.interface';
import { InsensitiveUserData, User, UserStates } from '@/interfaces/users.interface';
import { SocketIOService } from '@/services/socketio.service';
import UserService from '@/services/users.service';
import { Socket } from 'socket.io';

class ChatWorker {
  private socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private static onlineUsersID = new Set<string>();

  constructor(socket: Socket) {
    this.socket = socket;
    this.init();
  }

  private getCurrentUser(): User {
    return this.socket.data.user;
  }

  private getCurrentUserId(): string {
    const currentUser = this.getCurrentUser();
    return currentUser._id.toString();
  }

  private isUserOnlineStatus(): boolean {
    const id = this.getCurrentUserId();
    return ChatWorker.onlineUsersID.has(id);
  }

  private addUserIdIntoList(): void {
    const id = this.getCurrentUserId();
    ChatWorker.onlineUsersID.add(id);
  }

  private removeUserIdFromList(): void {
    const id = this.getCurrentUserId();
    ChatWorker.onlineUsersID.delete(id);
  }

  private init() {
    this.addUserIdIntoList();
    console.log(`[ChatWorker] User - ${this.socket.data.user.name} - join and the room has total ${ChatWorker.onlineUsersID.size} users online`);

    this.socket.onAny((event, ...args) => {
      console.log(event, args);
    });

    this.joinSingleRoom();
    this.socket.on('disconnect', () => this.disconnect());
    this.socket.on('chat:action:join-room', id => this.joinRoom(id));
    this.socket.on('chat:request:get-all-users-status', async () => await this.getAllUserStatus());
  }

  private joinSingleRoom() {
    const id = this.getCurrentUserId();
    this.socket.join(id);
  }

  private sendDataOnlyCurrentUser(key: string, value: any) {
    const currentUserId = this.getCurrentUserId();
    const socketIOService = SocketIOService.getInstance();
    if (socketIOService.ready) {
      socketIOService.sendMessageChatSpace(currentUserId, key, value);
    }
  }

  private joinRoom(id: string): void {
    this.socket.join(id);
    this.socket.emit('chat:inform:joined-room', `you have joind ${id} room`);
  }

  private async getAllUserStatus(): Promise<void> {
    const userService: UserService = new UserService();
    const users: InsensitiveUserData[] = await userService.findAllUser();

    const usersStates: UserStates[] = users.map(x => {
      const status = ChatWorker.onlineUsersID.has(x._id.toString()) ? 'Online' : 'Offline';
      return {
        _id: x._id,
        name: x.name,
        avatar: x.avatar,
        status,
      };
    });

    this.sendDataOnlyCurrentUser('chat:response:get-all-users-status', usersStates);
  }

  private disconnect() {
    this.removeUserIdFromList();
    this.socket.removeAllListeners();
    this.socket.disconnect(true);

    console.log(`[ChatWorker] User - ${this.socket.data.user.name} - quite and the room has total ${ChatWorker.onlineUsersID.size} users online`);
  }
}

export default ChatWorker;
