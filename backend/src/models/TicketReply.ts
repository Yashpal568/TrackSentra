import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketReply extends Document {
  ticketId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketReplySchema: Schema = new Schema(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

export const TicketReply = mongoose.model<ITicketReply>('TicketReply', TicketReplySchema);
