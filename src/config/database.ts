import mongoose from 'mongoose';

const connectDB = async () => {
  const MONGODB_URI = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_INITDB_HOST}:${process.env.MONGO_INITDB_PORT}`
  try {
    await mongoose.connect(MONGODB_URI as string, {
      dbName: 'tsismis'
    });
    console.log('MongoDB connected');
  } catch(error: any) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
