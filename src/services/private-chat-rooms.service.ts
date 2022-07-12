import { AllMessagesInRoom, CommonMessage, DetailMessage } from '@/interfaces/chat-messages.interface';
import { ChatRoom } from '@/interfaces/chat-rooms.interface';
import privateChatRoomModel from '@/models/private-chat-rooms.models';
import ChatMessageService from './chat-messages.service';
import UserService from './users.service';

class PrivateChatRoomsService {
  private privateChatRooms = privateChatRoomModel;
  private chatMessageService = new ChatMessageService();

  public getRoomName(memberId1: string, memberId2: string): string {
    return [memberId1, memberId2].sort().join('-vs-');
  }

  public async getOrCreateRoom(memberId1: string, memberId2: string): Promise<ChatRoom> {
    let findRoom: ChatRoom = await this.privateChatRooms.findOne({ members: { $all: [memberId1, memberId2] } });

    if (!findRoom) {
      findRoom = await this.createRoom(memberId1, memberId2);
    }

    return findRoom;
  }

  private async createRoom(memberId1: string, memberId2: string): Promise<ChatRoom> {
    const roomName = this.getRoomName(memberId1, memberId2);
    const newRoom: ChatRoom = await this.privateChatRooms.create({ name: roomName, members: [memberId1, memberId2] });
    const userService = new UserService();
    await userService.joinPrivateChatRoom(memberId1, newRoom._id);
    await userService.joinPrivateChatRoom(memberId2, newRoom._id);
    return newRoom;
  }

  public async addChatMsgToRoom(commonMessage: CommonMessage): Promise<DetailMessage> {
    const message: DetailMessage = await this.chatMessageService.createMessage(commonMessage.from, commonMessage.content);
    await this.privateChatRooms.findOneAndUpdate({ members: { $all: [commonMessage.to, commonMessage.from] } }, { $push: { messages: message._id } });
    return message;
  }

  public async getAllMsgInRoom(from: string, to: string): Promise<AllMessagesInRoom> {
    const findRoom: ChatRoom = await this.getOrCreateRoom(from, to);

    let messages: DetailMessage[] = [];
    let countNotification = 0;
    if (findRoom.messages.length > 0) {
      messages = await this.chatMessageService.getMessages(findRoom.messages);
      countNotification = messages.reduce((total, message) => (total += message.readBy.includes(from) ? 0 : 1), 0);
    }

    return {
      roomName: to,
      messages,
      countNotification,
    };
  }

  public async markAsReadAllMsgInRoom(from: string, to: string): Promise<void> {
    const findRoom: ChatRoom = await this.getOrCreateRoom(from, to);
    const messagesId: string[] = findRoom.messages;
    if (messagesId.length > 0) {
      await this.chatMessageService.markMessagesAsRead(messagesId, from);
    }
  }
}

export default PrivateChatRoomsService;
