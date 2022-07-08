import { ChatMessager } from '@/interfaces/chat-messages.interface';
import { User } from '@/interfaces/users.interface';
import { Document, model, Schema } from 'mongoose';
import userModel from './users.model';

const schemaOptions = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const chatMessagesSchema: Schema = new Schema(
  {
    content: { type: String },
    senderName: { type: String },
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  schemaOptions,
);

chatMessagesSchema.pre<ChatMessager>('save', async function (next) {
  const findUser: User = await userModel.findById(this.senderId);

  if (findUser) {
    this.senderName = findUser.name;
  }
  next();
});

const chatMessagerModel = model<ChatMessager & Document>('Chat_Message', chatMessagesSchema);

export default chatMessagerModel;
