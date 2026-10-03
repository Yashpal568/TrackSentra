import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);
router.use(requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN]));

router.get('/summary', getDashboardSummary);

export default router;
