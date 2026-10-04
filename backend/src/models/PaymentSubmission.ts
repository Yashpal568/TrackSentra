import mongoose, { Schema, Document } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED'
}

export interface IPaymentSubmission extends Document {
  companyId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  submitterId: mongoose.Types.ObjectId;
  
  expectedAmount: number;
  currency: string;
  
  transactionReference: string;
  paymentDate: Date;
  evidenceUrl?: string;

  status: PaymentStatus;
  
  reviewerId?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  
  targetPlanId?: mongoose.Types.ObjectId;
  targetBillingInterval?: string;
  isUpgrade?: boolean;
  prorationCredit?: number;

  createdAt: Date;
  updatedAt: Date;
}

const PaymentSubmissionSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
    submitterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    expectedAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    
    transactionReference: { type: String, required: true, trim: true },
    paymentDate: { type: Date, required: true },
    evidenceUrl: { type: String },

    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING, index: true },

    reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },

    targetPlanId: { type: Schema.Types.ObjectId, ref: 'Plan' },
    targetBillingInterval: { type: String },
    isUpgrade: { type: Boolean, default: false },
    prorationCredit: { type: Number, default: 0 }
  },
  { timestamps: true }
);

PaymentSubmissionSchema.index({ transactionReference: 1 }, { unique: true });

export const PaymentSubmission = mongoose.model<IPaymentSubmission>('PaymentSubmission', PaymentSubmissionSchema);
