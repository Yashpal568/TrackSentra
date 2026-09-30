import { z } from 'zod';

export const createPatrolRouteSchema = z.object({
  body: z.object({
    siteId: z.string().length(24, 'Invalid siteId'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    checkpoints: z.array(z.string().length(24, 'Invalid checkpointId')).min(1, 'At least one checkpoint is required'),
    expectedDurationMinutes: z.number().int().positive('Expected duration must be positive'),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const updatePatrolRouteSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    checkpoints: z.array(z.string().length(24, 'Invalid checkpointId')).min(1, 'At least one checkpoint is required').optional(),
    expectedDurationMinutes: z.number().int().positive('Expected duration must be positive').optional(),
    status: z.enum(['active', 'inactive', 'archived']).optional(),
  }),
});

export const startPatrolSessionSchema = z.object({
  body: z.object({
    siteId: z.string().length(24, 'Invalid siteId'),
    routeId: z.string().length(24, 'Invalid routeId'),
    shiftId: z.string().length(24, 'Invalid shiftId').optional(),
  }),
});

export const scanCheckpointSchema = z.object({
  body: z.object({
    qrPayload: z.string().min(1, 'QR payload is required'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    accuracy: z.number().positive().optional(),
  }),
});
