import mongoose, { Schema, Document } from 'mongoose';

export interface IFolder extends Document {
  name: string;
  isOpen: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    isOpen: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IFolder>('Folder', FolderSchema); 