import mongoose, { Schema, Document } from 'mongoose';

export interface ICheckpoint extends Document {
  companyId: mongoose.Types.ObjectId;
  siteId: mongoose.Types.ObjectId;
  name: string;
  qrPayload: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // In meters, default 50
  gpsAccuracyThreshold?: number; // Minimum acceptable accuracy in meters
  status: 'active' | 'inactive' | 'archived';
  installationStatus: 'pending' | 'active' | 'disabled';
  description?: string;
  installationInstructions?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
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
    gpsAccuracyThreshold: { type: Number, default: 20 },
    status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
    installationStatus: { type: String, enum: ['pending', 'active', 'disabled'], default: 'pending' },
    description: { type: String, trim: true },
    installationInstructions: { type: String, trim: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes for tenant isolation and uniqueness constraints
CheckpointSchema.index({ companyId: 1, siteId: 1 });

export const Checkpoint = mongoose.model<ICheckpoint>('Checkpoint', CheckpointSchema);
