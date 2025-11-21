import { Timestamp } from 'firebase/firestore';

// User & Parent Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'parent';
  agreementId: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

export interface Parent {
  id: string;
  userId: string;
  agreementId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
}

// Child Information
export interface Child {
  id: string;
  agreementId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Timestamp;
  bloodType?: string;
  healthInsurance?: string;
  medicalNotes?: string;
  emergencyContacts: EmergencyContact[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

// Agreement & Contract Types
export interface Agreement {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  parent1Id: string;
  parent2Id: string;
  children: string[]; // Child IDs
  status: 'active' | 'pending' | 'archived';
  originalDocumentUrl?: string;
  parsedData: ParsedAgreementData;
}

export interface ParsedAgreementData {
  custodySchedule: CustodySchedule;
  financialTerms: FinancialTerms;
  holidays: HolidaySchedule[];
  specialProvisions?: string[];
  assets?: Asset[];
}

// Custody & Schedule Types
export interface CustodySchedule {
  type: 'weekly' | 'biweekly' | 'custom';
  baseSchedule: DayAssignment[];
  cycleDuration: number; // in days
}

export interface DayAssignment {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  parentId: string;
  pickupTime?: string;
  dropoffTime?: string;
  location?: string;
  notes?: string;
}

export interface HolidaySchedule {
  id: string;
  name: string;
  date: string; // ISO date string or recurring pattern
  assignedParentId: string;
  isRecurring: boolean;
  pickupTime?: string;
  dropoffTime?: string;
  notes?: string;
}

export interface ScheduleSwapRequest {
  id: string;
  agreementId: string;
  requestedBy: string; // Parent ID
  requestedFrom: string; // Parent ID
  date: string; // ISO date
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  createdAt: Timestamp;
  respondedAt?: Timestamp;
}

// Financial Types
export interface FinancialTerms {
  childSupport: ChildSupport;
  expenseSplit: ExpenseSplit;
  recurringPayments: RecurringPayment[];
}

export interface ChildSupport {
  amount: number;
  currency: string;
  frequency: 'monthly' | 'biweekly' | 'weekly';
  payerParentId: string;
  receiverParentId: string;
  isCPILinked: boolean;
  baseDate?: Timestamp;
  lastCPIUpdate?: Timestamp;
}

export interface ExpenseSplit {
  ratio: number; // 0-1 (e.g., 0.5 = 50/50, 0.3 = 30/70)
  parent1Percentage: number;
  parent2Percentage: number;
  effectiveDate: Timestamp;
  previousSplits?: ExpenseSplitHistory[];
}

export interface ExpenseSplitHistory {
  ratio: number;
  parent1Percentage: number;
  parent2Percentage: number;
  effectiveDate: Timestamp;
  endDate: Timestamp;
  changedBy: string; // User ID
}

export interface RecurringPayment {
  id: string;
  agreementId: string;
  description: string;
  amount: number;
  currency: string;
  frequency: 'monthly' | 'quarterly' | 'annually';
  payerParentId: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  lastPaid?: Timestamp;
  nextDue?: Timestamp;
}

// Expense Types
export interface Expense {
  id: string;
  agreementId: string;
  addedBy: string; // Parent ID
  date: Timestamp;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  receiptUrl?: string;
  splitRatio: number; // Split ratio at time of expense
  parent1Share: number;
  parent2Share: number;
  status: 'pending' | 'approved' | 'disputed' | 'settled';
  settledAt?: Timestamp;
  notes?: string;
}

export type ExpenseCategory =
  | 'medical'
  | 'education'
  | 'clothing'
  | 'extracurricular'
  | 'childcare'
  | 'other';

export interface Balance {
  agreementId: string;
  parent1Id: string;
  parent2Id: string;
  parent1Owes: number; // Positive means parent1 owes parent2
  parent2Owes: number; // Positive means parent2 owes parent1
  currency: string;
  lastUpdated: Timestamp;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'expense' | 'payment' | 'child_support';
  amount: number;
  currency: string;
  fromParentId: string;
  toParentId: string;
  relatedExpenseId?: string;
  date: Timestamp;
  description: string;
  status: 'completed' | 'pending' | 'cancelled';
}

// Asset Types
export interface Asset {
  id: string;
  agreementId: string;
  name: string;
  type: 'property' | 'vehicle' | 'investment' | 'other';
  description?: string;
  estimatedValue?: number;
  currency?: string;
  saleDeadline?: Timestamp;
  status: 'active' | 'sold' | 'transferred';
  notes?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  agreementId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Timestamp;
  actionUrl?: string;
}

export type NotificationType =
  | 'expense_added'
  | 'swap_request'
  | 'swap_approved'
  | 'swap_rejected'
  | 'split_ratio_changed'
  | 'payment_due'
  | 'cpi_update'
  | 'document_uploaded'
  | 'system';

// Invite Types
export interface Invite {
  id: string;
  agreementId: string;
  createdBy: string; // User ID
  email: string;
  role: 'parent';
  status: 'pending' | 'accepted' | 'expired';
  token: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  acceptedAt?: Timestamp;
}

// Document Types
export interface Document {
  id: string;
  agreementId: string;
  uploadedBy: string; // User ID
  name: string;
  type: 'agreement' | 'court_order' | 'receipt' | 'medical' | 'other';
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Timestamp;
  metadata?: Record<string, any>;
}
