import { z } from 'zod';

export const createCheckpointSchema = z.object({
  body: z.object({
    siteId: z.string(),
    name: z.string().min(2),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    radius: z.number().min(5).optional(),
    notes: z.string().optional(),
  }),
});

export const updateCheckpointSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    radius: z.number().min(5).optional(),
    status: z.enum(['active', 'inactive', 'archived']).optional(),
    notes: z.string().optional(),
  }),
});
