import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionHistory extends Document {
  companyId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  eventType: 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'PLAN_UPGRADED' | 'DOWNGRADE_SCHEDULED' | 'CANCELLATION_SCHEDULED' | 'RESUMED' | 'REFUNDED';
  details: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionHistorySchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
    eventType: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const SubscriptionHistory = mongoose.model<ISubscriptionHistory>('SubscriptionHistory', SubscriptionHistorySchema);
