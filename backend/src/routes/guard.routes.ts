import { Router } from 'express';
import * as guardController from '../controllers/guard.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createGuardSchema, updateGuardSchema } from '../validators/guard.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireActiveSubscription } from '../middleware/subscription.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);
router.use(requireActiveSubscription);

// List/view guards (any role in the company can view guards)
router.get('/', guardController.getGuards);
router.get('/:id', guardController.getGuardById);

// Manage guards (COMPANY_ADMIN or SITE_MANAGER)
router.post('/', requireRole([UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN]), validateRequest(createGuardSchema), guardController.createGuard);
router.put('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER]), validateRequest(updateGuardSchema), guardController.updateGuard);

export default router;
