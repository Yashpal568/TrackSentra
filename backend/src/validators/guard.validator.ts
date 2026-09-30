import { z } from 'zod';

export const createGuardSchema = z.object({
  body: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    employeeId: z.string().optional(),
    phone: z.string().optional(),
    assignedSites: z.array(z.string()).optional(),
  }),
});

export const updateGuardSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    employeeId: z.string().optional(),
    phone: z.string().optional(),
    assignedSites: z.array(z.string()).optional(),
    status: z.enum(['active', 'inactive', 'archived']).optional(),
  }),
});
