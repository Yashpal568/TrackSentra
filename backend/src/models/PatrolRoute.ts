import mongoose, { Document, Schema } from 'mongoose';

export interface IPatrolRoute extends Document {
  companyId: mongoose.Types.ObjectId;
  siteId: mongoose.Types.ObjectId;
  name: string;
  checkpoints: mongoose.Types.ObjectId[];
  expectedDurationMinutes: number;
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const PatrolRouteSchema = new Schema<IPatrolRoute>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
    name: { type: String, required: true },
    checkpoints: [{ type: Schema.Types.ObjectId, ref: 'Checkpoint' }],
    expectedDurationMinutes: { type: Number, required: true, default: 60 },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

PatrolRouteSchema.index({ companyId: 1, siteId: 1, status: 1 });

export const PatrolRoute = mongoose.model<IPatrolRoute>('PatrolRoute', PatrolRouteSchema);
