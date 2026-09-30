import mongoose, { Schema, Document } from 'mongoose';

export type IncidentCategory = 'Security' | 'Maintenance' | 'Medical' | 'Other';
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'Acknowledged' | 'Under Investigation' | 'Resolved' | 'Closed';

export interface IInvestigationNote {
  note: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IIncident extends Document {
  companyId: mongoose.Types.ObjectId;
  siteId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId; // Who reported it (User ID)
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  patrolSessionId?: mongoose.Types.ObjectId;
  checkpointId?: mongoose.Types.ObjectId;
  assigneeId?: mongoose.Types.ObjectId; // Who is investigating (User ID)
  investigationNotes: IInvestigationNote[];
  resolutionDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvestigationNoteSchema = new Schema({
  note: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const IncidentSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Security', 'Maintenance', 'Medical', 'Other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Acknowledged', 'Under Investigation', 'Resolved', 'Closed'],
      default: 'Open',
    },
    patrolSessionId: { type: Schema.Types.ObjectId, ref: 'PatrolSession' },
    checkpointId: { type: Schema.Types.ObjectId, ref: 'Checkpoint' },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
    investigationNotes: [InvestigationNoteSchema],
    resolutionDetails: { type: String },
  },
  {
    timestamps: true,
  }
);

IncidentSchema.index({ companyId: 1, siteId: 1, status: 1 });
IncidentSchema.index({ companyId: 1, assigneeId: 1 });

export const Incident = mongoose.model<IIncident>('Incident', IncidentSchema);
