import { z } from 'zod';
import {
  childSupportTermsSchema,
  expenseSplitTermsSchema,
  recurringPaymentSchema,
  financialTermsSchema,
  expenseCategorySchema,
  expenseSchema,
  transactionSchema,
  balanceSchema,
} from '../schemas/financial.schema';

// Infer TypeScript types from Zod schemas
export type ChildSupportTerms = z.infer<typeof childSupportTermsSchema>;
export type ExpenseSplitTerms = z.infer<typeof expenseSplitTermsSchema>;
export type RecurringPayment = z.infer<typeof recurringPaymentSchema>;
export type FinancialTerms = z.infer<typeof financialTermsSchema>;
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type Balance = z.infer<typeof balanceSchema>;
