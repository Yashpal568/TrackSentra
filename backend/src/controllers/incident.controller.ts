import { Request, Response } from 'express';
import { Incident } from '../models/Incident';
import { UserRole } from '../models/User';
import { patrolEventEmitter } from './patrol.controller';
import { NotificationService } from '../services/notification.service';

export const createIncident = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { siteId, title, description, category, severity, patrolSessionId, checkpointId } = req.body;

    const incident = await Incident.create({
      companyId: user.companyId,
      siteId,
      reporterId: user._id,
      title,
      description,
      category,
      severity,
      patrolSessionId,
      checkpointId,
    });

    patrolEventEmitter.emit('patrolUpdate', {
      companyId: user.companyId,
      type: 'INCIDENT_REPORTED',
      incident
    });

    NotificationService.createNotification({
      companyId: user.companyId,
      type: 'INCIDENT_REPORTED',
      title: severity === 'Critical' ? 'Critical Incident Reported' : 'New Incident Reported',
      message: `${title}`,
      severity: severity === 'Critical' ? 'CRITICAL' : (severity === 'High' ? 'WARNING' : 'INFO'),
      entityType: 'Incident',
      entityId: incident._id,
      siteId
    });

    res.status(201).json(incident);
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
};

export const getIncidents = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { siteId, status, severity, category, page = 1, limit = 20 } = req.query;

    const filter: any = { companyId: user.companyId };
    
    // If user is a guard, only show incidents they reported
    if (user.role === UserRole.GUARD) {
      filter.reporterId = user._id;
    }

    if (siteId) filter.siteId = siteId;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (category) filter.category = category;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [total, incidents] = await Promise.all([
      Incident.countDocuments(filter),
      Incident.find(filter)
        .populate('siteId', 'name')
        .populate('reporterId', 'firstName lastName employeeId email')
        .populate('assigneeId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
    ]);

    res.json({
      data: incidents,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

export const getIncidentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const incident = await Incident.findOne({ _id: id, companyId: user.companyId })
      .populate('siteId', 'name')
      .populate('reporterId', 'firstName lastName employeeId email')
      .populate('assigneeId', 'firstName lastName')
      .populate('investigationNotes.createdBy', 'firstName lastName role')
      .populate('patrolSessionId')
      .populate('checkpointId');

    if (!incident) {
      res.status(404).json({ error: { message: 'Incident not found' } });
      return;
    }

    // Guards can only view their own incidents
    if (user.role === UserRole.GUARD && incident.reporterId._id.toString() !== user._id.toString()) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }

    res.json(incident);
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

export const updateIncident = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { status, assigneeId, resolutionDetails } = req.body;

    const incident = await Incident.findOne({ _id: id, companyId: user.companyId });
    if (!incident) {
      res.status(404).json({ error: { message: 'Incident not found' } });
      return;
    }

    if (status) incident.status = status;
    if (assigneeId) incident.assigneeId = assigneeId;
    if (resolutionDetails) incident.resolutionDetails = resolutionDetails;

    // Validation for resolving
    if ((status === 'Resolved' || status === 'Closed') && !incident.resolutionDetails) {
      res.status(400).json({ error: { message: 'Resolution details are required to resolve or close an incident' } });
      return;
    }

    await incident.save();
    res.json(incident);
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
};

export const addInvestigationNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      res.status(400).json({ error: { message: 'Note is required' } });
      return;
    }

    const incident = await Incident.findOne({ _id: id, companyId: user.companyId });
    if (!incident) {
      res.status(404).json({ error: { message: 'Incident not found' } });
      return;
    }

    incident.investigationNotes.push({
      note,
      createdBy: user._id,
      createdAt: new Date(),
    });

    await incident.save();

    // Populate the newly added note's creator
    await incident.populate('investigationNotes.createdBy', 'firstName lastName role');

    res.status(201).json(incident);
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
};
