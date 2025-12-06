import { z } from 'zod';
import {
  childSupportSchema,
  expenseSplitSchema,
  expenseSplitItemSchema,
  custodyScheduleSchema,
  holidaySchema,
  childSchema,
  extractionMetadataSchema,
  agreementDataSchema,
} from '../schemas/agreement.schema';

// Infer TypeScript types from Zod schemas
export type ChildSupport = z.infer<typeof childSupportSchema>;
export type ExpenseSplitItem = z.infer<typeof expenseSplitItemSchema>;
export type ExpenseSplit = z.infer<typeof expenseSplitSchema>;
export type CustodySchedule = z.infer<typeof custodyScheduleSchema>;
export type Holiday = z.infer<typeof holidaySchema>;
export type Child = z.infer<typeof childSchema>;
export type ExtractionMetadata = z.infer<typeof extractionMetadataSchema>;
export type AgreementData = z.infer<typeof agreementDataSchema>;
