import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  description: string;
  price: number; // Stored in minor units (e.g., cents/paise)
  currency: string;
  billingInterval: 'monthly' | 'quarterly' | 'half-yearly' | 'annual';
  trialDurationDays: number;
  features: string[];
  limits: {
    maxGuards: number;
    maxSites: number;
  };
  visibility: 'public' | 'hidden' | 'archived';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'USD', uppercase: true, trim: true },
    billingInterval: { type: String, enum: ['monthly', 'quarterly', 'half-yearly', 'annual'], required: true },
    trialDurationDays: { type: Number, default: 0, min: 0 },
    features: [{ type: String }],
    limits: {
      maxGuards: { type: Number, required: true, min: 1 },
      maxSites: { type: Number, required: true, min: 1 },
    },
    visibility: { type: String, enum: ['public', 'hidden', 'archived'], default: 'hidden' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Plan = mongoose.model<IPlan>('Plan', PlanSchema);
