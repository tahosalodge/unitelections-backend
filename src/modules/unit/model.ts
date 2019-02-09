import { Schema, model, Document, Model } from 'mongoose';
import { IChapter } from 'lodge/model';
import { IUser } from 'user/model';

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

export enum UnitType {
  Troop = 'Troop',
  Crew = 'Crew',
  Ship = 'Ship',
}

export interface IUnit {
  number: Number;
  unitType: UnitType;
  chapter: IChapter;
  activeMembers: Number;
  meetingLocation: {
    address1: String;
    city: String;
    state: String;
    zip: String;
    notes: String;
  };
  meetingTime: String;
  unitLeader: IUnitLeader;
  adultRepresentative: IRepresentative;
  youthRepresentative: IRepresentative;
  users: [IUser];
  pendingUsers: [IUser];
}

export interface IUnitModel extends IUnit, Document {}

const unit = new Schema({
  number: {
    type: String,
    required: true,
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

const UnitModel: Model<IUnitModel> = model<IUnitModel>('Unit', unit);

export default UnitModel;
