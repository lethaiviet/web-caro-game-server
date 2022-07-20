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
    },
    players: [{ type: Schema.Types.ObjectId, require: true, ref: 'User' }],
    winner: { type: Schema.Types.ObjectId, require: true, ref: 'User' },
    totalTime: {
      type: Number,
      require: true,
    },
  },
  schemaOptions,
);

const macherModel = model<Match & Document>('Match', matchesSchema);
export default macherModel;
