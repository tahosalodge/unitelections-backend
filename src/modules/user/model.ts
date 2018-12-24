import { Schema, model, Document } from 'mongoose';

export interface Membership {
  organization: string;
  canManage: boolean;
  model: string;
}

export interface IUser extends Document {
  _id: string;
  fname: string;
  lname: string;
  phone?: string;
  email: string;
  password: string;
  belongsTo: Array<Membership>;
  isAdmin: boolean;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
}

export interface TokenUser {
  userId: string;
  belongsTo: Array<Membership>;
  isAdmin: boolean;
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

export default model<IUser>('User', user);
