import { Request, Response } from 'express';
import { PatrolSession } from '../models/PatrolSession';
import { CheckpointScan } from '../models/CheckpointScan';
import { PatrolRoute } from '../models/PatrolRoute';
import mongoose from 'mongoose';

const calculateTrend = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { siteId, guardId, startDate, endDate } = req.query;

  const match: any = { companyId: new mongoose.Types.ObjectId(user.companyId) };
  if (siteId) match.siteId = new mongoose.Types.ObjectId(siteId as string);
  if (guardId) match.guardId = new mongoose.Types.ObjectId(guardId as string);

  const end = endDate ? new Date(endDate as string) : new Date();
  const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const periodDuration = end.getTime() - start.getTime();
  const previousStart = new Date(start.getTime() - periodDuration);
  const previousEnd = start;

  match.createdAt = { $gte: start, $lte: end };
  const prevMatch = { ...match, createdAt: { $gte: previousStart, $lt: previousEnd } };

  // 1. Calculate KPIs for Current Period
  const currentSessions = await PatrolSession.find(match).populate('routeId').lean();
  const prevSessions = await PatrolSession.find(prevMatch).populate('routeId').lean();

  const calcSessionKpis = (sessions: any[]) => {
    let total = sessions.length;
    let completed = 0;
    let failedMissed = 0;
    let totalDurationMs = 0;
    let completedWithDuration = 0;
    let totalExpectedCheckpoints = 0;

    sessions.forEach(s => {
      if (s.status === 'completed') {
        completed++;
        if (s.startTime && s.endTime) {
          totalDurationMs += (new Date(s.endTime).getTime() - new Date(s.startTime).getTime());
          completedWithDuration++;
        }
      } else if (['missed', 'cancelled'].includes(s.status)) {
        failedMissed++;
      }
      
      // Calculate expected checkpoints based on route
      if (s.routeId && s.routeId.checkpoints) {
        totalExpectedCheckpoints += s.routeId.checkpoints.length;
      }
    });

    const avgDurationMinutes = completedWithDuration > 0 ? Math.round((totalDurationMs / completedWithDuration) / 60000) : 0;

    return { total, completed, failedMissed, avgDurationMinutes, totalExpectedCheckpoints, sessionIds: sessions.map(s => s._id) };
  };

  const currKpi = calcSessionKpis(currentSessions);
  const prevKpi = calcSessionKpis(prevSessions);

  // 2. Checkpoint Compliance
  const currentScans = await CheckpointScan.find({ sessionId: { $in: currKpi.sessionIds }, status: 'valid' }).lean();
  const prevScans = await CheckpointScan.find({ sessionId: { $in: prevKpi.sessionIds }, status: 'valid' }).lean();

  const currCompliance = currKpi.totalExpectedCheckpoints > 0 ? Math.round((currentScans.length / currKpi.totalExpectedCheckpoints) * 100) : 0;
  const prevCompliance = prevKpi.totalExpectedCheckpoints > 0 ? Math.round((prevScans.length / prevKpi.totalExpectedCheckpoints) * 100) : 0;

  // 3. Patrol Activity Chart
  // Group by day for the chart
  const activityChart: any[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  const numDays = Math.ceil(periodDuration / dayMs);
  
  for (let i = 0; i < numDays; i++) {
    const dayStart = new Date(start.getTime() + i * dayMs);
    const dayEnd = new Date(dayStart.getTime() + dayMs);
    const label = dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const daySessions = currentSessions.filter(s => {
      const d = new Date(s.createdAt);
      return d >= dayStart && d < dayEnd;
    });

    activityChart.push({
      date: label,
      total: daySessions.length,
      completed: daySessions.filter(s => s.status === 'completed').length
    });
  }

  // 4. Top Guards
  const guardAgg = await PatrolSession.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$guardId',
        patrols: { $sum: 1 },
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
      $lookup: {
        from: 'users',
        localField: 'guard.userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: '$_id',
        name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
        patrols: 1,
        completionRate: {
          $cond: [
            { $gt: ['$patrols', 0] },
            { $round: [{ $multiply: [{ $divide: ['$completedPatrols', '$patrols'] }, 100] }, 0] },
            0
          ]
        }
      }
    },
    { $sort: { completionRate: -1, patrols: -1 } },
    { $limit: 5 }
  ]);

  // 5. Checkpoint Compliance Breakdown
  const checkpointAgg = await CheckpointScan.aggregate([
    { $match: { sessionId: { $in: currKpi.sessionIds } } },
    {
      $group: {
        _id: '$checkpointId',
        totalScans: { $sum: 1 },
        validScans: {
          $sum: { $cond: [{ $eq: ['$status', 'valid'] }, 1, 0] }
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
        name: { $ifNull: ['$checkpoint.name', 'Unknown Checkpoint'] },
        compliance: {
          $cond: [
            { $gt: ['$totalScans', 0] },
            { $round: [{ $multiply: [{ $divide: ['$validScans', '$totalScans'] }, 100] }, 0] },
            0
          ]
        }
      }
    },
    { $sort: { compliance: 1 } },
    { $limit: 5 }
  ]);

  res.json({
    kpis: {
      totalPatrols: { value: currKpi.total, trend: calculateTrend(currKpi.total, prevKpi.total) },
      completed: { value: currKpi.completed, trend: calculateTrend(currKpi.completed, prevKpi.completed) },
      failedMissed: { value: currKpi.failedMissed, trend: calculateTrend(currKpi.failedMissed, prevKpi.failedMissed) },
      avgDurationMinutes: { value: currKpi.avgDurationMinutes, trend: calculateTrend(currKpi.avgDurationMinutes, prevKpi.avgDurationMinutes) },
      checkpointCompliance: { value: currCompliance, trend: calculateTrend(currCompliance, prevCompliance) }
    },
    activityChart,
    checkpointCompliance: checkpointAgg,
    topGuards: guardAgg
  });
};
