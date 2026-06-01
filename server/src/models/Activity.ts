import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  leadId: mongoose.Types.ObjectId;
  type: string;
  description: string;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema({
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  type: { 
    type: String, 
    required: true,
    enum: ['Lead Created', 'Lead Updated', 'Status Changed', 'Owner Changed', 'Note Added', 'Note Edited', 'Note Deleted', 'File Uploaded', 'File Deleted']
  },
  description: { type: String, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

export default mongoose.model<IActivity>('Activity', ActivitySchema);
