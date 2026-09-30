import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  SITE_MANAGER = 'SITE_MANAGER',
  SECURITY_SUPERVISOR = 'SECURITY_SUPERVISOR',
  GUARD = 'GUARD',
}

export interface IUser extends Document {
  companyId?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for tenant-isolation queries
UserSchema.index({ companyId: 1, email: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
