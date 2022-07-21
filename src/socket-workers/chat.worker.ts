import { AllMessagesInRoom, DetailMessage, SimpleMessage } from '@/interfaces/chat-messages.interface';
import { UserStates } from '@/interfaces/users.interface';
import PrivateChatRoomsService from '@/services/private-chat-rooms.service';
import UserService from '@/services/users.service';
import { Socket } from 'socket.io';
import BaseWorker from './base.worker';

class ChatWorker extends BaseWorker {
  private static onlineUsersID = new Set<string>();
  private privateChatRoomsService = new PrivateChatRoomsService();
  private userService = new UserService();

  constructor(socket: Socket) {
    super(socket);
    this.init();
  }

  private init() {
    this.addUserIdIntoList();
    this.addListeners();
    this.informAllUsersAboutStatus();
    console.log(`[ChatWorker] User - ${this.socket.data.user.name} - join and the room has total ${ChatWorker.onlineUsersID.size} users online`);
  }

  private addListeners() {
    this.socket.on(
      'chat:action:mark-as-read-all-private-messages-in-room',
      async anotherUserId => await this.markAsReadAllPrivateMessagesInRoom(anotherUserId),
    );
    this.socket.on('chat:action:send-private-message', async simpleMsg => await this.sendPrivateMessage(simpleMsg));
    this.socket.on(
      'chat:request:get-all-private-messages-in-room',
      async anotherUserId => await this.sendAllPrivateMessageInRoomToCurrentUser(anotherUserId),
    );
    this.socket.on('chat:acknowledgement:get-all-users-status', async callback => await this.sendAllUserStatusToCurrentUser(callback));
    this.socket.on(
      'chat:acknowledgement:get-all-private-messages-in-all-rooms',
      async callback => await this.sendAllPrivateMessagesInAllRoomsToCurrentUser(callback),
    );
    this.socket.on('disconnect', () => this.disconnect());
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

  private async sendAllPrivateMessagesInAllRoomsToCurrentUser(callback: (data: AllMessagesInRoom[]) => void) {
    const currentUserId = this.getCurrentUserId();
    const allMessages: AllMessagesInRoom[] = await this.userService.getAllPrivateMessagesInAllRooms(currentUserId);
    callback(allMessages);
  }

  private async sendAllPrivateMessageInRoomToCurrentUser(anotherUserId: string) {
    const currentUserId = this.getCurrentUserId();
    const messages: AllMessagesInRoom = await this.privateChatRoomsService.getAllMessagesInRoom(currentUserId, anotherUserId);

    this.socket.emit('chat:response:get-all-private-messages-in-room', messages);
  }

  private async sendPrivateMessage(simpleMsg: SimpleMessage) {
    const commonMsg = { ...simpleMsg, from: this.getCurrentUserId() };
    const newMessage: DetailMessage = await this.privateChatRoomsService.addChatMsgToRoom(commonMsg);
    this.socket.broadcast.to(commonMsg.to).emit('chat:inform:get-new-private-message', newMessage);
  }

  private async sendAllUserStatusToCurrentUser(callback: (data: UserStates[]) => void): Promise<void> {
    const usersStates: UserStates[] = await this.getAllUserStatus();
    callback(usersStates);
  }

  private disconnect() {
    this.removeUserIdFromList();
    this.informAllUsersAboutStatus();
    this.disconnectSocket();

    console.log(`[ChatWorker] User - ${this.socket.data.user.name} - quite and the room has total ${ChatWorker.onlineUsersID.size} users online`);
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
}

export default ChatWorker;
