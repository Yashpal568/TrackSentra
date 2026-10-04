import { Router } from 'express';
import { authenticate, requireSuperAdmin } from '../middleware/auth.middleware';
import { 
  getPlatformDashboard, getAllSubscriptions, getRevenueAnalytics, 
  getAdminNotificationsSummary, verifyPayment, suspendSubscription, 
  getPlatformCompanies, suspendCompany, deleteCompany, impersonateCompany 
} from '../controllers/admin.controller';

const router = Router();

// All routes require SUPER_ADMIN
router.use(authenticate, requireSuperAdmin);

router.get('/dashboard', getPlatformDashboard);
router.get('/companies', getPlatformCompanies);
router.post('/companies/:id/impersonate', impersonateCompany);
router.put('/companies/:id/suspend', suspendCompany);
router.delete('/companies/:id', deleteCompany);
router.get('/subscriptions', getAllSubscriptions);
router.get('/revenue', getRevenueAnalytics);
router.get('/notifications/summary', getAdminNotificationsSummary);
router.post('/verify-payment', verifyPayment);
router.put('/subscriptions/:id/suspend', suspendSubscription);

export default router;
