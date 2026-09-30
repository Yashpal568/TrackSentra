import { Router } from 'express';
import * as siteController from '../controllers/site.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createSiteSchema, updateSiteSchema } from '../validators/site.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

// List/view sites (any role in the company)
router.get('/', siteController.getSites);
router.get('/:id', siteController.getSiteById);

// Manage sites (COMPANY_ADMIN or SITE_MANAGER)
router.post('/', requireRole([UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN]), validateRequest(createSiteSchema), siteController.createSite);
router.put('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER]), validateRequest(updateSiteSchema), siteController.updateSite);
router.delete('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN]), siteController.deleteSite);

export default router;
