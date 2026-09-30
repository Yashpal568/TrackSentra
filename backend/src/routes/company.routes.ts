import { Router } from 'express';
import * as companyController from '../controllers/company.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createCompanySchema, updateCompanySchema } from '../validators/company.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

// SUPER_ADMIN only
router.post('/', requireRole([UserRole.SUPER_ADMIN]), validateRequest(createCompanySchema), companyController.createCompany);

// All roles can get their own company (or SUPER_ADMIN can get all)
router.get('/', companyController.getCompanies);
router.get('/:id', companyController.getCompanyById);

// COMPANY_ADMIN can update their own company, SUPER_ADMIN can update any
router.put('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN]), validateRequest(updateCompanySchema), companyController.updateCompany);

export default router;
