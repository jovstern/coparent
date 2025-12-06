import { z } from 'zod';

// Child Support Schema
export const childSupportSchema = z.object({
  amount: z.number().nullable(),
  currency: z.string(),
  frequency: z.enum(['monthly', 'weekly', 'biweekly', 'annual']),
  isCPILinked: z.boolean(),
  startDate: z.string().nullable(),
  notes: z.string().nullable(),
});

// Expense Split Schemas
export const expenseSplitItemSchema = z.object({
  parent1: z.number().min(0).max(100),
  parent2: z.number().min(0).max(100),
});

export const expenseSplitSchema = z.object({
  default: expenseSplitItemSchema,
  medical: expenseSplitItemSchema.optional(),
  education: expenseSplitItemSchema.optional(),
  extracurricular: expenseSplitItemSchema.optional(),
  notes: z.string().nullable(),
});

// Custody Schedule Schema
export const custodyScheduleSchema = z.object({
  type: z.enum(['weekly', 'biweekly', 'custom']),
  cycleDuration: z.number(),
  parent1Days: z.array(z.string()),
  parent2Days: z.array(z.string()),
  description: z.string(),
  transitionDetails: z.string().nullable(),
});

// Holiday Schema
export const holidaySchema = z.object({
  name: z.string(),
  year: z.number().nullable(),
  assignedTo: z.enum(['parent1', 'parent2', 'alternating']),
  notes: z.string().nullable(),
});

// Child Schema
export const childSchema = z.object({
  firstName: z.string(),
  lastName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  age: z.number().nullable(),
});

// Extraction Metadata Schema
export const extractionMetadataSchema = z.object({
  confidenceScore: z.number().min(0).max(100),
  warnings: z.array(z.string()),
  fieldsExtracted: z.array(z.string()),
  fieldsNotFound: z.array(z.string()),
});

// Main Agreement Data Schema
export const agreementDataSchema = z.object({
  childSupport: childSupportSchema,
  expenseSplit: expenseSplitSchema,
  custodySchedule: custodyScheduleSchema,
  holidays: z.array(holidaySchema),
  children: z.array(childSchema),
  specialProvisions: z.array(z.string()),
  extractionMetadata: extractionMetadataSchema,
});
