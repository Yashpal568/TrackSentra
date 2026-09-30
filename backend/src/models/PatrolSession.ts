import mongoose, { Document, Schema } from 'mongoose';

export interface IPatrolSession extends Document {
  companyId: mongoose.Types.ObjectId;
  siteId: mongoose.Types.ObjectId;
  routeId: mongoose.Types.ObjectId;
  guardId: mongoose.Types.ObjectId;
  shiftId?: mongoose.Types.ObjectId;
  status: 'scheduled' | 'pending' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
  expectedStartTime?: Date;
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PatrolSessionSchema = new Schema<IPatrolSession>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
    routeId: { type: Schema.Types.ObjectId, ref: 'PatrolRoute', required: true },
    guardId: { type: Schema.Types.ObjectId, ref: 'Guard', required: true },
    shiftId: { type: Schema.Types.ObjectId, ref: 'Shift' },
    status: {
      type: String,
      enum: ['scheduled', 'pending', 'in_progress', 'completed', 'missed', 'cancelled'],
      default: 'pending',
    },
    expectedStartTime: { type: Date },
    startTime: { type: Date },
    endTime: { type: Date },
  },
  { timestamps: true }
);

PatrolSessionSchema.index({ companyId: 1, siteId: 1, guardId: 1, status: 1 });

export const PatrolSession = mongoose.model<IPatrolSession>('PatrolSession', PatrolSessionSchema);
