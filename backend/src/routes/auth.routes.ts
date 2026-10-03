import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/demo', authLimiter, authController.demoLogin);
router.post('/register', authLimiter, authController.register);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', authLimiter, authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerification);
router.post('/activate-guard', authLimiter, authController.activateGuard);

router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateProfile);
router.get('/sessions', authenticate, authController.getSessions);
router.delete('/sessions/:id', authenticate, authController.revokeSession);

export default router;
