import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  leadId: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true, // auto adds createdAt, updatedAt
  }
);

export default mongoose.model<INote>('Note', NoteSchema);
