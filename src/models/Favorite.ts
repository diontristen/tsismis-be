import { Schema, model, Document } from 'mongoose';

export interface IFavorite extends Document {
  tsismisId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  createdAt: number;
  updatedAt: number;
}

const favoriteSchema = new Schema<IFavorite>({
  tsismisId: { type: Schema.Types.ObjectId, ref: 'Tsismis', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default model<IFavorite>('Favorite', favoriteSchema);
