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
      type: { x: Number, y: Number },
      require: true,
    },
  },
  schemaOptions,
);

const actionModel = model<Action & Document>('Action', actionsSchema);
export default actionModel;
