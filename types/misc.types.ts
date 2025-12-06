import { z } from 'zod';
import {
  assetSchema,
  notificationTypeSchema,
  notificationSchema,
  inviteSchema,
  documentSchema,
  parsedAgreementDataSchema,
  agreementSchema,
} from '../schemas/misc.schema';

// Infer TypeScript types from Zod schemas
export type Asset = z.infer<typeof assetSchema>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type Invite = z.infer<typeof inviteSchema>;
export type Document = z.infer<typeof documentSchema>;
export type ParsedAgreementData = z.infer<typeof parsedAgreementDataSchema>;
export type Agreement = z.infer<typeof agreementSchema>;
