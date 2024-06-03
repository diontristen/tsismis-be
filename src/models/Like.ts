import { Schema, model, Document } from 'mongoose';

export interface ILike extends Document {
  tsismisId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  createdAt: number;
  updatedAt: number;
}

const likeSchema = new Schema<ILike>({
  tsismisId: { type: Schema.Types.ObjectId, ref: 'Tsismis', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default model<ILike>('Like', likeSchema);
