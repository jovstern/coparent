import { z } from 'zod';

export const dayAssignmentSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  parentId: z.string(),
  pickupTime: z.string().optional(),
  dropoffTime: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const custodyScheduleTermsSchema = z.object({
  type: z.enum(['weekly', 'biweekly', 'custom']),
  baseSchedule: z.array(dayAssignmentSchema),
  cycleDuration: z.number(),
});

export const holidayScheduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  assignedParentId: z.string(),
  isRecurring: z.boolean(),
  pickupTime: z.string().optional(),
  dropoffTime: z.string().optional(),
  notes: z.string().optional(),
});

export const scheduleSwapRequestSchema = z.object({
  id: z.string(),
  agreementId: z.string(),
  requestedBy: z.string(),
  requestedFrom: z.string(),
  date: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  reason: z.string().optional(),
  createdAt: z.any(), // Firestore Timestamp
  respondedAt: z.any().optional(), // Firestore Timestamp
});
