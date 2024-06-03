import { Schema, model, Document } from 'mongoose';
import { IUser } from './User';

export interface ITsismis extends Document {
    message: string;
    tags: string[];
    userId: Schema.Types.ObjectId | IUser;
    createdAt: Date;
    updatedAt: Date;
}

const tsismisSchema = new Schema<ITsismis>({
    message: { type: String, required: true },
    tags: { type: [String] },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default model<ITsismis>('Tsismis', tsismisSchema);
