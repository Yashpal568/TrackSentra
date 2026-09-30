import mongoose, { Document, Schema } from 'mongoose';

export interface ICheckpointScan extends Document {
  companyId: mongoose.Types.ObjectId;
  siteId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  checkpointId: mongoose.Types.ObjectId;
  guardId: mongoose.Types.ObjectId;
  scannedAt: Date;
  status: 'valid' | 'out_of_sequence' | 'duplicate' | 'rejected';
  failureReason?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  distanceToCheckpoint?: number;
  locationVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CheckpointScanSchema = new Schema<ICheckpointScan>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'PatrolSession', required: true },
    checkpointId: { type: Schema.Types.ObjectId, ref: 'Checkpoint', required: function() { return this.status !== 'rejected'; } },
    guardId: { type: Schema.Types.ObjectId, ref: 'Guard', required: true },
    scannedAt: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ['valid', 'out_of_sequence', 'duplicate', 'rejected'],
      required: true,
    },
    failureReason: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    accuracy: { type: Number },
    distanceToCheckpoint: { type: Number },
    locationVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Helpful for sequence validation and duplicate prevention
CheckpointScanSchema.index({ sessionId: 1, checkpointId: 1 });
CheckpointScanSchema.index({ companyId: 1, sessionId: 1 });

export const CheckpointScan = mongoose.model<ICheckpointScan>('CheckpointScan', CheckpointScanSchema);
