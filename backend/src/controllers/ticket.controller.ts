import { Request, Response } from 'express';
import { Ticket, TicketStatus } from '../models/Ticket';
import { TicketReply } from '../models/TicketReply';
import crypto from 'crypto';

const generateTicketRef = () => {
  return 'TKT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { subject, category, description } = req.body;

  const ticket = new Ticket({
    ticketReference: generateTicketRef(),
    companyId: user.companyId,
    creatorId: user.id,
    subject,
    category,
    description
  });

  await ticket.save();
  res.status(201).json(ticket);
};

export const getCompanyTickets = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  
  const tickets = await Ticket.find({ companyId: user.companyId })
    .populate('creatorId', 'firstName lastName email')
    .sort({ updatedAt: -1 })
    .lean();

  res.json(tickets);
};

export const getTicketDetails = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;

  const ticket = await Ticket.findOne({ _id: id, companyId: user.companyId })
    .populate('creatorId', 'firstName lastName email')
    .populate('assigneeId', 'firstName lastName')
    .lean();

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const replies = await TicketReply.find({ ticketId: id })
    .populate('authorId', 'firstName lastName role')
    .sort({ createdAt: 1 })
    .lean();

  res.json({ ticket, replies });
};

export const replyToTicket = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;
  const { content } = req.body;

  const ticket = await Ticket.findOne({ _id: id, companyId: user.companyId });
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const reply = new TicketReply({
    ticketId: id,
    authorId: user.id,
    content
  });

  await reply.save();
  
  // Re-open ticket if it was waiting for customer
  if (ticket.status === TicketStatus.WAITING_FOR_CUSTOMER || ticket.status === TicketStatus.RESOLVED) {
    ticket.status = TicketStatus.OPEN;
    await ticket.save();
  } else {
    // Just bump updatedAt
    ticket.updatedAt = new Date();
    await ticket.save();
  }

  res.status(201).json(reply);
};

// Admin Endpoints
export const getAdminTickets = async (req: Request, res: Response): Promise<void> => {
  const { status, companyId } = req.query;
  const filter: any = {};
  
  if (status) filter.status = status;
  if (companyId) filter.companyId = companyId;

  const tickets = await Ticket.find(filter)
    .populate('companyId', 'name')
    .populate('creatorId', 'firstName lastName')
    .populate('assigneeId', 'firstName lastName')
    .sort({ updatedAt: -1 })
    .lean();

  res.json(tickets);
};

export const getAdminTicketDetails = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const ticket = await Ticket.findById(id)
    .populate('companyId', 'name')
    .populate('creatorId', 'firstName lastName email')
    .populate('assigneeId', 'firstName lastName')
    .lean();

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const replies = await TicketReply.find({ ticketId: id })
    .populate('authorId', 'firstName lastName role')
    .sort({ createdAt: 1 })
    .lean();

  res.json({ ticket, replies });
};

export const updateAdminTicket = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, assigneeId } = req.body;

  const ticket = await Ticket.findByIdAndUpdate(
    id,
    { status, assigneeId },
    { new: true, runValidators: true }
  );

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.json(ticket);
};

export const adminReplyToTicket = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;
  const { content, status } = req.body;

  const ticket = await Ticket.findById(id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const reply = new TicketReply({
    ticketId: id,
    authorId: user.id,
    content
  });

  await reply.save();
  
  if (status && Object.values(TicketStatus).includes(status)) {
    ticket.status = status;
  } else {
    // If admin replies without changing status, default to WAITING_FOR_CUSTOMER
    ticket.status = TicketStatus.WAITING_FOR_CUSTOMER;
  }
  
  ticket.updatedAt = new Date();
  await ticket.save();

  res.status(201).json(reply);
};
