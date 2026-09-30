import mongoose, { Schema, Document } from 'mongoose';

export interface IGuard extends Document {
  companyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // References the User account
  employeeId?: string;
  phone?: string;
  assignedSites: mongoose.Types.ObjectId[];
  status: 'invited' | 'active' | 'inactive' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const GuardSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, trim: true },
    phone: { type: String, trim: true },
    assignedSites: [{ type: Schema.Types.ObjectId, ref: 'Site' }],
    status: { type: String, enum: ['invited', 'active', 'inactive', 'archived'], default: 'invited' },
  },
  { timestamps: true }
);

GuardSchema.index({ companyId: 1, status: 1 });
GuardSchema.index({ companyId: 1, employeeId: 1 }, { unique: true, sparse: true });

export const Guard = mongoose.model<IGuard>('Guard', GuardSchema);
