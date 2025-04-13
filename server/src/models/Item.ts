import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  title: string;
  icon: string;
  folderId: mongoose.Types.ObjectId | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    icon: { type: String, required: true },
    folderId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IItem>('Item', ItemSchema); 