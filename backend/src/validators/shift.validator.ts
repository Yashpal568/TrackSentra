import { z } from 'zod';

export const createShiftSchema = z.object({
  body: z.object({
    siteId: z.string(),
    guardId: z.string(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    notes: z.string().optional(),
  }),
}).refine(data => new Date(data.body.startTime) < new Date(data.body.endTime), {
  message: "endTime must be after startTime",
  path: ["body", "endTime"],
});

export const updateShiftSchema = z.object({
  body: z.object({
    siteId: z.string().optional(),
    guardId: z.string().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
    notes: z.string().optional(),
  }),
});
