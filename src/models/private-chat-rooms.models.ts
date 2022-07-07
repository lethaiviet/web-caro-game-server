import { ChatRoom } from '@/interfaces/chat-rooms.interface';
import { Document, model, Schema } from 'mongoose';

const schemaOptions = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const privateChatRoomsSchema: Schema = new Schema(
  {
    name: { type: String, require: true, unique: true },
    members: [{ type: Schema.Types.ObjectId, require: true, ref: 'User' }],
    messages: [{ type: Schema.Types.ObjectId, ref: 'Chat_Message' }],
  },
  schemaOptions,
);

const privateChatRoomModel = model<ChatRoom & Document>('Private_Chat_Room', privateChatRoomsSchema);

export default privateChatRoomModel;
