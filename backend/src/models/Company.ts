import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  status: 'active' | 'suspended' | 'archived';
  timezone: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  settings: {
    patrol: {
      requireGps: boolean;
      gpsAccuracyThreshold: number;
    };
    security: {
      sessionTimeoutMinutes: number;
    };
    onboarding: {
      dismissed: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'suspended', 'archived'], default: 'active' },
    timezone: { type: String, default: 'UTC' },
    address: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    settings: {
      patrol: {
        requireGps: { type: Boolean, default: true },
        gpsAccuracyThreshold: { type: Number, default: 50 },
      },
      security: {
        sessionTimeoutMinutes: { type: Number, default: 60 },
      },
      onboarding: {
        dismissed: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
