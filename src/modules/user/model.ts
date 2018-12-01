import { Schema, model, Document } from 'mongoose';

export interface Membership extends Document {
  organization: string;
  canManage: boolean;
}

export interface UserI extends Document {
  _id: string;
  fname: string;
  lname: string;
  phone?: string;
  email: string;
  password: string;
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
        organization: {
          type: Schema.Types.ObjectId,
          ref: 'Organization',
        },
        canManage: Boolean,
      },
    ],
    password: { type: String, select: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: Boolean,
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

export default model<UserI>('User', user);
