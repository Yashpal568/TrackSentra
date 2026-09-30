import mongoose, { Schema, Document } from 'mongoose';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_CUSTOMER = 'WAITING_FOR_CUSTOMER',
  RESOLVED = 'RESOLVED',
}

export interface ITicket extends Document {
  ticketReference: string;
  companyId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  subject: string;
  category: string;
  description: string;
  status: TicketStatus;
  assigneeId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema = new Schema(
  {
    ticketReference: { type: String, required: true, unique: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: { type: String, enum: Object.values(TicketStatus), default: TicketStatus.OPEN, index: true },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
