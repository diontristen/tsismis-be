
import { verifyToken } from '../middleware/auth';
import Favorite from '../models/Favorite';
import Tsismis from '../models/Tsismis';
import AppError from '../utils/AppError';


const favoriteResolver = {
    Query: {
    },
    Mutation: {
        favoriteTsismis: async ({ tsismisId }: { tsismisId: String }, context: any) => {
            const user = verifyToken(context);
            const tsismis = await Tsismis.findById(tsismisId);
            if(!tsismis) {
                throw new AppError('Tsismis not found', 404);
            }
            const favorite = new Favorite({ tsismisId, userId: user?.id });
            await favorite.save();
            return { success: true };
        },
        unfavoriteTsismis: async ({ tsismisId }: { tsismisId: String }, context: any) => {
            const user = verifyToken(context);
            const tsismis = await Tsismis.findById(tsismisId);
            if(!tsismis) {
                throw new AppError('Tsismis not found', 404);
            }
            const favorite = await Favorite.findOneAndDelete({ tsismisId, userId: user?.id });
            if(!favorite) {
                throw new AppError('Favorite not found', 404);
            }
            return { success: true };
        },
    }

};

export default favoriteResolver;