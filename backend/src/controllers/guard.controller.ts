import { Request, Response } from 'express';
import { User, UserRole } from '../models/User';
import { Guard } from '../models/Guard';
import { AuditLog } from '../models/AuditLog';
import bcrypt from 'bcryptjs';

export const createGuard = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { firstName, lastName, email, password, employeeId, phone, assignedSites } = req.body;

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: { message: 'Email already exists' } });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newGuardUser = await User.create({
      companyId: user.companyId,
      firstName,
      lastName,
      email,
      passwordHash,
      role: UserRole.GUARD,
    });

    const guard = await Guard.create({
      companyId: user.companyId,
      userId: newGuardUser._id,
      employeeId,
      phone,
      assignedSites: assignedSites || [],
    });

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'CREATE_GUARD',
      resource: 'Guard',
      details: { guardId: guard._id, guardUserId: newGuardUser._id },
    });

    res.status(201).json({ guard, user: { _id: newGuardUser._id, email: newGuardUser.email } });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to create guard' } });
  }
};

export const getGuards = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const guards = await Guard.find({ companyId: user.companyId })
      .populate('userId', 'firstName lastName email')
      .populate('assignedSites', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Guard.countDocuments({ companyId: user.companyId });

    res.json({
      guards,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch guards' } });
  }
};

export const getGuardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const guard = await Guard.findOne({ _id: req.params.id, companyId: user.companyId })
      .populate('userId', 'firstName lastName email')
      .populate('assignedSites', 'name');

    if (!guard) {
      res.status(404).json({ error: { message: 'Guard not found' } });
      return;
    }

    res.json({ guard });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch guard' } });
  }
};

export const updateGuard = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const updates = req.body;

    const guard = await Guard.findOne({ _id: req.params.id, companyId: user.companyId });
    if (!guard) {
      res.status(404).json({ error: { message: 'Guard not found' } });
      return;
    }

    // Update Guard profile
    if (updates.employeeId !== undefined) guard.employeeId = updates.employeeId;
    if (updates.phone !== undefined) guard.phone = updates.phone;
    if (updates.assignedSites !== undefined) guard.assignedSites = updates.assignedSites;
    if (updates.status !== undefined) guard.status = updates.status;
    await guard.save();

    // Sync basic info to User profile
    if (updates.firstName || updates.lastName || updates.status) {
      const guardUser = await User.findById(guard.userId);
      if (guardUser) {
        if (updates.firstName) guardUser.firstName = updates.firstName;
        if (updates.lastName) guardUser.lastName = updates.lastName;
        // Map guard status to user status securely
        if (updates.status === 'inactive' || updates.status === 'archived') {
          guardUser.status = 'inactive'; // Ensure they can't log in
        } else if (updates.status === 'active') {
          guardUser.status = 'active';
        }
        await guardUser.save();
      }
    }

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'UPDATE_GUARD',
      resource: 'Guard',
      details: { guardId: guard._id },
    });

    res.json({ guard });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update guard' } });
  }
};
