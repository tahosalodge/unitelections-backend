import { Schema, model, Document, Model } from 'mongoose';

export interface Membership {
  organization: string;
  canManage: boolean;
  model: string;
}

export interface IUser {
  fname: string;
  lname: string;
  phone?: string;
  email: string;
  password: string;
  belongsTo: Array<Membership>;
  isAdmin: boolean;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
}

export interface TokenUser {
  userId: string;
  belongsTo: Array<Membership>;
  isAdmin: boolean;
}

export interface IUserModel extends IUser, Document {
  addRelationship: (
    organization: string,
    model: string,
    canManage: boolean
  ) => void;
}

const user = new Schema(
  {
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: 'Please supply an email address',
    },
    belongsTo: [
      {
        organization: Schema.Types.ObjectId,
        model: String,
        canManage: Boolean,
      },
    ],
    password: { type: String, select: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: { type: Boolean, default: false },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

user.virtual('name').get(function() {
  return `${this.fname} ${this.lname}`;
});

const UserModel: Model<IUserModel> = model<IUserModel>('User', user);

export const addRelationship = (
  id: string,
  organization: string,
  model: string,
  canManage = false
) => {
  return UserModel.findByIdAndUpdate(
    id,
    {
      $push: {
        belongsTo: [{ organization, canManage, model }],
      },
    },
    { new: true }
  );
};

export default UserModel;
