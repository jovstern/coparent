import { z } from 'zod';

export const assetSchema = z.object({
  id: z.string(),
  agreementId: z.string(),
  name: z.string(),
  type: z.enum(['property', 'vehicle', 'investment', 'other']),
  description: z.string().optional(),
  estimatedValue: z.number().optional(),
  currency: z.string().optional(),
  saleDeadline: z.any().optional(), // Firestore Timestamp
  status: z.enum(['active', 'sold', 'transferred']),
  notes: z.string().optional(),
});

export const notificationTypeSchema = z.enum([
  'expense_added',
  'swap_request',
  'swap_approved',
  'swap_rejected',
  'split_ratio_changed',
  'payment_due',
  'cpi_update',
  'document_uploaded',
  'system',
]);

export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  agreementId: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  data: z.record(z.string(), z.any()).optional(),
  isRead: z.boolean(),
  createdAt: z.any(), // Firestore Timestamp
  actionUrl: z.string().optional(),
});

export const inviteSchema = z.object({
  id: z.string(),
  agreementId: z.string(),
  createdBy: z.string(),
  email: z.string().email(),
  role: z.enum(['parent']),
  status: z.enum(['pending', 'accepted', 'expired']),
  token: z.string(),
  expiresAt: z.any(), // Firestore Timestamp
  createdAt: z.any(), // Firestore Timestamp
  acceptedAt: z.any().optional(), // Firestore Timestamp
});

export const documentSchema = z.object({
  id: z.string(),
  agreementId: z.string(),
  uploadedBy: z.string(),
  name: z.string(),
  type: z.enum(['agreement', 'court_order', 'receipt', 'medical', 'other']),
  url: z.string(),
  size: z.number(),
  mimeType: z.string(),
  uploadedAt: z.any(), // Firestore Timestamp
  metadata: z.record(z.string(), z.any()).optional(),
});

export const parsedAgreementDataSchema = z.object({
  custodySchedule: z.any(), // Will reference custodyScheduleTermsSchema
  financialTerms: z.any(), // Will reference financialTermsSchema
  holidays: z.array(z.any()), // Will reference holidayScheduleSchema
  specialProvisions: z.array(z.string()).optional(),
  assets: z.array(assetSchema).optional(),
});

export const agreementSchema = z.object({
  id: z.string(),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(), // Firestore Timestamp
  parent1Id: z.string(),
  parent2Id: z.string(),
  children: z.array(z.string()),
  status: z.enum(['active', 'pending', 'archived']),
  originalDocumentUrl: z.string().optional(),
  parsedData: parsedAgreementDataSchema,
});
