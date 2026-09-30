import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

// All reports are accessible only to SUPER_ADMIN, COMPANY_ADMIN, SITE_MANAGER
router.use(requireRole([UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER]));

router.get('/patrols', reportController.getPatrolHistory);
router.get('/operational', reportController.getOperationalSummary);
router.get('/guards', reportController.getGuardReports);
router.get('/checkpoints', reportController.getCheckpointAnalytics);
router.get('/export/csv', reportController.exportCsv);

export default router;
