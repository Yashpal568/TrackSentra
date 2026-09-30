import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

router.get('/me', authenticate, authController.getMe);

export default router;
