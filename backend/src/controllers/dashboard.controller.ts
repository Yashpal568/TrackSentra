import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Shift } from '../models/Shift';
import { PatrolSession } from '../models/PatrolSession';
import { Incident } from '../models/Incident';
import { CheckpointScan } from '../models/CheckpointScan';
import { Site } from '../models/Site';

const buildDateFilter = (startDate?: string, endDate?: string) => {
  const filter: any = {};
  if (startDate) filter.$gte = new Date(startDate);
  if (endDate) filter.$lte = new Date(endDate);
  return Object.keys(filter).length > 0 ? filter : null;
};

const calculateTrend = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { siteId, startDate, endDate } = req.query;

    const companyId = new mongoose.Types.ObjectId(user.companyId);
    const match: any = { companyId };
    if (siteId) match.siteId = new mongoose.Types.ObjectId(siteId as string);

    const end = endDate ? new Date(endDate as string) : new Date();
    const start = startDate ? new Date(startDate as string) : new Date(new Date().setHours(0, 0, 0, 0)); // default today
    const periodDuration = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodDuration);
    const previousEnd = start;

    match.createdAt = { $gte: start, $lte: end };
    const prevMatch = { ...match, createdAt: { $gte: previousStart, $lt: previousEnd } };

    // 1. KPI Cards
    // Active Guards (currently in_progress shifts)
    const activeGuardFilter: any = { companyId, status: 'in_progress' };
    if (siteId) activeGuardFilter.siteId = match.siteId;
    const activeGuardsCount = await Shift.distinct('guardId', activeGuardFilter).then(ids => ids.length);
    const prevActiveGuardsCount = await Shift.distinct('guardId', { ...activeGuardFilter, createdAt: { $gte: previousStart, $lt: previousEnd } }).then(ids => ids.length);

    // Active Patrols
    const activePatrolFilter: any = { companyId, status: 'in_progress' };
    if (siteId) activePatrolFilter.siteId = match.siteId;
    const activePatrolsCount = await PatrolSession.countDocuments(activePatrolFilter);
    const prevActivePatrolsCount = await PatrolSession.countDocuments({ ...activePatrolFilter, createdAt: { $gte: previousStart, $lt: previousEnd } });

    // Completed Patrols
    const completedPatrolsCount = await PatrolSession.countDocuments({ ...match, status: 'completed' });
    const prevCompletedPatrolsCount = await PatrolSession.countDocuments({ ...prevMatch, status: 'completed' });

    // Open Incidents
    const openIncidentFilter: any = { companyId, status: { $in: ['Open', 'Acknowledged', 'Under Investigation'] } };
    if (siteId) openIncidentFilter.siteId = match.siteId;
    const openIncidentsCount = await Incident.countDocuments(openIncidentFilter);
    const prevOpenIncidentsCount = await Incident.countDocuments({ ...openIncidentFilter, createdAt: { $gte: previousStart, $lt: previousEnd } });

    // 2. Live Patrol Activity
    const livePatrolSessions = await PatrolSession.find(activePatrolFilter)
      .populate({
        path: 'guardId',
        select: 'employeeId userId',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .populate('siteId', 'name')
      .populate('routeId', 'name checkpoints')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const activeSessionIds = livePatrolSessions.map(s => s._id);
    const activeScans = await CheckpointScan.aggregate([
      { $match: { sessionId: { $in: activeSessionIds }, status: 'valid' } },
      { $group: { _id: '$sessionId', count: { $sum: 1 } } }
    ]);
    const activeScanMap = new Map(activeScans.map(s => [s._id.toString(), s.count]));

    const livePatrols = livePatrolSessions.map((s: any) => ({
      _id: s._id,
      guardName: s.guardId?.userId ? `${s.guardId.userId.firstName} ${s.guardId.userId.lastName}` : 'Unknown',
      siteName: s.siteId?.name || 'Unknown',
      routeName: s.routeId?.name || 'Unknown',
      checkpointsCompleted: activeScanMap.get(s._id.toString()) || 0,
      checkpointsTotal: s.routeId?.checkpoints?.length || 0,
      status: s.status,
      lastSeen: s.updatedAt || s.createdAt
    }));

    // 3. Site Status
    const allSites = await Site.find(siteId ? { _id: match.siteId } : { companyId }).select('name _id').lean();
    
    // Get active counts per site
    const activePatrolsPerSite = await PatrolSession.aggregate([
      { $match: { companyId, status: 'in_progress' } },
      { $group: { _id: '$siteId', count: { $sum: 1 } } }
    ]);
    const patrolsMap = new Map(activePatrolsPerSite.map(s => [s._id.toString(), s.count]));

    const activeGuardsPerSite = await Shift.aggregate([
      { $match: { companyId, status: 'in_progress' } },
      { $group: { _id: '$siteId', uniqueGuards: { $addToSet: '$guardId' } } }
    ]);
    const guardsMap = new Map(activeGuardsPerSite.map(s => [s._id.toString(), s.uniqueGuards.length]));

    const siteIncidents = await Incident.aggregate([
      { $match: { companyId, status: { $in: ['Open', 'Acknowledged', 'Under Investigation'] } } },
      { $group: { _id: '$siteId', maxSeverity: { $max: { $cond: [{ $eq: ['$severity', 'Critical'] }, 3, { $cond: [{ $eq: ['$severity', 'High'] }, 2, { $cond: [{ $eq: ['$severity', 'Medium'] }, 1, 0] }] }] } } } }
    ]);
    const incidentMap = new Map(siteIncidents.map(s => [s._id.toString(), s.maxSeverity]));

    const siteStatus = allSites.map(s => {
      const pCount = patrolsMap.get(s._id.toString()) || 0;
      const gCount = guardsMap.get(s._id.toString()) || 0;
      const sev = incidentMap.get(s._id.toString()) || 0;
      let status = 'Normal';
      if (sev === 3) status = 'Alert';
      else if (sev === 2) status = 'Attention';

      return {
        _id: s._id,
        siteName: s.name,
        activeGuards: gCount,
        activePatrols: pCount,
        status
      };
    });

    // 4. Patrol Completion Rate Chart
    const currentSessions = await PatrolSession.find(match).select('createdAt status').lean();
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

    // 5. Checkpoint Compliance
    const fullCurrentSessions = await PatrolSession.find(match).populate('routeId').lean();
    const sessionIds = fullCurrentSessions.map(s => s._id);
    let totalExpectedCheckpoints = 0;
    fullCurrentSessions.forEach(s => {
      const route: any = s.routeId;
      if (route && route.checkpoints) {
        totalExpectedCheckpoints += route.checkpoints.length;
      }
    });

    const currentScans = await CheckpointScan.find({ sessionId: { $in: sessionIds }, status: 'valid' }).lean();
    const overallCompliance = totalExpectedCheckpoints > 0 ? Math.round((currentScans.length / totalExpectedCheckpoints) * 100) : 0;

    const prevFullSessions = await PatrolSession.find(prevMatch).populate('routeId').lean();
    const prevSessionIds = prevFullSessions.map(s => s._id);
    let prevExpected = 0;
    prevFullSessions.forEach(s => {
      const route: any = s.routeId;
      if (route && route.checkpoints) {
        prevExpected += route.checkpoints.length;
      }
    });
    const prevScans = await CheckpointScan.find({ sessionId: { $in: prevSessionIds }, status: 'valid' }).lean();
    const prevCompliance = prevExpected > 0 ? Math.round((prevScans.length / prevExpected) * 100) : 0;

    const checkpointAgg = await CheckpointScan.aggregate([
      { $match: { sessionId: { $in: sessionIds } } },
      { $group: { _id: '$checkpointId', totalScans: { $sum: 1 }, validScans: { $sum: { $cond: [{ $eq: ['$status', 'valid'] }, 1, 0] } } } },
      { $lookup: { from: 'checkpoints', localField: '_id', foreignField: '_id', as: 'checkpoint' } },
      { $unwind: { path: '$checkpoint', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$checkpoint.name', 'Unknown'] }, compliance: { $cond: [{ $gt: ['$totalScans', 0] }, { $round: [{ $multiply: [{ $divide: ['$validScans', '$totalScans'] }, 100] }, 0] }, 0] } } },
      { $sort: { compliance: 1 } },
      { $limit: 5 }
    ]);

    // 6. Recent Incidents
    const recentIncidents = await Incident.find(match)
      .populate('siteId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .then(docs => docs.map((d: any) => ({
        _id: d._id,
        title: d.title,
        severity: d.severity,
        siteName: d.siteId?.name || 'Unknown',
        createdAt: d.createdAt
      })));

    res.json({
      kpis: {
        activeGuards: { value: activeGuardsCount, trend: calculateTrend(activeGuardsCount, prevActiveGuardsCount) },
        activePatrols: { value: activePatrolsCount, trend: calculateTrend(activePatrolsCount, prevActivePatrolsCount) },
        completedPatrols: { value: completedPatrolsCount, trend: calculateTrend(completedPatrolsCount, prevCompletedPatrolsCount) },
        openIncidents: { value: openIncidentsCount, trend: calculateTrend(openIncidentsCount, prevOpenIncidentsCount) }
      },
      livePatrols,
      siteStatus,
      activityChart,
      compliance: {
        overall: overallCompliance,
        trend: calculateTrend(overallCompliance, prevCompliance),
        checkpoints: checkpointAgg
      },
      recentIncidents
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ error: { message: 'Failed to load dashboard data' } });
  }
};
