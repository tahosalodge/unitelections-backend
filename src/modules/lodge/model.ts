import { Schema, model, Document, Model } from 'mongoose';

export interface IChapter {
  _id: string;
  name: String;
  District: String;
}

export interface ILodge {
  council: Number;
  name: String;
  chapters: [IChapter];
  // accessibleBy: any;
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

const Lodge: Model<ILodgeModel> = model<ILodgeModel>('Lodge', lodge);

export default Lodge;
