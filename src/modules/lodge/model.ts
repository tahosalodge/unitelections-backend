import { Schema, model, Document } from 'mongoose';

export interface IChapter {
  name: String;
  District: String;
}

export interface ILodge {
  council: Number;
  name: String;
  chapters: [IChapter];
  accessibleBy: any;
}

interface ILodgeModel extends ILodge, Document {}

const chapter = new Schema({
  name: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
});

const lodge = new Schema({
  council: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    require: true,
  },
  chapters: [chapter],
});

const Lodge: any = model<ILodgeModel>('Lodge', lodge);

export default Lodge;
