import mongoose, { Schema, Document } from 'mongoose';

export interface IShift extends Document {
  companyId: mongoose.Types.ObjectId;
  siteId: mongoose.Types.ObjectId;
  guardId: mongoose.Types.ObjectId; // References Guard
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShiftSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    guardId: { type: Schema.Types.ObjectId, ref: 'Guard', required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled' },
    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes for schedule conflict detection and tenant isolation
ShiftSchema.index({ companyId: 1, siteId: 1, startTime: 1 });
ShiftSchema.index({ guardId: 1, startTime: 1, endTime: 1 });

export const Shift = mongoose.model<IShift>('Shift', ShiftSchema);
