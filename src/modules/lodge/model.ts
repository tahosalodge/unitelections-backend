import { Schema, model, Document } from 'mongoose';

export interface IChapter extends Document {
  name: String;
  District: String;
}

export interface ILodge extends Document {
  council: Number;
  name: String;
  chapters: [IChapter];
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

export default model<ILodge>('Lodge', lodge);
