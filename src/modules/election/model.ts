import { Schema, model, Document, Model } from 'mongoose';
import { IUnit } from 'unit/model';

export interface IElection extends Document {
  unit: IUnit;
  requestedDates: Array<String>;
  season: String;
  status: String;
  notifyImmediately: Boolean;
  date: Date;
  youthAttendance: Number;
  election1Ballots: Number;
  election2Ballots: Number;
  chapter: String;
}

const election = new Schema({
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true,
    index: true,
  },
  requestedDates: {
    type: Array,
    required: true,
  },
  season: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  notifyImmediately: {
    type: Boolean,
  },
  date: {
    type: Date,
  },
  youthAttendance: {
    type: Number,
  },
  election1Ballots: {
    type: Number,
  },
  election2Ballots: {
    type: Number,
  },
  chapter: {
    type: Schema.Types.ObjectId,
    ref: 'chapter',
    required: true,
    index: true,
  },
});

const ElectionModel: Model<IUnit> = model<IElection>('Election', election);

export default ElectionModel;
