import { Request, Response } from 'express';
import { Checkpoint } from '../models/Checkpoint';
import { Site } from '../models/Site';
import { AuditLog } from '../models/AuditLog';
import crypto from 'crypto';

const generateQrPayload = () => crypto.randomUUID();

export const createCheckpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { siteId, name, latitude, longitude, radius, notes } = req.body;

    const site = await Site.findOne({ _id: siteId, companyId: user.companyId });
    if (!site || site.status !== 'active') {
      res.status(400).json({ error: { message: 'Invalid or inactive site' } });
      return;
    }

    const qrPayload = generateQrPayload();

    const checkpoint = await Checkpoint.create({
      companyId: user.companyId,
      siteId,
      name,
      qrPayload,
      latitude,
      longitude,
      radius,
      notes,
    });

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'CREATE_CHECKPOINT',
      resource: 'Checkpoint',
      details: { checkpointId: checkpoint._id, siteId },
    });

    res.status(201).json({ checkpoint });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to create checkpoint' } });
  }
};

export const getCheckpoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { siteId } = req.query;

    const query: any = { companyId: user.companyId, status: { $ne: 'archived' } };
    if (siteId) query.siteId = siteId;

    const checkpoints = await Checkpoint.find(query).sort({ name: 1 });

    res.json({ checkpoints });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch checkpoints' } });
  }
};

export const updateCheckpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const updates = req.body;
    
    delete updates.companyId;
    delete updates.siteId;
    delete updates.qrPayload; // Cannot update QR directly via PUT

    const checkpoint = await Checkpoint.findOneAndUpdate(
      { _id: req.params.id, companyId: user.companyId },
      updates,
      { new: true }
    );

    if (!checkpoint) {
      res.status(404).json({ error: { message: 'Checkpoint not found' } });
      return;
    }

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'UPDATE_CHECKPOINT',
      resource: 'Checkpoint',
      details: { checkpointId: checkpoint._id },
    });

    res.json({ checkpoint });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update checkpoint' } });
  }
};

export const regenerateQrCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const checkpoint = await Checkpoint.findOne({ _id: req.params.id, companyId: user.companyId });

    if (!checkpoint) {
      res.status(404).json({ error: { message: 'Checkpoint not found' } });
      return;
    }

    const newQrPayload = generateQrPayload();
    checkpoint.qrPayload = newQrPayload;
    await checkpoint.save();

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'REGENERATE_CHECKPOINT_QR',
      resource: 'Checkpoint',
      details: { checkpointId: checkpoint._id },
    });

    res.json({ checkpoint, message: 'QR Code regenerated successfully. The old QR code is now invalid.' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to regenerate QR code' } });
  }
};
