import { Router } from 'express';
import { authenticate, requireSuperAdmin } from '../middleware/auth.middleware';
import { getPlatformDashboard, getAllSubscriptions, getRevenueAnalytics } from '../controllers/admin.controller';

const router = Router();

// All routes require SUPER_ADMIN
router.use(authenticate, requireSuperAdmin);

router.get('/dashboard', getPlatformDashboard);
router.get('/subscriptions', getAllSubscriptions);
router.get('/revenue', getRevenueAnalytics);

export default router;
