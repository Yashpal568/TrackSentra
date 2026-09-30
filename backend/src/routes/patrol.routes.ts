import { Router } from 'express';
import * as patrolController from '../controllers/patrol.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createPatrolRouteSchema, updatePatrolRouteSchema, startPatrolSessionSchema, scanCheckpointSchema } from '../validators/patrol.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

// --- Patrol Routes (Configuration) ---
// View routes (Any logged in user can view routes for their company/site)
router.get('/routes', patrolController.getPatrolRoutes);

// Live Monitoring SSE stream
router.get('/live/events', patrolController.livePatrolEvents);

// Manage routes (COMPANY_ADMIN, SITE_MANAGER)
router.post('/routes', requireRole([UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER]), validateRequest(createPatrolRouteSchema), patrolController.createPatrolRoute);
router.put('/routes/:id', requireRole([UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER]), validateRequest(updatePatrolRouteSchema), patrolController.updatePatrolRoute);

// --- Patrol Sessions ---
// View sessions (Any logged in user can view sessions for their company/site, Guards see their own)
router.get('/sessions', patrolController.getPatrolSessions);
router.get('/sessions/:id/scans', patrolController.getSessionScans);

// Start a patrol session (GUARD)
router.post('/sessions', requireRole([UserRole.GUARD]), validateRequest(startPatrolSessionSchema), patrolController.startPatrolSession);

// Scan a checkpoint
router.post('/sessions/:id/scans', requireRole([UserRole.GUARD]), validateRequest(scanCheckpointSchema), patrolController.scanCheckpoint);

// Complete a patrol session manually
router.post('/sessions/:id/complete', requireRole([UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER, UserRole.GUARD]), patrolController.completePatrolSession);

export default router;
