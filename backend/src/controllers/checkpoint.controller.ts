import { Request, Response } from 'express';
import { Checkpoint } from '../models/Checkpoint';
import { Site } from '../models/Site';
import { AuditLog } from '../models/AuditLog';
import crypto from 'crypto';

const generateQrPayload = () => crypto.randomUUID();

export const createCheckpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { siteId, name, latitude, longitude, radius, gpsAccuracyThreshold, description, installationInstructions, notes } = req.body;

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
      gpsAccuracyThreshold,
      description,
      installationInstructions,
      notes,
      installationStatus: 'pending'
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

export const verifyCheckpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const checkpoint = await Checkpoint.findOne({ _id: req.params.id, companyId: user.companyId });

    if (!checkpoint) {
      res.status(404).json({ error: { message: 'Checkpoint not found' } });
      return;
    }

    if (checkpoint.installationStatus === 'active') {
      res.status(400).json({ error: { message: 'Checkpoint is already active' } });
      return;
    }

    checkpoint.installationStatus = 'active';
    checkpoint.verifiedBy = user._id;
    checkpoint.verifiedAt = new Date();
    await checkpoint.save();

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'VERIFY_CHECKPOINT',
      resource: 'Checkpoint',
      details: { checkpointId: checkpoint._id },
    });

    res.json({ checkpoint, message: 'Checkpoint verified and activated' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to verify checkpoint' } });
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

export const lookupCheckpointByToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { token } = req.params;

    const checkpoint = await Checkpoint.findOne({ qrPayload: token, companyId: user.companyId });
    if (!checkpoint || checkpoint.status === 'archived') {
      res.status(404).json({ error: { message: 'Checkpoint not found or invalid QR token' } });
      return;
    }

    res.json({ 
      checkpoint: { 
        _id: checkpoint._id, 
        name: checkpoint.name, 
        siteId: checkpoint.siteId, 
        latitude: checkpoint.latitude,
        longitude: checkpoint.longitude,
        radius: checkpoint.radius,
        gpsAccuracyThreshold: checkpoint.gpsAccuracyThreshold,
        notes: checkpoint.notes 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to lookup checkpoint' } });
  }
};
