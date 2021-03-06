import { DetailMessage } from '@/interfaces/chat-messages.interface';
import chatMessagerModel from '@/models/chat-messages.models';

class ChatMessageService {
  public chatMessage = chatMessagerModel;

  public async createMessage(senderId: string, content: string): Promise<DetailMessage> {
    const newMsg: DetailMessage = await this.chatMessage.create({ senderId, content });
    return newMsg;
  }

  public async getMessage(messageId: string): Promise<DetailMessage> {
    const findMessage: DetailMessage = await this.chatMessage.findById(messageId);
    return findMessage;
  }

  public async getMessages(messagesId: string[]): Promise<DetailMessage[]> {
    const findMessage: DetailMessage[] = await this.chatMessage.find({ _id: messagesId }, null, {
      sort: { created_at: -1 },
      limit: 20,
    });

    return findMessage;
  }

  public async markMessagesAsRead(messagesId: string[], readerId: string): Promise<void> {
    await this.chatMessage.updateMany({ _id: { $in: messagesId }, readBy: { $ne: readerId } }, { $push: { readBy: readerId } });
  }
}

export default ChatMessageService;
