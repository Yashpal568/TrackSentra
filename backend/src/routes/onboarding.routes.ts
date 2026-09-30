import { Router } from 'express';
import { getOnboardingStatus, dismissOnboarding } from '../controllers/onboarding.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole as authorize } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.get('/status', authorize([UserRole.COMPANY_ADMIN]), getOnboardingStatus);
router.post('/dismiss', authorize([UserRole.COMPANY_ADMIN]), dismissOnboarding);

export default router;
