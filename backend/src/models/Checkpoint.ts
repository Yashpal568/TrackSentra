import mongoose, { Schema, Document } from 'mongoose';

export interface ICheckpoint extends Document {
  companyId: mongoose.Types.ObjectId;
  siteId: mongoose.Types.ObjectId;
  name: string;
  qrPayload: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // In meters, default 50
  status: 'active' | 'inactive' | 'archived';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CheckpointSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    name: { type: String, required: true, trim: true },
    qrPayload: { type: String, required: true, unique: true }, // The opaque token encoded in the QR
    latitude: { type: Number },
    longitude: { type: Number },
    radius: { type: Number, default: 50 },
    status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes for tenant isolation and uniqueness constraints
CheckpointSchema.index({ companyId: 1, siteId: 1 });

export const Checkpoint = mongoose.model<ICheckpoint>('Checkpoint', CheckpointSchema);
