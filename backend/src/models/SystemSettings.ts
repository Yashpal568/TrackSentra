import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  manualPaymentInstructions: {
    upiId?: string;
    upiName?: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    ifsc?: string;
    additionalInstructions?: string;
  };
  updatedAt: Date;
}

const SystemSettingsSchema: Schema = new Schema(
  {
    // A singleton document
    _id: { type: String, default: 'global_settings' },
    manualPaymentInstructions: {
      upiId: { type: String, trim: true },
      upiName: { type: String, trim: true },
      bankName: { type: String, trim: true },
      accountName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifsc: { type: String, trim: true },
      additionalInstructions: { type: String },
    }
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const SystemSettings = mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
