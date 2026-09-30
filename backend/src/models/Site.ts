import mongoose, { Schema, Document } from 'mongoose';

export interface ISite extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  address?: string;
  timezone: string;
  status: 'active' | 'inactive' | 'archived';
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    timezone: { type: String, default: 'UTC' },
    status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Compound index for tenant-isolation queries
SiteSchema.index({ companyId: 1, status: 1 });

export const Site = mongoose.model<ISite>('Site', SiteSchema);
