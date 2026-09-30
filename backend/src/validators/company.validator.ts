import { z } from 'zod';

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    timezone: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    status: z.enum(['active', 'suspended', 'archived']).optional(),
    timezone: z.string().optional(),
    address: z.string().optional(),
  }),
});
