import { Action } from '@/interfaces/action.interface';
import { Document, model, Schema } from 'mongoose';

const schemaOptions = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const actionsSchema: Schema = new Schema(
  {
    playerId: { type: Schema.Types.ObjectId, require: true, ref: 'User' },
    position: {
      type: { r: Number, c: Number },
      require: true,
    },
    symbol: {
      type: String,
      require: true,
    },
  },
  schemaOptions,
);

const actionModel = model<Action & Document>('Action', actionsSchema);
export default actionModel;
