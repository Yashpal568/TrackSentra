import { Router } from 'express';
import * as auditController from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', auditController.getAuditLogs);
router.get('/me', auditController.getMyActivity);
router.get('/export/csv', auditController.exportAuditLogsCsv);

export default router;
