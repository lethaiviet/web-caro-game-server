import { AllMessagesInRoom, DetailMessage, SimpleMessage } from '@/interfaces/chat-messages.interface';
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from '@/interfaces/socket.interface';
import { InsensitiveUserData, User, UserStates } from '@/interfaces/users.interface';
import PrivateChatRoomsService from '@/services/private-chat-rooms.service';
import { SocketIOService } from '@/services/socketio.service';
import UserService from '@/services/users.service';
import { Socket } from 'socket.io';

class ChatWorker {
  private socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private static onlineUsersID = new Set<string>();
  private privateChatRoomsService = new PrivateChatRoomsService();

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
    this.socket.on('chat:request:send-message-from-private-chat-room', async simpleMsg => await this.sendMessage(simpleMsg));
    this.socket.on(
      'chat:request:get-all-messages-from-private-chat-room',
      async anotherUserId => await this.getAllMessageFromPrivateChat(anotherUserId),
    );
  }

  private async getAllMessageFromPrivateChat(anotherUserId: string) {
    const currentUserId = this.getCurrentUserId();
    const messages: AllMessagesInRoom = await this.privateChatRoomsService.getAllMsgInRoom(currentUserId, anotherUserId);

    this.sendDataOnlyCurrentUser('chat:response:get-all-messages-from-private-chat-room', messages);
  }

  private async sendMessage(simpleMsg: SimpleMessage) {
    const commonMsg = { ...simpleMsg, from: this.getCurrentUserId() };
    const newMessage: DetailMessage = await this.privateChatRoomsService.addChatMsgToRoom(commonMsg);
    this.socket.broadcast.to(commonMsg.to).emit('chat:response:send-message-from-private-chat-room', newMessage);
  }

  private joinSingleRoom() {
    const id = this.getCurrentUserId();
    this.socket.join(id);
  }

  private async sendDataToRoom(roomName: string, key: string, value: any) {
    const socketIOService = SocketIOService.getInstance();
    if (socketIOService.ready) {
      socketIOService.sendMessageChatSpace(roomName, key, value);
    }
  }

  private sendDataOnlyCurrentUser(key: string, value: any) {
    const currentUserId = this.getCurrentUserId();
    this.sendDataToRoom(currentUserId, key, value);
  }

  private hasRoom(roomName: string): boolean {
    const socketIOService = SocketIOService.getInstance();
    return socketIOService.ready && socketIOService.checkExistRoomChatSpace(roomName);
  }

  private joinRoom(id: string): void {
    this.socket.join(id);
    this.socket.emit('chat:inform:joined-room', `you have joind ${id} room`);
  }

  private async getAllUserStatus(): Promise<void> {
    const userService: UserService = new UserService();
    const users: InsensitiveUserData[] = await userService.findAllUser();

    const usersStates: UserStates[] = users
      .filter(x => x._id.toString() !== this.getCurrentUserId())
      .map(x => {
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
