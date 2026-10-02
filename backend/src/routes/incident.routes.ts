import { Router } from 'express';
import * as incidentController from '../controllers/incident.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireActiveSubscription } from '../middleware/subscription.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);
router.use(requireActiveSubscription);

// Everyone can create and list incidents (guards see their own)
router.post('/', incidentController.createIncident);
router.get('/', incidentController.getIncidents);
router.get('/:id', incidentController.getIncidentById);

// Only Admins and Supervisors can manage/update incidents
router.put('/:id', requireRole([UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER]), incidentController.updateIncident);

// Admins and supervisors can add investigation notes
router.post('/:id/notes', requireRole([UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER]), incidentController.addInvestigationNote);

export default router;
