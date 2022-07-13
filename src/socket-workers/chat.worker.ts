import { AllMessagesInRoom, DetailMessage, SimpleMessage } from '@/interfaces/chat-messages.interface';
import { SocketClientEvents, InterServerEvents, SocketServerEvents, SocketData, SocketServerEventsName } from '@/interfaces/socket.interface';
import { User, UserStates } from '@/interfaces/users.interface';
import PrivateChatRoomsService from '@/services/private-chat-rooms.service';
import { SocketIOService } from '@/services/socketio.service';
import UserService from '@/services/users.service';
import { Socket } from 'socket.io';

class ChatWorker {
  private socket: Socket<SocketClientEvents, SocketServerEvents, InterServerEvents, SocketData>;
  private static onlineUsersID = new Set<string>();
  private privateChatRoomsService = new PrivateChatRoomsService();
  private userService = new UserService();

  constructor(socket: Socket) {
    this.socket = socket;
    this.init();
  }

  private init() {
    this.addUserIdIntoList();
    console.log(`[ChatWorker] User - ${this.socket.data.user.name} - join and the room has total ${ChatWorker.onlineUsersID.size} users online`);

    this.joinSingleRoom();
    this.socket.on('disconnect', () => this.disconnect());
    this.socket.on('chat:acknowledgement:get-all-users-status', async callback => await this.sendAllUserStatusToCurrentUser(callback));
    this.socket.on('chat:request:send-private-message', async simpleMsg => await this.sendPrivateMessage(simpleMsg));
    this.socket.on(
      'chat:request:get-all-private-messages-in-room',
      async anotherUserId => await this.sendAllPrivateMessageInRoomToCurrentUser(anotherUserId),
    );
    this.socket.on('chat:request:get-all-private-messages-in-all-rooms', async () => await this.sendAllPrivateMessagesInAllRoomsToCurrentUser());
    this.socket.on(
      'chat:action:mark-as-read-all-private-messages-in-room',
      async anotherUserId => await this.markAsReadAllPrivateMessagesInRoom(anotherUserId),
    );

    this.informAllUsersAboutStatus();
  }

  private informAllUsersAboutStatus() {
    const informAllUsers = async () => {
      //send all users (except current user) a message
      this.socket.broadcast.emit('chat:inform:get-all-users-status', await this.getAllUserStatus());
    };

    informAllUsers();
  }

  private async markAsReadAllPrivateMessagesInRoom(anotherUserId: string) {
    const currentUserId = this.getCurrentUserId();
    await this.privateChatRoomsService.markAsReadAllMessagesInRoom(currentUserId, anotherUserId);
    await this.sendAllPrivateMessageInRoomToCurrentUser(anotherUserId);
  }

  private async sendAllPrivateMessagesInAllRoomsToCurrentUser() {
    const currentUserId = this.getCurrentUserId();
    const allMessages: AllMessagesInRoom[] = await this.userService.getAllPrivateMessagesInAllRooms(currentUserId);

    this.sendDataToCurrentUser('chat:response:get-all-private-messages-in-all-rooms', allMessages);
  }

  private async sendAllPrivateMessageInRoomToCurrentUser(anotherUserId: string) {
    const currentUserId = this.getCurrentUserId();
    const messages: AllMessagesInRoom = await this.privateChatRoomsService.getAllMessagesInRoom(currentUserId, anotherUserId);

    this.sendDataToCurrentUser('chat:response:get-all-private-messages-in-room', messages);
  }

  private async sendPrivateMessage(simpleMsg: SimpleMessage) {
    const commonMsg = { ...simpleMsg, from: this.getCurrentUserId() };
    const newMessage: DetailMessage = await this.privateChatRoomsService.addChatMsgToRoom(commonMsg);
    this.socket.broadcast.to(commonMsg.to).emit('chat:response:send-private-message', newMessage);
  }

  private joinSingleRoom() {
    const id = this.getCurrentUserId();
    this.socket.join(id);
  }

  private async sendAllUserStatusToCurrentUser(callback: (data: UserStates[]) => void): Promise<void> {
    const usersStates: UserStates[] = await this.getAllUserStatus();
    callback(usersStates);
    // this.sendDataToCurrentUser('chat:response:get-all-users-status', usersStates);
  }

  private disconnect() {
    this.removeUserIdFromList();
    this.informAllUsersAboutStatus();
    this.socket.removeAllListeners();
    this.socket.disconnect(true);

    console.log(`[ChatWorker] User - ${this.socket.data.user.name} - quite and the room has total ${ChatWorker.onlineUsersID.size} users online`);
  }

  private getCurrentUser(): User {
    return this.socket.data.user;
  }

  private getCurrentUserId(): string {
    const currentUser = this.getCurrentUser();
    return currentUser._id.toString();
  }

  private addUserIdIntoList(): void {
    const id = this.getCurrentUserId();
    ChatWorker.onlineUsersID.add(id);
  }

  private removeUserIdFromList(): void {
    const id = this.getCurrentUserId();
    ChatWorker.onlineUsersID.delete(id);
  }

  private async getAllUserStatus(): Promise<UserStates[]> {
    return await this.userService.getAllUserStatus(ChatWorker.onlineUsersID);
  }

  private sendDataToCurrentUser(key: SocketServerEventsName, value: any) {
    const currentUserId = this.getCurrentUserId();
    SocketIOService.getInstance().sendMessageChatSpace(currentUserId, key, value);
  }
}

export default ChatWorker;
