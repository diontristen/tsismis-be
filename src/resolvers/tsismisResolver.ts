
import { verifyToken } from '../middleware/auth';
import Favorite from '../models/Favorite';
import Like, { ILike } from '../models/Like';
import Tsismis, { ITsismis } from '../models/Tsismis';
import User, { IUser } from '../models/User';
import AppError from '../utils/AppError';


interface ITsismisResponse extends Omit<Partial<ITsismis>, 'userId'> {
  user: Partial<IUser>;
  likes: number;
  hasLiked: boolean;
  favorites: number;
  hasFavorited: boolean
}

interface ILikesMap {
  likesMap: Record<string, number>;
  userLikesMap: Record<string, boolean>;
}

interface IFavoritesMap {
  favoritesMap: Record<string, number>;
  userFavoritesMap: Record<string, boolean>;
}

const isIUser = (user: IUser | any): user is IUser => {
  return (user as IUser).displayName !== undefined;
}

const parseTsismis = (tsismis: ITsismis, likesMap: ILikesMap, favoritesMap: IFavoritesMap): ITsismisResponse | {} => {
  const url = process.env.AVATAR_URL;
  if(!isIUser(tsismis.userId)) {
    throw new Error("User information is not populated");
  }
  if(!tsismis._id) {
    return {};
  }
  const id: string = tsismis?._id.toString();
  const avatar = `${url}?seed=${tsismis.userId._id}`
  const parsedTsismis: ITsismisResponse = {
    message: tsismis.message,
    tags: tsismis.tags,
    createdAt: tsismis.createdAt,
    id: tsismis?._id,
    user: {
      id: tsismis.userId._id,
      displayName: tsismis.userId?.displayName,
      username: tsismis.userId?.username,
      avatar: avatar
    },
    likes: likesMap && likesMap?.likesMap[id] ? likesMap.likesMap[id] : 0,
    hasLiked: likesMap && likesMap?.userLikesMap[id] ? true : false,
    favorites: favoritesMap && favoritesMap?.favoritesMap[id] ? favoritesMap.favoritesMap[id] : 0,
    hasFavorited: favoritesMap && favoritesMap?.userFavoritesMap[id] ? true : false,
  };
  return parsedTsismis;
}

const getLikesMap = async (tsismisList: ITsismis[], userId: string): Promise<ILikesMap> => {
  const tsismisIds = tsismisList.map(tsismis => tsismis._id);
  const likesCounts = await Like.aggregate([
    { $match: { tsismisId: { $in: tsismisIds } } },
    { $group: { _id: "$tsismisId", count: { $sum: 1 } } }
  ]);
  const likesMap = likesCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
  const userLikes: ILike[] = await Like.find({ tsismisId: { $in: tsismisIds }, userId: userId });
  const userLikesMap: Record<string, boolean> = userLikes.reduce((acc, item) => {
    const key: string = item.tsismisId.toString();
    acc[key] = true;
    return acc;
  }, {} as Record<string, boolean>);
  return {
    likesMap: likesMap,
    userLikesMap: userLikesMap
  };
}

const getFavoritesMap = async (tsismisList: ITsismis[], userId: string): Promise<IFavoritesMap> => {
  const tsismisIds = tsismisList.map(tsismis => tsismis._id);
  const favoriteCounts = await Favorite.aggregate([
    { $match: { tsismisId: { $in: tsismisIds } } },
    { $group: { _id: "$tsismisId", count: { $sum: 1 } } }
  ]);
  const favoritesMap = favoriteCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
  const userFavorites: ILike[] = await Favorite.find({ tsismisId: { $in: tsismisIds }, userId: userId });
  const userFavoritesMap: Record<string, boolean> = userFavorites.reduce((acc, item) => {
    const key: string = item.tsismisId.toString();
    acc[key] = true;
    return acc;
  }, {} as Record<string, boolean>);
  return {
    favoritesMap: favoritesMap,
    userFavoritesMap: userFavoritesMap
  };
}

const tsismisResolver = {
  Query: {
    getTsismis: async ({ cursor, limit }: { cursor: string, limit: number }, context: any) => {
      const user = verifyToken(context);
      if(!user) {
        throw new AppError('Cannot find user', 404);
      }
      const query = cursor ? { createdAt: { $lt: new Date(parseInt(cursor)) } } : {};
      const tsismisList = await Tsismis.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .populate('userId')
        .lean();


      const hasNextPage = tsismisList.length > limit;
      const tsismis = hasNextPage ? tsismisList.slice(0, -1) : tsismisList;
      const endCursor = tsismis.length > 0 ? tsismis[tsismis.length - 1].createdAt.getTime().toString() : null;

      const likesMap = await getLikesMap(tsismisList, user?.id);
      const favoritesMap = await getFavoritesMap(tsismisList, user?.id);
      const parsedTsismis = tsismisList.map(tsismis => (parseTsismis(tsismis, likesMap, favoritesMap)));
      return {
        tsismis: parsedTsismis,
        endCursor,
        hasNextPage
      }
    },
    getTsismisByOwnUser: async ({ cursor, limit }: { cursor: string, limit: number }, context: any) => {
      const authUser = verifyToken(context);
      const user = await User.findById(authUser?.id);
      if(!user) {
        throw new AppError('Cannot find user', 404);
      }

      const query = cursor ? { createdAt: { $lt: new Date(parseInt(cursor)) }, userId: user.id } : { userId: user.id };
      const tsismisList = await Tsismis.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .populate('userId')
        .lean();

      const hasNextPage = tsismisList.length > limit;
      const tsismis = hasNextPage ? tsismisList.slice(0, -1) : tsismisList;
      const endCursor = tsismis.length > 0 ? tsismis[tsismis.length - 1].createdAt.getTime().toString() : null;

      const likesMap = await getLikesMap(tsismisList, user?.id);
      const favoritesMap = await getFavoritesMap(tsismisList, user?.id);
      const parsedTsismis = tsismisList.map(tsismis => (parseTsismis(tsismis, likesMap, favoritesMap)));
      return {
        tsismis: parsedTsismis,
        endCursor,
        hasNextPage
      }
    },
    getTsismisByUsername: async ({ username, cursor, limit }: { username: string, cursor: string, limit: number }, context: any) => {
      const authUser = verifyToken(context);
      const user = await User.findById(authUser?.id);
      if(!user) {
        throw new AppError('Cannot find user', 404);
      }
      const foundUser = await User.findOne({ username });
      if(!foundUser) {
        throw new AppError('User not found', 404);
      }
      const query = cursor ? { createdAt: { $lt: new Date(parseInt(cursor)) }, userId: foundUser.id } : { userId: foundUser.id };
      const tsismisList = await Tsismis.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .populate('userId')
        .lean();

      const hasNextPage = tsismisList.length > limit;
      const tsismis = hasNextPage ? tsismisList.slice(0, -1) : tsismisList;
      const endCursor = tsismis.length > 0 ? tsismis[tsismis.length - 1].createdAt.getTime().toString() : null;


      const likesMap = await getLikesMap(tsismisList, user?.id);
      const favoritesMap = await getFavoritesMap(tsismisList, user?.id);
      const parsedTsismis = tsismisList.map(tsismis => (parseTsismis(tsismis, likesMap, favoritesMap)));
      return {
        tsismis: parsedTsismis,
        endCursor,
        hasNextPage
      }
    },
    getFavoriteTsismisByOwnUser: async ({ cursor, limit }: { cursor: string, limit: number }, context: any) => {
      const authUser = verifyToken(context);
      const user = await User.findById(authUser?.id);
      if(!user) {
        throw new AppError('Cannot find user', 404);
      }
      const userFavorites = await Favorite.find({ userId: user.id });
      const tsismisIds = userFavorites.map(like => like.tsismisId);

      const query = cursor ? { createdAt: { $lt: new Date(parseInt(cursor)) }, _id: { $in: tsismisIds } } : { _id: { $in: tsismisIds } };
      const tsismisList = await Tsismis.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .populate('userId')
        .lean();

      const hasNextPage = tsismisList.length > limit;
      const tsismis = hasNextPage ? tsismisList.slice(0, -1) : tsismisList;
      const endCursor = tsismis.length > 0 ? tsismis[tsismis.length - 1].createdAt.getTime().toString() : null;

      const likesMap = await getLikesMap(tsismisList, user?.id);
      const favoritesMap = await getFavoritesMap(tsismisList, user?.id);
      const parsedTsismis = tsismisList.map(tsismis => (parseTsismis(tsismis, likesMap, favoritesMap)));
      return {
        tsismis: parsedTsismis,
        endCursor,
        hasNextPage
      }
    },
    searchTsismisMessages: async ({ query, cursor, limit }: { query: string, cursor: string, limit: number }, context: any) => {
      const authUser = verifyToken(context);
      const user = await User.findById(authUser?.id);
      if(!user) {
        throw new AppError('Cannot find user', 404);
      }
      const searchQuery = cursor ? { createdAt: { $lt: new Date(parseInt(cursor)) }, message: { $regex: query, $options: 'i' } } : {  message: { $regex: query, $options: 'i' } };
      const tsismisList = await Tsismis.find(searchQuery)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .populate('userId')
        .lean();

      const hasNextPage = tsismisList.length > limit;
      const tsismis = hasNextPage ? tsismisList.slice(0, -1) : tsismisList;
      const endCursor = tsismis.length > 0 ? tsismis[tsismis.length - 1].createdAt.getTime().toString() : null;

      const likesMap = await getLikesMap(tsismisList, user?.id);
      const favoritesMap = await getFavoritesMap(tsismisList, user?.id);
      const parsedTsismis = tsismisList.map(tsismis => (parseTsismis(tsismis, likesMap, favoritesMap)));
      return {
        tsismis: parsedTsismis,
        endCursor,
        hasNextPage
      }
    }
  },
  Mutation: {
    createTsismis: async ({ message, tags }: { message: string, tags: string[] }, context: any) => {
      const user = verifyToken(context);

      if(message.length > 255) {
        throw new AppError('Message cannot be more thant 255 characters', 400);
      }
      if(tags.length > 5) {
        throw new AppError('Tags cannot be more than 5', 400);
      }
      const tsismis = new Tsismis({ message, tags, userId: user?.id });
      await tsismis.save();
      const populatedTsismis = await tsismis.populate('userId');
      return parseTsismis(populatedTsismis, { likesMap: {}, userLikesMap: {} }, { favoritesMap: {}, userFavoritesMap: {} })
    },
    deleteTsismis: async ({ id }: { id: string }, context: any) => {
      const user = verifyToken(context);
      if(!user) {
        throw new AppError('Cannot find user', 404);
      }
      const tsismis = await Tsismis.findById(id);
      if(!tsismis) {
        throw new AppError('Tsismis not found', 404);
      }

      if(tsismis.userId.toString() !== user.id) {
        throw new AppError('You are not authorized to delete this tsismis', 403);
      }
      await Tsismis.findByIdAndDelete(id);
      return { success: true }
    },
    updateTsismis: async ({ id, message, tags }: { id: string, message: string, tags: string[] }, context: any) => {
      const user = verifyToken(context);
      if(!user) {
        throw new AppError('Cannot find user', 404);
      }
      const tsismis = await Tsismis.findById(id);
      if(!tsismis) {
        throw new AppError('Tsismis not found', 404);
      }
      if(tsismis.userId.toString() !== user.id) {
        throw new AppError('You are not authorized to update this tsismis', 403);
      }
      if(message.length > 255) {
        throw new AppError('Message cannot be more thant 255 characters', 400);
      }
      if(tags.length > 5) {
        throw new AppError('Tags cannot be more than 5', 400);
      }

      if(message !== undefined) {
        tsismis.message = message;
      }

      if(tags !== undefined) {
        tsismis.tags = tags;
      }

      tsismis.updatedAt = new Date();
      await tsismis.save();
      const populatedTsismis = await tsismis.populate('userId');
      const userFavorites = await Favorite.find({ userId: user.id });
      const tsismisIds = userFavorites.map(like => like.tsismisId);
      const tsismisList = await Tsismis.find({ _id: { $in: tsismisIds } }).sort({ createdAt: -1 }).populate('userId').lean();
      const likesMap = await getLikesMap(tsismisList, user?.id);
      const favoritesMap = await getFavoritesMap(tsismisList, user?.id);
      return parseTsismis(populatedTsismis, likesMap, favoritesMap)
    },
  }

};

export default tsismisResolver;