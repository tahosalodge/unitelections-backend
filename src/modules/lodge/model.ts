import { Schema, model, Document } from 'mongoose';

export interface IChapter extends Document {
  name: String;
  District: String;
}

export interface ILodge extends Document {
  council: Number;
  name: String;
  chapters: [IChapter];
  accessibleBy: any;
}

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

const Lodge: any = model<ILodge>('Lodge', lodge);

export default Lodge;
