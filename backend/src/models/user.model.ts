import mongoose, {
  Schema,
  Document,
  Model,
  type HydratedDocument,
} from 'mongoose';

export interface IUser extends Document {
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User document with all Mongoose document methods and properties
 */
export type UserDocument = HydratedDocument<IUser>;

/**
 * Lean user document (plain object without Mongoose document methods)
 * Use with .lean() queries for better performance
 */
export type LeanUser = Omit<IUser, keyof Document> & {
  _id: mongoose.Types.ObjectId;
};

/**
 * Plain object representation of user before transformation
 * This is what the `ret` parameter contains in the toJSON transform function
 */
export interface UserPlainObject {
  _id: mongoose.Types.ObjectId;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any; // Allow for additional properties from virtuals or other schema features
}

/**
 * Transformed user as returned by toJSON()
 * This matches the output of the schema's transform function
 */
export interface TransformedUser {
  id: string;
  userId: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.virtual('userId').get(function () {
  return this._id.toString();
});

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,

  transform: function (
    _doc: HydratedDocument<IUser>,
    ret: UserPlainObject,
  ): TransformedUser {
    return {
      id: ret._id.toString(),
      userId: ret._id.toString(),
      username: ret.username,
      createdAt: ret.createdAt.toISOString(),
      updatedAt: ret.updatedAt.toISOString(),
    };
  },
});

export const UserModel: Model<IUser> = mongoose.model<IUser>(
  'User',
  userSchema,
);
export { userSchema };
