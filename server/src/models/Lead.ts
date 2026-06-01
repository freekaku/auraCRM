import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  country: string;
  source: string;
  status: string;
  owner: mongoose.Types.ObjectId;
  expectedRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema(
  {
    name: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true },
    industry: { type: String, required: true, index: true },
    country: { type: String, required: true, index: true },
    source: { type: String, required: true, index: true },
    status: { 
      type: String, 
      required: true, 
      enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'],
      default: 'New',
      index: true
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expectedRevenue: { type: Number, default: 0 },
  },
  {
    timestamps: true, // auto adds createdAt, updatedAt
  }
);

// Compound text index for powerful fuzzy global search on backend if needed, though simple regex search also works great!
LeadSchema.index({ name: 'text', company: 'text', email: 'text' });

export default mongoose.model<ILead>('Lead', LeadSchema);
