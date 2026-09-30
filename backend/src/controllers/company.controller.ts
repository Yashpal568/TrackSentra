import { Request, Response } from 'express';
import { Company } from '../models/Company';
import { UserRole } from '../models/User';
import { AuditLog } from '../models/AuditLog';

// SUPER_ADMIN creates companies
export const createCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, timezone, address } = req.body;
    const company = await Company.create({ name, timezone, address });

    await AuditLog.create({
      userId: (req as any).user._id,
      action: 'CREATE_COMPANY',
      resource: 'Company',
      details: { companyId: company._id },
    });

    res.status(201).json({ company });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to create company' } });
  }
};

export const getCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    
    // Platform admin sees all, others only see their own
    const query = user.role === UserRole.SUPER_ADMIN ? {} : { _id: user.companyId };
    
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const companies = await Company.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Company.countDocuments(query);

    res.json({
      companies,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch companies' } });
  }
};

export const getCompanyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const companyId = req.params.id;

    if (user.role !== UserRole.SUPER_ADMIN && user.companyId.toString() !== companyId) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }

    const company = await Company.findById(companyId);
    if (!company) {
      res.status(404).json({ error: { message: 'Company not found' } });
      return;
    }

    res.json({ company });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch company' } });
  }
};

export const updateCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const companyId = req.params.id;

    if (user.role !== UserRole.SUPER_ADMIN && user.companyId.toString() !== companyId) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }

    const updates = req.body;
    
    // Only SUPER_ADMIN can change status (suspend/archive)
    if (updates.status && user.role !== UserRole.SUPER_ADMIN) {
      delete updates.status;
    }

    const company = await Company.findByIdAndUpdate(companyId, updates, { new: true });
    
    if (!company) {
      res.status(404).json({ error: { message: 'Company not found' } });
      return;
    }

    await AuditLog.create({
      companyId: company._id,
      userId: user._id,
      action: 'UPDATE_COMPANY',
      resource: 'Company',
    });

    res.json({ company });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update company' } });
  }
};
