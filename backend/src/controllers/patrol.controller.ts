import { Request, Response } from 'express';
import { PatrolRoute } from '../models/PatrolRoute';
import { PatrolSession } from '../models/PatrolSession';
import { CheckpointScan } from '../models/CheckpointScan';
import { Checkpoint } from '../models/Checkpoint';
import { Guard } from '../models/Guard';
import { AuditLog } from '../models/AuditLog';
import { Site } from '../models/Site';
import { EventEmitter } from 'events';

export const patrolEventEmitter = new EventEmitter();

export const livePatrolEvents = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  if (user.role === 'GUARD') {
    res.status(403).json({ error: { message: 'Forbidden' } });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`);

  const onUpdate = (eventData: any) => {
    if (eventData.companyId.toString() === user.companyId.toString()) {
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    }
  };

  patrolEventEmitter.on('patrolUpdate', onUpdate);

  req.on('close', () => {
    patrolEventEmitter.removeListener('patrolUpdate', onUpdate);
  });
};

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const toRad = (val: number) => (val * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const getPatrolRoutes = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const filter: any = { companyId: user.companyId, status: { $ne: 'archived' } };
  
  if (req.query.siteId) {
    filter.siteId = req.query.siteId;
  }

  const routes = await PatrolRoute.find(filter).populate('siteId', 'name').populate('checkpoints', 'name location');
  res.json(routes);
};

export const createPatrolRoute = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { siteId, name, checkpoints, expectedDurationMinutes, status } = req.body;

  // Validate site ownership
  const site = await Site.findOne({ _id: siteId, companyId: user.companyId });
  if (!site) {
    res.status(404).json({ error: { message: 'Site not found or unauthorized' } });
    return;
  }

  // Validate all checkpoints belong to the same site and company
  const validCheckpoints = await Checkpoint.find({
    _id: { $in: checkpoints },
    companyId: user.companyId,
    siteId,
  });

  if (validCheckpoints.length !== checkpoints.length) {
    res.status(400).json({ error: { message: 'One or more checkpoints are invalid or do not belong to this site' } });
    return;
  }

  const route = await PatrolRoute.create({
    companyId: user.companyId,
    siteId,
    name,
    checkpoints,
    expectedDurationMinutes,
    status: status || 'active',
  });

  await AuditLog.create({
    companyId: user.companyId,
    userId: user._id,
    action: 'CREATE',
    resource: 'PatrolRoute',
    details: { resourceId: route._id },
    ipAddress: req.ip || req.socket.remoteAddress,
  });

  res.status(201).json(route);
};

export const updatePatrolRoute = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;

  const route = await PatrolRoute.findOne({ _id: id, companyId: user.companyId });
  if (!route) {
    res.status(404).json({ error: { message: 'Patrol route not found' } });
    return;
  }

  const { name, checkpoints, expectedDurationMinutes, status } = req.body;

  if (checkpoints) {
    // Validate all checkpoints belong to the same site and company
    const validCheckpoints = await Checkpoint.find({
      _id: { $in: checkpoints },
      companyId: user.companyId,
      siteId: route.siteId,
    });

    if (validCheckpoints.length !== checkpoints.length) {
      res.status(400).json({ error: { message: 'One or more checkpoints are invalid or do not belong to this site' } });
      return;
    }
    route.checkpoints = checkpoints;
  }

  if (name) route.name = name;
  if (expectedDurationMinutes) route.expectedDurationMinutes = expectedDurationMinutes;
  if (status) route.status = status;

  await route.save();

  await AuditLog.create({
    companyId: user.companyId,
    userId: user._id,
    action: 'UPDATE',
    resource: 'PatrolRoute',
    details: { resourceId: route._id },
    ipAddress: req.ip || req.socket.remoteAddress,
  });

  res.json(route);
};

export const getPatrolSessions = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const filter: any = { companyId: user.companyId };
  
  if (req.query.siteId) filter.siteId = req.query.siteId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.guardId) filter.guardId = req.query.guardId;

  // If guard, only see their own
  if (user.role === 'GUARD') {
    const guard = await Guard.findOne({ userId: user._id });
    if (!guard) {
      res.status(403).json({ error: { message: 'Guard profile not found' } });
      return;
    }
    filter.guardId = guard._id;
  }

  const sessions = await PatrolSession.find(filter)
    .populate('siteId', 'name')
    .populate('routeId', 'name checkpoints')
    .populate('guardId', 'employeeId')
    .sort({ createdAt: -1 });
    
  res.json(sessions);
};

export const startPatrolSession = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { siteId, routeId, shiftId } = req.body;

  // Ensure guard exists
  const guard = await Guard.findOne({ userId: user._id, companyId: user.companyId, status: 'active' });
  if (!guard) {
    res.status(403).json({ error: { message: 'Active guard profile required to start patrol' } });
    return;
  }

  // Validate route
  const route = await PatrolRoute.findOne({ _id: routeId, siteId, companyId: user.companyId, status: 'active' });
  if (!route) {
    res.status(404).json({ error: { message: 'Active patrol route not found for this site' } });
    return;
  }

  // Check if there is already an active session for this guard
  const existingSession = await PatrolSession.findOne({
    guardId: guard._id,
    status: { $in: ['pending', 'in_progress'] }
  });

  if (existingSession) {
    res.status(409).json({ error: { message: 'Guard already has an active patrol session', sessionId: existingSession._id } });
    return;
  }

  const session = await PatrolSession.create({
    companyId: user.companyId,
    siteId,
    routeId,
    guardId: guard._id,
    shiftId,
    status: 'in_progress',
    startTime: new Date(),
  });

  await AuditLog.create({
    companyId: user.companyId,
    userId: user._id,
    action: 'CREATE',
    resource: 'PatrolSession',
    details: { resourceId: session._id },
    ipAddress: req.ip || req.socket.remoteAddress,
  });

  res.status(201).json(session);

  patrolEventEmitter.emit('patrolUpdate', {
    companyId: session.companyId,
    type: 'SESSION_STARTED',
    session: session
  });
};

export const scanCheckpoint = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params; // PatrolSession ID
  const { qrPayload, latitude, longitude, accuracy, isMockLocation } = req.body;

  const session = await PatrolSession.findOne({ _id: id, companyId: user.companyId }).populate('routeId');
  if (!session) {
    res.status(404).json({ error: { message: 'Patrol session not found' } });
    return;
  }

  // Ensure it's the guard who started it and they are active
  const guard = await Guard.findOne({ userId: user._id, companyId: user.companyId });
  if (!guard || session.guardId.toString() !== guard._id.toString()) {
    res.status(403).json({ error: { message: 'Not authorized to scan for this session' } });
    return;
  }
  
  if (guard.status !== 'active') {
    res.status(403).json({ error: { message: 'Guard account is not active' } });
    return;
  }

  if (session.status !== 'in_progress') {
    res.status(400).json({ error: { message: 'Patrol session is not in progress' } });
    return;
  }

  // Validate QR payload maps to a checkpoint
  const checkpoint = await Checkpoint.findOne({ qrPayload, companyId: user.companyId });
  if (!checkpoint || checkpoint.status !== 'active' || checkpoint.installationStatus !== 'active') {
    // Record rejected scan
    await CheckpointScan.create({
      companyId: user.companyId,
      siteId: session.siteId,
      sessionId: session._id,
      guardId: guard._id,
      status: 'rejected',
      failureReason: 'Invalid QR payload',
    });
    res.status(400).json({ error: { message: 'Invalid QR code' } });
    
    patrolEventEmitter.emit('patrolUpdate', {
      companyId: user.companyId,
      type: 'SCAN_RECORDED',
      scan: { status: 'rejected', failureReason: 'Invalid QR payload', sessionId: session._id, guardId: guard._id }
    });
    return;
  }

  // Check if checkpoint belongs to the site
  if (checkpoint.siteId.toString() !== session.siteId.toString()) {
    await CheckpointScan.create({
      companyId: user.companyId,
      siteId: session.siteId,
      sessionId: session._id,
      checkpointId: checkpoint._id,
      guardId: guard._id,
      status: 'rejected',
      failureReason: 'Checkpoint belongs to a different site',
    });
    res.status(400).json({ error: { message: 'Checkpoint belongs to a different site' } });
    return;
  }

  // Find previous scans to check for duplicates and sequence
  const pastScans = await CheckpointScan.find({ sessionId: session._id, status: { $in: ['valid', 'out_of_sequence'] } }).sort({ scannedAt: 1 });
  const scannedCheckpointIds = pastScans.map(s => s.checkpointId.toString());

  if (scannedCheckpointIds.includes(checkpoint._id.toString())) {
    await CheckpointScan.create({
      companyId: user.companyId,
      siteId: session.siteId,
      sessionId: session._id,
      checkpointId: checkpoint._id,
      guardId: guard._id,
      status: 'duplicate',
      failureReason: 'Checkpoint already scanned in this session',
    });
    res.status(409).json({ error: { message: 'Checkpoint already scanned' } });
    return;
  }

  // GPS Validation
  let distanceToCheckpoint: number | undefined;
  let locationVerified = false;
  let riskSignals: string[] = [];

  if (isMockLocation) {
    riskSignals.push('MOCK_LOCATION_DETECTED');
  }

  // Check impossible travel times
  if (pastScans.length > 0 && latitude && longitude) {
    const lastScan = pastScans[pastScans.length - 1];
    if (lastScan.latitude && lastScan.longitude) {
      const distToLast = getDistanceInMeters(latitude, longitude, lastScan.latitude, lastScan.longitude);
      const timeDiffSec = (Date.now() - new Date(lastScan.scannedAt).getTime()) / 1000;
      if (timeDiffSec > 0) {
        const speedMpS = distToLast / timeDiffSec;
        if (speedMpS > 30) { // > 108 km/h is highly suspicious for a walking guard
          riskSignals.push('IMPOSSIBLE_TRAVEL_SPEED');
        }
      }
    }
  }

  if (checkpoint.latitude !== undefined && checkpoint.longitude !== undefined) {
    if (latitude === undefined || longitude === undefined) {
      await CheckpointScan.create({
        companyId: user.companyId,
        siteId: session.siteId,
        sessionId: session._id,
        checkpointId: checkpoint._id,
        guardId: guard._id,
        status: 'rejected',
        failureReason: 'GPS location required for this checkpoint',
        latitude,
        longitude,
        accuracy,
        locationVerified: false,
      });
      res.status(400).json({ error: { message: 'GPS location required' } });
      return;
    }

    const maxAccuracy = checkpoint.gpsAccuracyThreshold || 20;
    if (accuracy && accuracy > maxAccuracy) {
      await CheckpointScan.create({
        companyId: user.companyId,
        siteId: session.siteId,
        sessionId: session._id,
        checkpointId: checkpoint._id,
        guardId: guard._id,
        status: 'rejected',
        failureReason: `GPS accuracy (${Math.round(accuracy)}m) is too low. Required: ${maxAccuracy}m`,
        latitude,
        longitude,
        accuracy,
        locationVerified: false,
      });
      res.status(400).json({ error: { message: `GPS accuracy too low. Please try again.` } });
      return;
    }

    distanceToCheckpoint = getDistanceInMeters(latitude, longitude, checkpoint.latitude, checkpoint.longitude);
    const radius = checkpoint.radius || 50;

    if (distanceToCheckpoint > radius) {
      await CheckpointScan.create({
        companyId: user.companyId,
        siteId: session.siteId,
        sessionId: session._id,
        checkpointId: checkpoint._id,
        guardId: guard._id,
        status: 'rejected',
        failureReason: 'Out of checkpoint radius',
        latitude,
        longitude,
        accuracy,
        distanceToCheckpoint,
        locationVerified: false,
      });
      res.status(400).json({ error: { message: `Out of range. Distance: ${Math.round(distanceToCheckpoint)}m, Required: ${radius}m` } });
      return;
    }
    locationVerified = true;
  }

  // Check sequence
  const route = session.routeId as any; // populated
  const routeCheckpoints: string[] = route.checkpoints.map((c: any) => c.toString());
  
  if (!routeCheckpoints.includes(checkpoint._id.toString())) {
    await CheckpointScan.create({
      companyId: user.companyId,
      siteId: session.siteId,
      sessionId: session._id,
      checkpointId: checkpoint._id,
      guardId: guard._id,
      status: 'rejected',
      failureReason: 'Checkpoint is not part of this patrol route',
      latitude,
      longitude,
      accuracy,
      distanceToCheckpoint,
      locationVerified,
    });
    res.status(400).json({ error: { message: 'Checkpoint not part of the route' } });
    return;
  }

  const expectedNextCheckpointId = routeCheckpoints[scannedCheckpointIds.length];
  let scanStatus: 'valid' | 'out_of_sequence' = 'valid';

  if (expectedNextCheckpointId !== checkpoint._id.toString()) {
    scanStatus = 'out_of_sequence';
  }

  const scan = await CheckpointScan.create({
    companyId: user.companyId,
    siteId: session.siteId,
    sessionId: session._id,
    checkpointId: checkpoint._id,
    guardId: guard._id,
    status: scanStatus,
    latitude,
    longitude,
    accuracy,
    distanceToCheckpoint,
    locationVerified,
    riskSignals,
  });

  // Automatically complete session if this was the last checkpoint (regardless of order, if all are scanned)
  const newlyScannedCount = scannedCheckpointIds.length + 1;
  if (newlyScannedCount === routeCheckpoints.length) {
    session.status = 'completed';
    session.endTime = new Date();
    await session.save();
  }

  res.status(201).json({ scan, sessionStatus: session.status });

  patrolEventEmitter.emit('patrolUpdate', {
    companyId: user.companyId,
    type: 'SCAN_RECORDED',
    scan: scan,
    sessionStatus: session.status
  });
  
  if (session.status === 'completed') {
    patrolEventEmitter.emit('patrolUpdate', {
      companyId: user.companyId,
      type: 'SESSION_COMPLETED',
      session: session
    });
  }
};

export const completePatrolSession = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;

  const session = await PatrolSession.findOne({ _id: id, companyId: user.companyId });
  if (!session) {
    res.status(404).json({ error: { message: 'Patrol session not found' } });
    return;
  }

  const guard = await Guard.findOne({ userId: user._id, companyId: user.companyId });
  if (user.role === 'GUARD' && (!guard || session.guardId.toString() !== guard._id.toString())) {
    res.status(403).json({ error: { message: 'Not authorized to complete this session' } });
    return;
  }

  if (session.status !== 'in_progress') {
    res.status(400).json({ error: { message: `Cannot complete session in ${session.status} state` } });
    return;
  }

  session.status = 'completed';
  session.endTime = new Date();
  await session.save();

  await AuditLog.create({
    companyId: user.companyId,
    userId: user._id,
    action: 'UPDATE',
    resource: 'PatrolSession',
    details: { resourceId: session._id },
    ipAddress: req.ip || req.socket.remoteAddress,
  });

  res.json(session);

  patrolEventEmitter.emit('patrolUpdate', {
    companyId: user.companyId,
    type: 'SESSION_COMPLETED',
    session: session
  });
};

export const getSessionScans = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;

  const session = await PatrolSession.findOne({ _id: id, companyId: user.companyId });
  if (!session) {
    res.status(404).json({ error: { message: 'Patrol session not found' } });
    return;
  }

  const scans = await CheckpointScan.find({ sessionId: session._id })
    .populate('checkpointId', 'name location')
    .sort({ scannedAt: 1 });

  res.json(scans);
};
