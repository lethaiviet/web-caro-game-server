import { ChatMessager, DetailMessage } from '@/interfaces/chat-messages.interface';
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
      limit: 10,
    });

    return findMessage;
  }
}

export default ChatMessageService;
