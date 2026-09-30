import { Request, Response } from 'express';
import { PatrolSession } from '../models/PatrolSession';
import { CheckpointScan } from '../models/CheckpointScan';

const buildDateFilter = (startDate?: string, endDate?: string) => {
  const filter: any = {};
  if (startDate) filter.$gte = new Date(startDate);
  if (endDate) filter.$lte = new Date(endDate);
  return Object.keys(filter).length > 0 ? filter : null;
};

export const getPatrolHistory = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { siteId, guardId, status, startDate, endDate, page = 1, limit = 20 } = req.query;

  const filter: any = { companyId: user.companyId };
  if (siteId) filter.siteId = siteId;
  if (guardId) filter.guardId = guardId;
  if (status) filter.status = status;

  const dateFilter = buildDateFilter(startDate as string, endDate as string);
  if (dateFilter) {
    filter.createdAt = dateFilter;
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const [total, sessions] = await Promise.all([
    PatrolSession.countDocuments(filter),
    PatrolSession.find(filter)
      .populate('siteId', 'name')
      .populate('guardId', 'employeeId')
      .populate('routeId', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
  ]);

  res.json({
    data: sessions,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  });
};

export const getOperationalSummary = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { siteId, startDate, endDate } = req.query;

  const match: any = { companyId: user.companyId };
  if (siteId) match.siteId = siteId;

  const dateFilter = buildDateFilter(startDate as string, endDate as string);
  if (dateFilter) {
    match.createdAt = dateFilter;
  }

  // Aggregate patrol sessions
  const sessionStats = await PatrolSession.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      }
    }
  ]);

  const summary = {
    total: 0,
    completed: 0,
    in_progress: 0,
    incomplete: 0, // Not an official status right now but logic can determine it later
  };

  sessionStats.forEach(stat => {
    summary.total += stat.count;
    if (stat._id === 'completed') summary.completed += stat.count;
    if (stat._id === 'in_progress') summary.in_progress += stat.count;
  });

  res.json(summary);
};

export const getGuardReports = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { startDate, endDate } = req.query;

  const match: any = { companyId: user.companyId };
  const dateFilter = buildDateFilter(startDate as string, endDate as string);
  if (dateFilter) {
    match.createdAt = dateFilter;
  }

  const guardStats = await PatrolSession.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$guardId',
        totalPatrols: { $sum: 1 },
        completedPatrols: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: 'guards',
        localField: '_id',
        foreignField: '_id',
        as: 'guard'
      }
    },
    { $unwind: '$guard' },
    {
      $project: {
        _id: 1,
        employeeId: '$guard.employeeId',
        totalPatrols: 1,
        completedPatrols: 1
      }
    }
  ]);

  res.json(guardStats);
};

export const getCheckpointAnalytics = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { siteId, startDate, endDate } = req.query;

  const match: any = { companyId: user.companyId };
  if (siteId) match.siteId = siteId;

  const dateFilter = buildDateFilter(startDate as string, endDate as string);
  if (dateFilter) {
    match.scannedAt = dateFilter;
  }

  const checkpointStats = await CheckpointScan.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$checkpointId',
        totalScans: { $sum: 1 },
        validScans: {
          $sum: { $cond: [{ $eq: ['$status', 'valid'] }, 1, 0] }
        },
        rejectedScans: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: 'checkpoints',
        localField: '_id',
        foreignField: '_id',
        as: 'checkpoint'
      }
    },
    { $unwind: { path: '$checkpoint', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        name: { $ifNull: ['$checkpoint.name', 'Unknown Checkpoint'] },
        totalScans: 1,
        validScans: 1,
        rejectedScans: 1
      }
    }
  ]);

  res.json(checkpointStats);
};

export const exportCsv = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { siteId, guardId, status, startDate, endDate } = req.query;

  const filter: any = { companyId: user.companyId };
  if (siteId) filter.siteId = siteId;
  if (guardId) filter.guardId = guardId;
  if (status) filter.status = status;

  const dateFilter = buildDateFilter(startDate as string, endDate as string);
  if (dateFilter) {
    filter.createdAt = dateFilter;
  }

  const sessions = await PatrolSession.find(filter)
    .populate('siteId', 'name')
    .populate('guardId', 'employeeId')
    .populate('routeId', 'name')
    .sort({ createdAt: -1 })
    .lean(); // Use lean for speed

  // Generate CSV manually to avoid dependencies and prevent formula injection
  const headers = ['Session ID', 'Site', 'Guard ID', 'Route', 'Status', 'Start Time', 'End Time'];
  
  const escapeCsv = (str: string) => {
    if (!str) return '""';
    let clean = String(str).replace(/"/g, '""');
    // Basic protection against formula injection
    if (['=', '+', '-', '@'].includes(clean.charAt(0))) {
      clean = "'" + clean;
    }
    return `"${clean}"`;
  };

  const rows = sessions.map((s: any) => {
    return [
      escapeCsv(s._id.toString()),
      escapeCsv(s.siteId?.name),
      escapeCsv(s.guardId?.employeeId),
      escapeCsv(s.routeId?.name),
      escapeCsv(s.status),
      escapeCsv(s.startTime ? new Date(s.startTime).toISOString() : ''),
      escapeCsv(s.endTime ? new Date(s.endTime).toISOString() : ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="patrol_history.csv"');
  res.send(csvContent);
};
