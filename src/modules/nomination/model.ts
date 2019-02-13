import { Schema, model, Document, Model } from 'mongoose';
import { IUnit, UnitType } from 'unit/model';
import { IChapter } from 'lodge/model';
import { IElection } from 'election/model';

enum NominationStatus {
  Pending = 'Pending Approval',
  Approved = 'Approved',
  Nominated = 'Nominated',
}

export interface INomination {
  fname: string;
  lname: string;
  dob: string;
  bsaid: number;
  election: Schema.Types.ObjectId | IElection;
  unit: Schema.Types.ObjectId | IUnit;
  chapter: Schema.Types.ObjectId | IChapter;
  unitType: UnitType;
  address: {};
  phone: string;
  email: string;
  status: NominationStatus;
  gender: string;
  notified?: Date;
  exported?: Date;
}

interface INominationModel extends INomination, Document {}

const nomination = new Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  bsaid: {
    type: String,
    required: true,
  },
  election: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  unitType: {
    type: String,
    required: true,
  },
  address: {
    type: Object,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  chapter: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  notified: {
    type: Date,
  },
  exported: {
    type: Date,
  },
});

const NominationModel: Model<INominationModel> = model<INominationModel>(
  'Nomination',
  nomination
);

export default NominationModel;
