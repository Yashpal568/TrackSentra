import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { notificationEventEmitter } from '../services/notification.service';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 25;
  const skip = (page - 1) * limit;
  const filterType = req.query.filter as string; // 'all', 'unread', 'alerts'

  const filter: any = { 
    recipientUserId: user._id, 
    companyId: user.companyId 
  };

  if (filterType === 'unread') {
    filter.isRead = false;
  } else if (filterType === 'alerts') {
    filter.severity = { $in: ['WARNING', 'CRITICAL'] };
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(filter);

  res.json({
    notifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const count = await Notification.countDocuments({
    recipientUserId: user._id,
    companyId: user.companyId,
    isRead: false
  });
  res.json({ unreadCount: count });
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipientUserId: user._id, companyId: user.companyId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    res.status(404).json({ error: { message: 'Notification not found' } });
    return;
  }

  res.json(notification);
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  await Notification.updateMany(
    { recipientUserId: user._id, companyId: user.companyId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.json({ success: true });
};

export const notificationStream = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`);

  const onUpdate = (eventData: any) => {
    // Only send if recipient matches and company matches
    if (
      eventData.recipientUserId === user._id.toString() &&
      eventData.companyId === user.companyId.toString()
    ) {
      res.write(`data: ${JSON.stringify(eventData.notification)}\n\n`);
    }
  };

  notificationEventEmitter.on('new_notification', onUpdate);

  req.on('close', () => {
    notificationEventEmitter.removeListener('new_notification', onUpdate);
  });
};
