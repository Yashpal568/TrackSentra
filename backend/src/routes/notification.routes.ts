import { Router } from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, notificationStream } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/stream', notificationStream);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
