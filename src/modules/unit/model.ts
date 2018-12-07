import { Schema, model, Document } from 'mongoose';
import { IChapter } from 'modules/lodge/model';
import { IUser } from 'modules/user/model';

interface IRepresentative {
  fname: String;
  lname: String;
  phone: String;
  email: String;
}

interface IUnitLeader extends IRepresentative {
  involvement: String;
  position: String;
}

export interface IUnit extends Document {
  number: Number;
  chapter: IChapter;
  activeMembers: Number;
  meetingLocation: {
    address1: String;
    city: String;
    state: String;
    zip: String;
    notes: String;
    meetingTime: String;
    unitLeader: Object;
    adultRepresentative: IRepresentative;
    youthRepresentative: IRepresentative;
    users: [IUser];
    pendingUsers: [IUser];
  };
}

const unit = new Schema({
  number: {
    type: String,
    required: true,
    unique: true,
  },
  unitType: {
    type: String,
    required: true,
  },
  chapter: {
    type: Schema.Types.ObjectId,
    ref: 'chapter',
    required: true,
  },
  activeMembers: {
    type: Number,
    required: true,
  },
  meetingLocation: {
    type: Object,
    required: true,
  },
  meetingTime: {
    type: String,
    required: true,
  },
  unitLeader: {
    type: Object,
    required: true,
  },
  adultRepresentative: {
    type: Object,
  },
  youthRepresentative: {
    type: Object,
  },
  users: {
    type: Array,
    required: true,
  },
  pendingUsers: {
    type: Array,
  },
});

export default model<IUnit>('Unit', unit);
