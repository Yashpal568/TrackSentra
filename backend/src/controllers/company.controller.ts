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

    const { name, timezone, address, contactEmail, contactPhone, settings } = req.body;
    
    const company = await Company.findById(companyId);
    if (!company) {
      res.status(404).json({ error: { message: 'Company not found' } });
      return;
    }

    const oldValues = {
      name: company.name,
      timezone: company.timezone,
      address: company.address,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      settings: company.settings,
    };

    if (name) company.name = name;
    if (timezone) company.timezone = timezone;
    if (address !== undefined) company.address = address;
    if (contactEmail !== undefined) company.contactEmail = contactEmail;
    if (contactPhone !== undefined) company.contactPhone = contactPhone;
    
    if (settings) {
      if (settings.patrol) {
        if (settings.patrol.requireGps !== undefined) company.settings.patrol.requireGps = settings.patrol.requireGps;
        if (settings.patrol.gpsAccuracyThreshold !== undefined) company.settings.patrol.gpsAccuracyThreshold = settings.patrol.gpsAccuracyThreshold;
        if (settings.patrol.scanWindowMinutes !== undefined) company.settings.patrol.scanWindowMinutes = settings.patrol.scanWindowMinutes;
        if (settings.patrol.autoComplete !== undefined) company.settings.patrol.autoComplete = settings.patrol.autoComplete;
      }
      if (settings.security) {
        if (settings.security.sessionTimeoutMinutes !== undefined) company.settings.security.sessionTimeoutMinutes = settings.security.sessionTimeoutMinutes;
        if (settings.security.multiDeviceLogin !== undefined) company.settings.security.multiDeviceLogin = settings.security.multiDeviceLogin;
        if (settings.security.requireDeviceLocation !== undefined) company.settings.security.requireDeviceLocation = settings.security.requireDeviceLocation;
        if (settings.security.loginAttemptLimit !== undefined) company.settings.security.loginAttemptLimit = settings.security.loginAttemptLimit;
        if (settings.security.passwordExpiryDays !== undefined) company.settings.security.passwordExpiryDays = settings.security.passwordExpiryDays;
      }
    }

    // Only SUPER_ADMIN can change status (suspend/archive)
    if (req.body.status && user.role === UserRole.SUPER_ADMIN) {
      company.status = req.body.status;
    }

    await company.save();

    await AuditLog.create({
      companyId: company._id,
      userId: user._id,
      action: 'UPDATE_COMPANY_SETTINGS',
      resource: 'Company',
      details: {
        oldValues,
        newValues: {
          name: company.name,
          timezone: company.timezone,
          address: company.address,
          contactEmail: company.contactEmail,
          contactPhone: company.contactPhone,
          settings: company.settings,
        }
      },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    res.json({ company });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};
