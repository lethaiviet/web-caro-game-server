import { model, Schema, Document } from 'mongoose';
import { User } from '@interfaces/users.interface';

const schemaOptions = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const userSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active'],
      default: 'pending',
    },
    accessToken: {
      type: String,
      unique: true,
    },
    bio: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    avatarLocalPath: {
      type: String,
      default: '',
    },
    exp: {
      type: Number,
      default: 0,
    },
  },
  schemaOptions,
);

const userModel = model<User & Document>('User', userSchema);

export default userModel;
