import { Request, Response } from 'express';
import { Shift } from '../models/Shift';
import { Guard } from '../models/Guard';
import { Site } from '../models/Site';
import { AuditLog } from '../models/AuditLog';

export const createShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { siteId, guardId, startTime, endTime, notes } = req.body;

    // Verify guard belongs to tenant and is active
    const guard = await Guard.findOne({ _id: guardId, companyId: user.companyId });
    if (!guard || guard.status !== 'active') {
      res.status(400).json({ error: { message: 'Invalid or inactive guard' } });
      return;
    }

    // Verify site belongs to tenant and is active
    const site = await Site.findOne({ _id: siteId, companyId: user.companyId });
    if (!site || site.status !== 'active') {
      res.status(400).json({ error: { message: 'Invalid or inactive site' } });
      return;
    }

    // Verify guard is assigned to this site (if restriction applies)
    if (guard.assignedSites && guard.assignedSites.length > 0) {
      if (!guard.assignedSites.map(s => s.toString()).includes(siteId)) {
        res.status(400).json({ error: { message: 'Guard is not assigned to this site' } });
        return;
      }
    }

    // Check for overlap
    const overlap = await Shift.findOne({
      guardId,
      status: { $ne: 'cancelled' },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (overlap) {
      res.status(409).json({ error: { message: 'Shift overlaps with existing shift for this guard' } });
      return;
    }

    const shift = await Shift.create({
      companyId: user.companyId,
      siteId,
      guardId,
      startTime,
      endTime,
      notes,
    });

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'CREATE_SHIFT',
      resource: 'Shift',
      details: { shiftId: shift._id },
    });

    res.status(201).json({ shift });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to create shift' } });
  }
};

export const getShifts = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { start, end, siteId, guardId } = req.query;

    const query: any = { companyId: user.companyId };

    if (siteId) query.siteId = siteId;
    if (guardId) query.guardId = guardId;
    
    // Time bounding (e.g. for calendar views)
    if (start && end) {
      query.startTime = { $gte: new Date(start as string) };
      query.endTime = { $lte: new Date(end as string) };
    }

    const shifts = await Shift.find(query)
      .populate({ path: 'guardId', populate: { path: 'userId', select: 'firstName lastName' } })
      .populate('siteId', 'name')
      .sort({ startTime: 1 });

    res.json({ shifts });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch shifts' } });
  }
};

export const updateShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const updates = req.body;
    
    delete updates.companyId;

    const shift = await Shift.findOneAndUpdate(
      { _id: req.params.id, companyId: user.companyId },
      updates,
      { new: true }
    );

    if (!shift) {
      res.status(404).json({ error: { message: 'Shift not found' } });
      return;
    }

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'UPDATE_SHIFT',
      resource: 'Shift',
      details: { shiftId: shift._id },
    });

    res.json({ shift });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update shift' } });
  }
};

export const deleteShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const shift = await Shift.findOne({ _id: req.params.id, companyId: user.companyId });

    if (!shift) {
      res.status(404).json({ error: { message: 'Shift not found' } });
      return;
    }

    shift.status = 'cancelled';
    await shift.save();

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'CANCEL_SHIFT',
      resource: 'Shift',
      details: { shiftId: shift._id },
    });

    res.json({ message: 'Shift cancelled' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to cancel shift' } });
  }
};
