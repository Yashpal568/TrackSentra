import mongoose, { Schema, Document } from 'mongoose';

export enum TokenType {
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  RESET_PASSWORD = 'RESET_PASSWORD',
  GUARD_ACTIVATION = 'GUARD_ACTIVATION'
}

export interface IVerificationToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  type: TokenType;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

const VerificationTokenSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true },
    type: { type: String, enum: Object.values(TokenType), required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date }
  },
  { timestamps: true }
);

VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const VerificationToken = mongoose.model<IVerificationToken>('VerificationToken', VerificationTokenSchema);
