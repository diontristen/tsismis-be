
import { verifyToken } from '../middleware/auth';
import Like from '../models/Like';
import Tsismis from '../models/Tsismis';
import AppError from '../utils/AppError';


const likeResolver = {
    Query: {
    },
    Mutation: {
        likeTsismis: async ({ tsismisId }: { tsismisId: String }, context: any) => {
            const user = verifyToken(context);
            const tsismis = await Tsismis.findById(tsismisId);
            if(!tsismis) {
                throw new AppError('Tsismis not found', 404);
            }
            const like = new Like({ tsismisId, userId: user?.id });
            await like.save();
            return { success: true };
        },
        unlikeTsismis: async ({ tsismisId }: { tsismisId: String }, context: any) => {
            const user = verifyToken(context);
            const tsismis = await Tsismis.findById(tsismisId);
            if(!tsismis) {
                throw new AppError('Tsismis not found', 404);
            }
            const like = await Like.findOneAndDelete({ tsismisId, userId: user?.id });
            if(!like) {
                throw new AppError('Like not found', 404);
            }
            return { success: true };
        },
    }

};

export default likeResolver;