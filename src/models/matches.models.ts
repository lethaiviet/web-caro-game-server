import { Match } from '@/interfaces/matches.interface';
import { Document, model, Schema } from 'mongoose';

const schemaOptions = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const matchesSchema: Schema = new Schema(
  {
    type: {
      type: String,
      require: true,
    },
    name: {
      type: String,
      require: true,
      unique: true,
    },
    players: [{ type: Schema.Types.ObjectId, require: true, ref: 'User' }],
    winner: { type: Schema.Types.ObjectId, ref: 'User' },
    actions: [{ type: Schema.Types.ObjectId, ref: 'Action' }],
    totalTime: {
      type: Number,
    },
  },
  schemaOptions,
);

const matcherModel = model<Match & Document>('Match', matchesSchema);
export default matcherModel;
