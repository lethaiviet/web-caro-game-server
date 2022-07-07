import { ChatRoom } from '@/interfaces/chat-rooms.interface';
import { Document, model, Schema } from 'mongoose';

const schemaOptions = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const groupChatRoomsSchema: Schema = new Schema(
  {
    name: { type: String, require: true, unique: true },
    members: [{ type: Schema.Types.ObjectId, require: true, ref: 'User' }],
    messages: [{ type: Schema.Types.ObjectId, ref: 'Chat_Message' }],
  },
  schemaOptions,
);

const groupChatRoomModel = model<ChatRoom & Document>('Group_Chat_Room', groupChatRoomsSchema);

export default groupChatRoomModel;
