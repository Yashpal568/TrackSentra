import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  status: 'active' | 'suspended' | 'archived';
  timezone: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'suspended', 'archived'], default: 'active' },
    timezone: { type: String, default: 'UTC' },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
