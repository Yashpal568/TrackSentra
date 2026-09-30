import { Router } from 'express';
import * as subController from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/plans/public', subController.getPublishedPlans);
router.get('/settings/payment-instructions', subController.getSystemSettings);

// Protected routes
router.use(authenticate);

// Super Admin
router.get('/plans', subController.getAllPlans);
router.post('/plans', subController.createPlan);
router.put('/plans/:id', subController.updatePlan);
router.delete('/plans/:id', subController.deletePlan);
router.put('/settings', subController.updateSystemSettings);

// Customer endpoints
router.get('/my', subController.getMySubscription);
router.post('/pay', subController.submitPayment);

// Payment Verification
router.get('/payments', subController.getPaymentSubmissions);
router.post('/payments/:id/verify', subController.verifyPayment);

export default router;
