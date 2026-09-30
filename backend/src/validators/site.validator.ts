import { z } from 'zod';

export const createSiteSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    address: z.string().optional(),
    timezone: z.string().optional(),
  }),
});

export const updateSiteSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().optional(),
    timezone: z.string().optional(),
    status: z.enum(['active', 'inactive', 'archived']).optional(),
    settings: z.record(z.string(), z.any()).optional(),
  }),
});
