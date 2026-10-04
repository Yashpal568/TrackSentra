import { Request, Response } from 'express';
import { Site } from '../models/Site';
import { AuditLog } from '../models/AuditLog';
import { checkResourceLimit } from '../utils/entitlements';

export const createSite = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { name, address, city, state, country, latitude, longitude, radius, timezone, status } = req.body;

    // Entitlement Check
    const currentSiteCount = await Site.countDocuments({ companyId: user.companyId });
    const limitCheck = await checkResourceLimit(user.companyId, 'sites', currentSiteCount);
    if (!limitCheck.allowed) {
      res.status(403).json({ error: { message: limitCheck.reason } });
      return;
    }

    const site = await Site.create({
      companyId: user.companyId, // Force tenant boundary
      name,
      address,
      city,
      state,
      country: country || 'India',
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      radius: radius ? parseFloat(radius) : 100,
      timezone: timezone || 'Asia/Kolkata',
      status: status || 'active'
    });

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'CREATE_SITE',
      resource: 'Site',
      details: { siteId: site._id },
    });

    res.status(201).json({ site });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to create site' } });
  }
};

export const getSites = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = { companyId: user.companyId };

    const sites = await Site.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Site.countDocuments(query);

    res.json({
      sites,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch sites' } });
  }
};

export const getSiteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const site = await Site.findOne({ _id: req.params.id, companyId: user.companyId });
    
    if (!site) {
      res.status(404).json({ error: { message: 'Site not found' } });
      return;
    }

    res.json({ site });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch site' } });
  }
};

export const updateSite = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const updates = req.body;

    // Remove attempting to hijack companyId
    delete updates.companyId;

    const site = await Site.findOneAndUpdate(
      { _id: req.params.id, companyId: user.companyId },
      updates,
      { new: true }
    );

    if (!site) {
      res.status(404).json({ error: { message: 'Site not found' } });
      return;
    }

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'UPDATE_SITE',
      resource: 'Site',
      details: { siteId: site._id },
    });

    res.json({ site });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update site' } });
  }
};

export const deleteSite = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const site = await Site.findOneAndDelete({ _id: req.params.id, companyId: user.companyId });

    if (!site) {
      res.status(404).json({ error: { message: 'Site not found' } });
      return;
    }

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'DELETE_SITE',
      resource: 'Site',
      details: { siteId: site._id },
    });

    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete site' } });
  }
};
