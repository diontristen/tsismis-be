import { Schema, model, Document, ObjectId } from 'mongoose';
import bcrypt from 'bcryptjs';
export interface IUser extends Document {
    username: string;
    displayName: string;
    description?: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    avatar: string;
    tsismisCount: number;
    likesCount: number;
    favoritesCount: number;
    _id?: ObjectId;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    password: { type: String, required: true },
    description: { type: String },
}, { timestamps: true });

userSchema.pre<IUser>('save', async function(next) {
    if(!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = function(candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};
export default model<IUser>('User', userSchema);
