import { Router } from 'express';
import * as checkpointController from '../controllers/checkpoint.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createCheckpointSchema, updateCheckpointSchema } from '../validators/checkpoint.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireActiveSubscription } from '../middleware/subscription.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);
router.use(requireActiveSubscription);

// Lookup checkpoint by token (Guard QR scan)
router.get('/lookup/:token', requireRole([UserRole.GUARD]), checkpointController.lookupCheckpointByToken);

// List checkpoints (Any logged in user can view checkpoints for their company/site)
router.get('/', checkpointController.getCheckpoints);

// Manage checkpoints (COMPANY_ADMIN, SITE_MANAGER)
router.post('/', requireRole([UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER]), validateRequest(createCheckpointSchema), checkpointController.createCheckpoint);
router.put('/:id', requireRole([UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER]), validateRequest(updateCheckpointSchema), checkpointController.updateCheckpoint);
router.post('/:id/verify', requireRole([UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER]), checkpointController.verifyCheckpoint);
router.post('/:id/qr', requireRole([UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER]), checkpointController.regenerateQrCode);

export default router;
