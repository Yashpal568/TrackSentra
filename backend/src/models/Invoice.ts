import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  companyId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  paymentSubmissionId?: mongoose.Types.ObjectId;
  invoiceNumber: string;
  amount: number;
  currency: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  status: 'PAID' | 'VOID' | 'PENDING';
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
    paymentSubmissionId: { type: Schema.Types.ObjectId, ref: 'PaymentSubmission' },
    invoiceNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    billingPeriodStart: { type: Date, required: true },
    billingPeriodEnd: { type: Date, required: true },
    status: { type: String, enum: ['PAID', 'VOID', 'PENDING'], default: 'PENDING' }
  },
  { timestamps: true }
);

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
