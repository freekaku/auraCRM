import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  leadId: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FileSchema: Schema = new Schema({
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFile>('File', FileSchema);
