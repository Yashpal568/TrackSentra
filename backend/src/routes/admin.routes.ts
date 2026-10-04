import { Router } from 'express';
import { authenticate, requireSuperAdmin } from '../middleware/auth.middleware';
import { getPlatformDashboard } from '../controllers/admin.controller';

const router = Router();

// All routes require SUPER_ADMIN
router.use(authenticate, requireSuperAdmin);

router.get('/dashboard', getPlatformDashboard);

export default router;
