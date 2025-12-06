import { z } from 'zod';

// Child Support Schema
export const childSupportSchema = z.object({
  amount: z.number().nullable().describe('Monthly child support amount in the specified currency'),
  currency: z.string().describe('Currency code (ILS, USD, EUR, etc.)'),
  frequency: z.enum(['monthly', 'weekly', 'biweekly', 'annual']).describe('Payment frequency'),
  isCPILinked: z.boolean().describe('Whether payments are linked to consumer price index'),
  startDate: z.string().nullable().describe('Start date in ISO format (YYYY-MM-DD)'),
  notes: z.string().nullable().describe('Additional notes about child support'),
}).describe('Financial child support obligations including amount, currency, payment frequency, CPI linkage, and start date');

// Expense Split Schemas
export const expenseSplitItemSchema = z.object({
  parent1: z.number().min(0).max(100).describe('Parent 1 percentage (0-100)'),
  parent2: z.number().min(0).max(100).describe('Parent 2 percentage (0-100)'),
});

export const expenseSplitSchema = z.object({
  default: expenseSplitItemSchema.describe('Default expense split percentages'),
  medical: expenseSplitItemSchema.optional().describe('Medical expense split percentages'),
  education: expenseSplitItemSchema.optional().describe('Education expense split percentages'),
  extracurricular: expenseSplitItemSchema.optional().describe('Extracurricular activity expense split percentages'),
  notes: z.string().nullable().describe('Additional notes about expense splitting'),
}).describe('How expenses are split between parents, with percentages for each parent');

// Custody Schedule Schema
export const custodyScheduleSchema = z.object({
  type: z.enum(['weekly', 'biweekly', 'custom']).describe('Schedule pattern type'),
  cycleDuration: z.number().describe('Duration of schedule cycle in days'),
  parent1Days: z.array(z.string()).describe('Days of week parent 1 has custody (e.g., ["Monday", "Tuesday"])'),
  parent2Days: z.array(z.string()).describe('Days of week parent 2 has custody'),
  description: z.string().describe('Human-readable description of the custody schedule'),
  transitionDetails: z.string().nullable().describe('Details about custody transitions (time, location, etc.)'),
}).describe('Custody schedule including type, cycle duration, and which days each parent has custody');

// Holiday Schema
export const holidaySchema = z.object({
  name: z.string().describe('Holiday name'),
  year: z.number().nullable().describe('Specific year if mentioned'),
  assignedTo: z.enum(['parent1', 'parent2', 'alternating']).describe('Which parent has custody for this holiday'),
  notes: z.string().nullable().describe('Additional details about holiday arrangement'),
});

// Child Schema
export const childSchema = z.object({
  firstName: z.string().describe('Child first name'),
  lastName: z.string().nullable().describe('Child last name'),
  dateOfBirth: z.string().nullable().describe('Date of birth in ISO format (YYYY-MM-DD)'),
  age: z.number().nullable().describe('Current age'),
});

// Extraction Metadata Schema
export const extractionMetadataSchema = z.object({
  confidenceScore: z.number().min(0).max(100).describe('Overall confidence score 0-100 based on clarity of extracted information'),
  warnings: z.array(z.string()).describe('List of warnings about ambiguous or conflicting information'),
  fieldsExtracted: z.array(z.string()).describe('List of field names that were successfully extracted'),
  fieldsNotFound: z.array(z.string()).describe('List of field names that were not found in the document'),
}).describe('Metadata about the extraction quality and completeness');

// Main Agreement Data Schema
export const agreementDataSchema = z.object({
  childSupport: childSupportSchema,
  expenseSplit: expenseSplitSchema,
  custodySchedule: custodyScheduleSchema,
  holidays: z.array(holidaySchema).describe('Holiday custody arrangements'),
  children: z.array(childSchema).describe('Information about children covered by this agreement'),
  specialProvisions: z.array(z.string()).describe('Special provisions, restrictions, or requirements mentioned in the agreement'),
  extractionMetadata: extractionMetadataSchema,
});
