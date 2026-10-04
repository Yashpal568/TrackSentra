import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  description: string;
  pricing: {
    monthly: number;
    quarterly: number;
    annual: number;
  }; // Stored in minor units (e.g., cents/paise)
  currency: string;
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
    pricing: {
      monthly: { type: Number, required: true, min: 0, default: 0 },
      quarterly: { type: Number, required: true, min: 0, default: 0 },
      annual: { type: Number, required: true, min: 0, default: 0 }
    },
    currency: { type: String, required: true, default: 'USD', uppercase: true, trim: true },
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
