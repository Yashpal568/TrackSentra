import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByToken?: string;
  createdAt: Date;
  updatedAt: Date;
  
  isExpired: boolean;
  isActive: boolean;
}

const RefreshTokenSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedByToken: { type: String },
  },
  { timestamps: true }
);

RefreshTokenSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expiresAt.getTime();
});

RefreshTokenSchema.virtual('isActive').get(function () {
  return !this.revokedAt && !this.isExpired;
});

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
