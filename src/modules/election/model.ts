import { Schema, model, Document } from 'mongoose';
import { IUnit } from 'unit/model';

interface IElection extends Document {
  unit: IUnit;
  requestedDates: Array<String>;
  season: String;
  status: String;
  notifyImmediately: Boolean;
  date: Date;
  youthAttendance: Number;
  election1Ballots: Number;
  election2Ballots: Number;
}

const election = new Schema({
  unitId: {
    type: Schema.Types.ObjectId,
    ref: 'unit',
    required: true,
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
  },
});

export default model<IElection>('Election', election);
