import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  companyId: mongoose.Types.ObjectId;
  recipientUserId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  entityType?: 'Patrol' | 'Checkpoint' | 'Incident' | 'Guard' | 'System';
  entityId?: mongoose.Types.ObjectId;
  siteId?: mongoose.Types.ObjectId;
  patrolId?: mongoose.Types.ObjectId;
  guardId?: mongoose.Types.ObjectId;
  checkpointId?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  metadata?: any;
}

const NotificationSchema: Schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  recipientUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['INFO', 'SUCCESS', 'WARNING', 'CRITICAL'], default: 'INFO' },
  entityType: { type: String, enum: ['Patrol', 'Checkpoint', 'Incident', 'Guard', 'System'] },
  entityId: { type: Schema.Types.ObjectId },
  siteId: { type: Schema.Types.ObjectId, ref: 'Site' },
  patrolId: { type: Schema.Types.ObjectId, ref: 'PatrolSession' },
  guardId: { type: Schema.Types.ObjectId, ref: 'Guard' },
  checkpointId: { type: Schema.Types.ObjectId, ref: 'Checkpoint' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

// Indexes for performance
NotificationSchema.index({ recipientUserId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ companyId: 1, recipientUserId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
