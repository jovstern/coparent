import { z } from 'zod';

export const childSupportTermsSchema = z.object({
  amount: z.number(),
  currency: z.string(),
  frequency: z.enum(['monthly', 'biweekly', 'weekly']),
  payerParentId: z.string(),
  receiverParentId: z.string(),
  isCPILinked: z.boolean(),
  baseDate: z.any().optional(), // Firestore Timestamp
  lastCPIUpdate: z.any().optional(), // Firestore Timestamp
});

export const expenseSplitTermsSchema = z.object({
  ratio: z.number().min(0).max(1),
  parent1Percentage: z.number().min(0).max(100),
  parent2Percentage: z.number().min(0).max(100),
  effectiveDate: z.any(), // Firestore Timestamp
  previousSplits: z.array(z.object({
    ratio: z.number(),
    parent1Percentage: z.number(),
    parent2Percentage: z.number(),
    effectiveDate: z.any(), // Firestore Timestamp
    endDate: z.any(), // Firestore Timestamp
    changedBy: z.string(),
  })).optional(),
});

export const recurringPaymentSchema = z.object({
  id: z.string(),
  agreementId: z.string(),
  description: z.string(),
  amount: z.number(),
  currency: z.string(),
  frequency: z.enum(['monthly', 'quarterly', 'annually']),
  payerParentId: z.string(),
  startDate: z.any(), // Firestore Timestamp
  endDate: z.any().optional(), // Firestore Timestamp
  lastPaid: z.any().optional(), // Firestore Timestamp
  nextDue: z.any().optional(), // Firestore Timestamp
});

export const financialTermsSchema = z.object({
  childSupport: childSupportTermsSchema,
  expenseSplit: expenseSplitTermsSchema,
  recurringPayments: z.array(recurringPaymentSchema),
});

export const expenseCategorySchema = z.enum([
  'medical',
  'education',
  'clothing',
  'extracurricular',
  'childcare',
  'other',
]);

export const expenseSchema = z.object({
  id: z.string(),
  agreementId: z.string(),
  addedBy: z.string(),
  date: z.any(), // Firestore Timestamp
  category: expenseCategorySchema,
  description: z.string(),
  amount: z.number(),
  currency: z.string(),
  receiptUrl: z.string().optional(),
  splitRatio: z.number(),
  parent1Share: z.number(),
  parent2Share: z.number(),
  status: z.enum(['pending', 'approved', 'disputed', 'settled']),
  settledAt: z.any().optional(), // Firestore Timestamp
  notes: z.string().optional(),
});

export const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(['expense', 'payment', 'child_support']),
  amount: z.number(),
  currency: z.string(),
  fromParentId: z.string(),
  toParentId: z.string(),
  relatedExpenseId: z.string().optional(),
  date: z.any(), // Firestore Timestamp
  description: z.string(),
  status: z.enum(['completed', 'pending', 'cancelled']),
});

export const balanceSchema = z.object({
  agreementId: z.string(),
  parent1Id: z.string(),
  parent2Id: z.string(),
  parent1Owes: z.number(),
  parent2Owes: z.number(),
  currency: z.string(),
  lastUpdated: z.any(), // Firestore Timestamp
  transactions: z.array(transactionSchema),
});
