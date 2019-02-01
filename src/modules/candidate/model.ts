import { Schema, model, Document, Model } from 'mongoose';
import { IUnit } from 'unit/model';
import { IChapter } from 'lodge/model';
import { IElection } from 'election/model';

enum CandidateStatus {
  Eligible = 'Eligible',
  Elected = 'Elected',
  NotElected = 'Not Elected',
}

enum Rank {
  FirstClass = 'First Class',
  Star = 'Star',
  Life = 'Life',
  Eagle = 'Eagle',
}

export interface ICandidate {
  fname: string;
  lname: string;
  dob: string;
  bsaid: number;
  rank: Rank;
  election: Schema.Types.ObjectId | IElection;
  unit: Schema.Types.ObjectId | IUnit;
  chapter: Schema.Types.ObjectId | IChapter;
  address: {};
  parentPhone: string;
  parentEmail: string;
  youthPhone?: string;
  youthEmail?: string;
  status: CandidateStatus;
  notified?: Date;
  exported?: Date;
}

interface ICandidateModel extends ICandidate, Document {}

const candidate = new Schema({
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
  rank: {
    type: String,
    required: true,
  },
  electionId: {
    type: String,
    required: true,
  },
  unitId: {
    type: String,
    required: true,
  },
  address: {
    type: Object,
    required: true,
  },
  parentPhone: {
    type: String,
    required: true,
  },
  parentEmail: {
    type: String,
    required: true,
  },
  youthPhone: {
    type: String,
  },
  youthEmail: {
    type: String,
  },
  campingLongTerm: {
    type: String,
  },
  campingShortTerm: {
    type: String,
  },
  chapter: {
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
  }
});

const CandidateModel: Model<ICandidateModel> = model<ICandidateModel>('Candidate', candidate);

export default CandidateModel;