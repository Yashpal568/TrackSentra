import mongoose, { Schema, Document } from 'mongoose';

export enum SubscriptionStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED'
}

export interface ISubscription extends Document {
  companyId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  status: SubscriptionStatus;
  
  // Snapshot of plan details to prevent historical alteration
  planSnapshot: {
    name: string;
    price: number;
    currency: string;
    billingInterval: string;
    limits: {
      maxGuards: number;
      maxSites: number;
    };
  };

  startDate?: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    status: { type: String, enum: Object.values(SubscriptionStatus), default: SubscriptionStatus.PENDING_PAYMENT, index: true },
    
    planSnapshot: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      currency: { type: String, required: true },
      billingInterval: { type: String, required: true },
      limits: {
        maxGuards: { type: Number, required: true },
        maxSites: { type: Number, required: true },
      }
    },

    startDate: { type: Date },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
