import { Notification, INotification } from '../models/Notification';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { SocketService } from './socket.service';

interface CreateNotificationParams {
  companyId: string | mongoose.Types.ObjectId;
  recipientUserId?: string | mongoose.Types.ObjectId; // Optional: If omitted, send to all company admins
  type: string;
  title: string;
  message: string;
  severity?: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  entityType?: 'Patrol' | 'Checkpoint' | 'Incident' | 'Guard' | 'System';
  entityId?: string | mongoose.Types.ObjectId;
  siteId?: string | mongoose.Types.ObjectId;
  patrolId?: string | mongoose.Types.ObjectId;
  guardId?: string | mongoose.Types.ObjectId;
  checkpointId?: string | mongoose.Types.ObjectId;
  metadata?: any;
}

export class NotificationService {
  /**
   * Creates a notification for a specific user, or all admins in a company if recipientUserId is not provided.
   */
  static async createNotification(params: CreateNotificationParams): Promise<INotification[]> {
    const notificationsToCreate = [];

    if (params.recipientUserId) {
      notificationsToCreate.push({
        ...params,
        severity: params.severity || 'INFO',
      });
    } else {
      // Find all SUPER_ADMIN and COMPANY_ADMIN for this company
      const admins = await User.find({
        companyId: params.companyId,
        role: { $in: ['SUPER_ADMIN', 'COMPANY_ADMIN'] }
      } as any).select('_id');

      admins.forEach((admin: any) => {
        notificationsToCreate.push({
          ...params,
          recipientUserId: admin._id,
          severity: params.severity || 'INFO',
        });
      });
    }

    const createdNotifications = await Notification.insertMany(notificationsToCreate);

    // Dispatch real-time events to connected clients
    createdNotifications.forEach((notification: any) => {
      SocketService.emitToUser(
        notification.recipientUserId,
        'notification:new',
        notification
      );
    });

    return createdNotifications as any;
  }

  /**
   * Notifies all SUPER_ADMIN users across the platform.
   */
  static async notifySuperAdmins(params: Omit<CreateNotificationParams, 'companyId' | 'recipientUserId'>): Promise<void> {
    const superAdmins = await User.find({ role: 'SUPER_ADMIN' }).select('_id companyId');
    if (!superAdmins.length) return;

    const notificationsToCreate = superAdmins.map(admin => ({
      ...params,
      companyId: admin.companyId,
      recipientUserId: admin._id,
      severity: params.severity || 'INFO',
    }));

    const createdNotifications = await Notification.insertMany(notificationsToCreate);

    createdNotifications.forEach((notification: any) => {
      SocketService.emitToUser(
        notification.recipientUserId,
        'notification:new',
        notification
      );
    });
  }
}
