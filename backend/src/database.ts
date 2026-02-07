import mongoose from 'mongoose';

// Default to a local MongoDB instance if no connection string is provided
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

mongoose.plugin((schema) => {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_: any, ret: any) {
      const { _id } = ret;

      ret.id = _id.toString();

      for (const key in ret) {
        if (ret[key] instanceof mongoose.Types.ObjectId) {
          ret[key] = ret[key].toString();
        }
      }

      return ret;
    },
  });
});

// Connect to MongoDB
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
