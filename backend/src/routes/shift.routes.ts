import { Router } from 'express';
import * as shiftController from '../controllers/shift.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createShiftSchema, updateShiftSchema } from '../validators/shift.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

// View shifts
router.get('/', shiftController.getShifts);

// Manage shifts (COMPANY_ADMIN, SITE_MANAGER, SECURITY_SUPERVISOR)
router.post('/', requireRole([UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER, UserRole.SECURITY_SUPERVISOR]), validateRequest(createShiftSchema), shiftController.createShift);
router.put('/:id', requireRole([UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER, UserRole.SECURITY_SUPERVISOR]), validateRequest(updateShiftSchema), shiftController.updateShift);
router.delete('/:id', requireRole([UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER]), shiftController.deleteShift);

export default router;
