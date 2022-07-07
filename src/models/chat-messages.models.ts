import { ChatMessager } from '@/interfaces/chat-messages.interface';
import { Document, model, Schema } from 'mongoose';

const schemaOptions = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const chatMessagesSchema: Schema = new Schema(
  {
    content: { type: String },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  schemaOptions,
);

const chatMessagerModel = model<ChatMessager & Document>('Chat_Message', chatMessagesSchema);

export default chatMessagerModel;
