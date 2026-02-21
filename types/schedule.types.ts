import { z } from 'zod';
import {
  dayAssignmentSchema,
  custodyScheduleTermsSchema,
  holidayScheduleSchema,
  scheduleSwapRequestSchema,
} from '../schemas/schedule.schema';

// Infer TypeScript types from Zod schemas
export type DayAssignment = z.infer<typeof dayAssignmentSchema>;
export type CustodyScheduleTerms = z.infer<typeof custodyScheduleTermsSchema>;
export type HolidaySchedule = z.infer<typeof holidayScheduleSchema>;
export type ScheduleSwapRequest = z.infer<typeof scheduleSwapRequestSchema>;
