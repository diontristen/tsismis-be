import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import AppError from '../utils/AppError';
import { verifyToken } from '../middleware/auth';
import Like from '../models/Like';
import Tsismis from '../models/Tsismis';
import Favorite from '../models/Favorite';

const parseNormalUser = (user: IUser): IUser => {
  const url = process.env.AVATAR_URL;
  const avatar = `${url}?seed=${user.id}`
  user.avatar = avatar;
  if(!user.id && user?._id) {
    user.id = user?._id.toString() ?? user.id
  }
  return user;
}

const parseUser = async (user: IUser): Promise<IUser> => {
  user = parseNormalUser(user);
  const tsismisIds = await Tsismis.find({ userId: user.id }).distinct('_id');
  const likesCount = await Like.countDocuments({ tsismisId: { $in: tsismisIds } });
  const favoritesCount = await Favorite.countDocuments({ tsismisId: { $in: tsismisIds } });
  user.likesCount = likesCount;
  user.favoritesCount = favoritesCount;
  user.tsismisCount = tsismisIds.length;
  return user;
}

const userResolver = {
  Query: {
    getUsers: async () => await User.find(),
    getUser: async ({ id }: { id: string }) => await User.findById(id),
    getUserByUsername: async ({ username }: { username: string }, context: any) => {
      verifyToken(context);
      const user = await User.findOne({ username: username });
      if(!user) {
        throw new AppError('User not found', 404);
      }
      const parsedUser = parseUser(user);
      return parsedUser;
    },
    me: async (_: any, context: any) => {
      try {
        const authUser = verifyToken(context);
        const user = await User.findById(authUser?.id);
        if(!user) {
          throw new AppError('Cannot find user', 404);
        }
        const parsedUser = parseUser(user);
        return parsedUser;
      } catch(error) {
        throw new AppError('Failed to fetch users', 401);
      }
    },
    getLatestUsers: async (_: any, context: any) => {
      verifyToken(context);
      const latestUsers = await User.find().sort({ createdAt: -1 }).limit(3).lean();
      return latestUsers.map(user => (parseNormalUser(user)));
    },
    searchUsers: async ({ username, cursor, limit }: { username: string, cursor: string, limit: number }, context: any) => {
      verifyToken(context);

      const query = cursor ? { createdAt: { $lt: new Date(parseInt(cursor)) }, username: { $regex: username, $options: 'i' } } : {  username: { $regex: username, $options: 'i' } };
      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();

      const hasNextPage = users.length > limit;
      const tsismis = hasNextPage ? users.slice(0, -1) : users;
      const endCursor = tsismis.length > 0 ? tsismis[tsismis.length - 1].createdAt.getTime().toString() : null;
      const parsedUsers = users.map(user => (parseNormalUser(user)));
      return {
        users: parsedUsers,
        endCursor,
        hasNextPage
      }
    }
  },
  Mutation: {
    signup: async ({ username, displayName, password }: { username: string, displayName: string, password: string }) => {
      if(password.length < 7) {
        throw new AppError('Password must be at least 7 characters long', 400);
      }

      if(password.length > 64) {
        throw new AppError('Password should be less than 65 characters', 400);
      }

      if(username.length < 1) {
        throw new AppError('Username must be at least 2 characters long', 400);
      }

      if(displayName.length < 1) {
        throw new AppError('Display name is required', 400);
      }

      if(displayName.length > 15) {
        throw new AppError('Display name should be less than 16 characters', 400);
      }

      const existingUser = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
      if(existingUser) {
        throw new AppError('Username is already taken', 400);
      }
      const user = new User({ username, displayName, password });
      await user.save();
      return {
        message: 'User has been registered'
      };
    },
    login: async ({ username, password }: { username: string, password: string }) => {
      const user = await User.findOne({ username });
      if(!user) {
        throw new AppError('Username is not associated to an account', 404);
      }

      const isMatch = await user.comparePassword(password);
      if(!isMatch) {
        throw new AppError('Username and password did not match', 401);
      }

      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

      return { token };
    },
    updatePassword: async ({ oldPassword, newPassword }: { oldPassword: string, newPassword: string }, context: any) => {
      const authUser = verifyToken(context);
      const user = await User.findById(authUser?.id);
      if(!user) {
        throw new AppError('Cannot find user', 404);
      }

      if(newPassword.length < 7) {
        throw new AppError('Password must be at least 7 characters long', 400);
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if(!isMatch) {
        throw new AppError('Incorrect old password', 400);
      }

      user.password = newPassword;
      await user.save();
      return { success: true };
    },
    updateUser: async ({ displayName, description }: { displayName: string, description: string }, context: any) => {
      const authUser = verifyToken(context);
      const user = await User.findById(authUser?.id);
      if(!user) {
        throw new AppError('Cannot find user', 404);
      }

      if(displayName.length < 1) {
        throw new AppError('Display name is required', 400);
      }

      if(displayName.length > 15) {
        throw new AppError('Display name should be less than 16 characters', 400);
      }
      if(description && description.length > 50) {
        throw new AppError('Description should not be more than 50 description', 400);
      }

      user.displayName = displayName;
      user.description = description;
      await user.save();
      return parseUser(user);
    },
  }

};

export default userResolver;