import { Router } from 'express';
import * as subController from '../controllers/subscription.controller';
import { authenticate, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/plans/public', subController.getPublishedPlans);
router.get('/settings/payment-instructions', subController.getSystemSettings);

// Protected routes
router.use(authenticate);

// Super Admin
router.get('/plans', requireSuperAdmin, subController.getAllPlans);
router.post('/plans', requireSuperAdmin, subController.createPlan);
router.put('/plans/:id', requireSuperAdmin, subController.updatePlan);
router.delete('/plans/:id', requireSuperAdmin, subController.deletePlan);
router.put('/settings', requireSuperAdmin, subController.updateSystemSettings);

// Customer endpoints
router.get('/my', subController.getMySubscription);
router.post('/my', subController.selectPlan);
router.post('/pay', subController.submitPayment);
router.post('/cancel', subController.cancelSubscription);
router.post('/resume', subController.resumeSubscription);

export default router;
