# Schema Architecture Guide

## Overview

This document explains the schema system in the CoParent application, how different schemas relate to each other, and best practices for maintaining them.

---

## Schema Types & Purposes

### 1. Zod Schemas (`schemas/`)
**Purpose**: Runtime validation, type generation, source of truth

**Location**: `schemas/*.schema.ts`

**What They Do**:
- Validate data at runtime (e.g., API responses, form inputs)
- Generate TypeScript types automatically
- Provide detailed error messages when validation fails
- Document expected data structure with `.describe()`

**Example**:
```typescript
// schemas/agreement.schema.ts
export const childSupportSchema = z.object({
  amount: z.number().nullable().describe('Monthly child support amount'),
  currency: z.string().describe('Currency code (ILS, USD, EUR, etc.)'),
  frequency: z.enum(['monthly', 'weekly', 'biweekly', 'annual']),
  isCPILinked: z.boolean(),
  startDate: z.string().nullable(),
  notes: z.string().nullable(),
});
```

### 2. Gemini Schemas (`schemas/gemini-schema.ts`)
**Purpose**: Instruct Gemini API on JSON output format

**What They Do**:
- Tell Gemini what structure to generate
- Define field types, descriptions, requirements
- Use Gemini's specific format (SchemaType enums)

**Example**:
```typescript
// schemas/gemini-schema.ts
export const extractionSchemaGemini = {
  type: SchemaType.OBJECT,
  properties: {
    childSupport: {
      type: SchemaType.OBJECT,
      description: 'Financial child support obligations',
      properties: {
        amount: {
          type: SchemaType.NUMBER,
          description: 'Monthly child support amount',
          nullable: true,
        },
        currency: {
          type: SchemaType.STRING,
          description: 'Currency code (ILS, USD, EUR, etc.)',
        },
        // ...
      },
      required: ['currency', 'frequency', 'isCPILinked'],
    },
  },
};
```

### 3. TypeScript Types (`types/`)
**Purpose**: Compile-time type checking in application code

**What They Do**:
- Provide autocomplete in IDEs
- Catch type errors at compile time
- Mirror Zod schemas exactly

**Example**:
```typescript
// types/agreement.types.ts
export type ChildSupport = {
  amount: number | null;
  currency: string;
  frequency: 'monthly' | 'weekly' | 'biweekly' | 'annual';
  isCPILinked: boolean;
  startDate: string | null;
  notes: string | null;
};
```

---

## Schema Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                    SOURCE OF TRUTH                                │
│                   schemas/*.schema.ts                             │
│                    (Zod Schemas)                                  │
└──────────┬───────────────────────────────────┬───────────────────┘
           │                                   │
           │ Manual Sync                       │ Used for validation
           ↓                                   ↓
┌────────────────────────┐         ┌────────────────────────┐
│  schemas/              │         │  Cloud Functions        │
│  gemini-schema.ts      │         │  Frontend Code          │
│                        │         │                         │
│  (Gemini Format)       │         │  agreementDataSchema   │
│                        │         │  .parse(data)           │
└────────┬───────────────┘         └─────────────────────────┘
         │
         │ Sent to Gemini API
         ↓
┌────────────────────────┐
│   Google Gemini AI     │
│                        │
│   Generates JSON       │
│   matching schema      │
└────────────────────────┘
         │
         │ Returns JSON
         ↓
┌────────────────────────┐
│   Zod Validation       │
│                        │
│   agreementDataSchema  │
│   .parse(response)     │
└────────┬───────────────┘
         │
         │ If valid
         ↓
┌────────────────────────┐         ┌────────────────────────┐
│   TypeScript Types     │←────────│   Application Code     │
│   types/*.types.ts     │  Uses   │   (Frontend/Backend)   │
└────────────────────────┘         └────────────────────────┘
```

---

## All Schemas in the Project

### Agreement Schemas (`schemas/agreement.schema.ts`)

#### childSupportSchema
Defines child support payment structure.

**Fields**:
- `amount` - Monthly payment (nullable for TBD cases)
- `currency` - ILS, USD, EUR, etc.
- `frequency` - monthly | weekly | biweekly | annual
- `isCPILinked` - Boolean, whether indexed to inflation
- `startDate` - ISO format YYYY-MM-DD (nullable)
- `notes` - Additional context (nullable)

**Used by**: Agreement parsing, payment calculations

---

#### expenseSplitSchema
Defines how expenses are split between parents.

**Fields**:
- `default` - Base split (e.g., 50/50, 60/40)
  - `parent1` - Percentage (0-100)
  - `parent2` - Percentage (0-100)
- `medical` - Medical expense split (optional)
- `education` - Education expense split (optional)
- `extracurricular` - Activity expense split (optional)
- `notes` - Additional context (nullable)

**Validation**: Parent1 + Parent2 must equal 100

**Used by**: Expense tracking, automatic split calculations

---

#### custodyScheduleSchema
Defines custody arrangement pattern.

**Fields**:
- `type` - weekly | biweekly | custom
- `cycleDuration` - Number of days in cycle (7, 14, or custom)
- `parent1Days` - Array of weekday names (e.g., ["Monday", "Tuesday"])
- `parent2Days` - Array of weekday names
- `description` - Human-readable summary
- `transitionDetails` - Time, location, special instructions (nullable)

**Used by**: Calendar generation, schedule swaps

---

#### holidaySchema
Defines holiday custody arrangement.

**Fields**:
- `name` - Holiday name (e.g., "Thanksgiving", "Hanukkah")
- `year` - Specific year if mentioned (nullable)
- `assignedTo` - parent1 | parent2 | alternating
- `notes` - Special arrangements (nullable)

**Used by**: Calendar holiday display

---

#### childSchema
Defines child information.

**Fields**:
- `firstName` - Required
- `lastName` - (nullable)
- `dateOfBirth` - ISO format YYYY-MM-DD (nullable)
- `age` - Calculated or provided (nullable)

**Used by**: Dashboard, expense tracking, schedule generation

---

#### extractionMetadataSchema
Tracks AI extraction quality.

**Fields**:
- `confidenceScore` - 0-100, overall extraction confidence
- `warnings` - Array of issues found (e.g., "Ambiguous date in section 3")
- `fieldsExtracted` - Array of successfully extracted field names
- `fieldsNotFound` - Array of missing field names

**Used by**: Quality assurance, user review prompts

---

#### agreementDataSchema
Top-level schema combining all agreement data.

**Fields**:
- `childSupport` - childSupportSchema
- `expenseSplit` - expenseSplitSchema
- `custodySchedule` - custodyScheduleSchema
- `holidays` - Array of holidaySchema
- `children` - Array of childSchema
- `specialProvisions` - Array of strings
- `extractionMetadata` - extractionMetadataSchema

**Used by**: Everything - this is the complete agreement structure

---

### User Schemas (`schemas/user.schema.ts`)

#### userSchema
Core user profile.

**Fields**:
- `id` - Firebase Auth UID
- `email` - Email address
- `displayName` - Full name
- `photoURL` - Profile picture (optional)
- `role` - admin | parent
- `agreementId` - Link to agreement document (optional)
- `hasCompletedOnboarding` - Boolean
- `createdAt` - Firestore Timestamp
- `lastLogin` - Firestore Timestamp

---

#### parentSchema
Extended parent information.

**Fields**:
- `id`, `userId`, `agreementId`
- `firstName`, `lastName`, `email`, `phone`
- `address` - Complete address object
- `createdAt`, `updatedAt`

---

#### childInfoSchema
Detailed child information (different from childSchema).

**Fields**:
- All fields from childSchema, plus:
- `bloodType` - A+, O-, etc. (optional)
- `healthInsurance` - Insurance details (optional)
- `medicalNotes` - Allergies, conditions (optional)
- `emergencyContacts` - Array of contact objects

---

### Financial Schemas (`schemas/financial.schema.ts`)

#### expenseSchema
Individual expense entry.

**Fields**:
- `id`, `agreementId`, `addedBy`, `date`
- `category` - medical | education | clothing | extracurricular | childcare | other
- `description` - What was purchased
- `amount`, `currency`
- `receiptUrl` - Link to receipt image (optional)
- `splitRatio` - 0-1 (e.g., 0.5 for 50/50, 0.6 for 60/40)
- `parent1Share`, `parent2Share` - Calculated amounts
- `status` - pending | approved | disputed | settled
- `settledAt` - Timestamp (optional)
- `notes` - Additional context (optional)

**Relationships**:
- `agreementId` → agreements/{agreementId}
- `addedBy` → users/{userId}

---

#### balanceSchema
Running balance between parents.

**Fields**:
- `agreementId`
- `parent1Id`, `parent2Id`
- `parent1Owes`, `parent2Owes` - Current amounts
- `currency`
- `lastUpdated` - Timestamp
- `transactions` - Array of transaction history

**Relationships**:
- `agreementId` → agreements/{agreementId}
- Updated by expense triggers

---

#### transactionSchema
Individual payment/expense transaction.

**Fields**:
- `id`, `type` - expense | payment | child_support
- `amount`, `currency`
- `fromParentId`, `toParentId`
- `relatedExpenseId` - Link to expense (optional)
- `date`, `description`
- `status` - completed | pending | cancelled

---

### Schedule Schemas (`schemas/schedule.schema.ts`)

#### scheduleSwapRequestSchema
Custody schedule change request.

**Fields**:
- `id`, `agreementId`
- `requestedBy`, `requestedFrom`
- `originalDate` - Date to swap
- `proposedDate` - Proposed alternative (optional)
- `reason` - Why swap is needed
- `status` - pending | approved | denied
- `respondedAt` - Timestamp (optional)
- `notes` - Response message (optional)

**Relationships**:
- `agreementId` → agreements/{agreementId}
- `requestedBy` → users/{userId}

---

### Miscellaneous Schemas (`schemas/misc.schema.ts`)

#### notificationSchema
User notifications.

**Fields**:
- `id`, `userId`, `agreementId`
- `type` - expense_added | swap_request | split_changed | payment_due
- `title`, `message`
- `data` - Additional context as key-value object (optional)
- `isRead` - Boolean
- `createdAt` - Firestore Timestamp
- `actionUrl` - Deep link to relevant page (optional)

---

#### inviteSchema
Co-parent invitation.

**Fields**:
- `id`, `agreementId`, `createdBy`
- `email` - Invitee email
- `role` - Always 'parent'
- `status` - pending | accepted | expired
- `token` - Unique invite token
- `expiresAt`, `createdAt`, `acceptedAt`

---

#### documentSchema
Stored document metadata.

**Fields**:
- `id`, `agreementId`, `uploadedBy`
- `name`, `type` - agreement | court_order | receipt | medical | other
- `url` - Storage URL
- `size` - File size in bytes
- `mimeType` - application/pdf, image/jpeg, etc.
- `uploadedAt` - Timestamp
- `metadata` - Additional key-value data (optional)

---

## Gemini Schema Structure

**File**: `schemas/gemini-schema.ts`

### Format Differences from Zod

| Aspect | Zod | Gemini |
|--------|-----|--------|
| Type Syntax | `z.string()` | `type: SchemaType.STRING` |
| Objects | `z.object({})` | `type: SchemaType.OBJECT, properties: {}` |
| Arrays | `z.array(z.string())` | `type: SchemaType.ARRAY, items: { type: SchemaType.STRING }` |
| Nullable | `.nullable()` | `nullable: true` |
| Enums | `z.enum(['a', 'b'])` | `enum: ['a', 'b']` |
| Optional | `.optional()` | Omit from `required: []` |
| Description | `.describe('...')` | `description: '...'` |

### Schema Constants

```typescript
const SchemaType = {
  OBJECT: 'OBJECT',
  ARRAY: 'ARRAY',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
} as const;
```

### Structure

```typescript
export const extractionSchemaGemini = {
  type: SchemaType.OBJECT,           // Root is always OBJECT
  properties: {                      // Define all top-level fields
    childSupport: { ... },
    expenseSplit: { ... },
    // ...
  },
  required: [                        // List required field names
    'childSupport',
    'expenseSplit',
    'custodySchedule',
    // ...
  ],
};
```

---

## How Schemas Work Together

### Example: Adding an Expense

```
1. User submits form in frontend
   ↓
2. Frontend validates with expenseSchema.parse(formData)
   ↓
3. If valid, create Firestore document
   ↓
4. Firestore trigger: notifyExpenseAdded
   ↓
5. Function validates expense with expenseSchema
   ↓
6. Creates notification using notificationSchema
   ↓
7. Frontend queries notifications
   ↓
8. Validates with notificationSchema.parse(doc.data())
   ↓
9. Displays notification with TypeScript types
```

### Example: AI Agreement Parsing

```
1. User uploads PDF
   ↓
2. analyzeAgreement function called
   ↓
3. Function sends PDF + extractionSchemaGemini to Gemini
   ↓
4. Gemini generates JSON following the schema structure
   ↓
5. Function receives JSON response
   ↓
6. Validates with agreementDataSchema.parse(jsonData)
   ↓
7. If validation passes, save to Firestore
   ↓
8. Frontend fetches agreement
   ↓
9. Uses TypeScript types for type-safe access
```

---

## Maintenance Best Practices

### When Adding a New Field

**Example**: Add `paymentMethod` to child support

1. **Update Zod Schema** (source of truth):
```typescript
// schemas/agreement.schema.ts
export const childSupportSchema = z.object({
  // ... existing fields
  paymentMethod: z.enum(['bank_transfer', 'check', 'cash']).optional()
    .describe('How payment is made'),
});
```

2. **Update Gemini Schema** (manual sync):
```typescript
// schemas/gemini-schema.ts
childSupport: {
  properties: {
    // ... existing properties
    paymentMethod: {
      type: SchemaType.STRING,
      enum: ['bank_transfer', 'check', 'cash'],
      description: 'How payment is made',
      nullable: true,
    },
  }
}
```

3. **Update TypeScript Types**:
```typescript
// types/agreement.types.ts
export type ChildSupport = {
  // ... existing fields
  paymentMethod?: 'bank_transfer' | 'check' | 'cash';
};
```

4. **Rebuild**:
```bash
cd functions && npm run build
```

5. **Deploy**:
```bash
firebase deploy --only functions:analyzeAgreement
```

6. **Update Firestore Rules** (if needed):
```javascript
// firestore.rules - add validation
match /agreements/{agreementId} {
  allow write: if
    // ... existing rules
    request.resource.data.parsedData.childSupport.paymentMethod
      is string;
}
```

---

### When Changing Field Types

**Example**: Change `amount` from `number` to `string` (bad idea, but for demo)

**⚠️ BREAKING CHANGE - Requires Migration**

1. **Create Migration Function**:
```typescript
// functions/src/migrations/migrateAmountToString.ts
export const migrateAmountToString = functions.pubsub
  .schedule('once')
  .onRun(async () => {
    const snapshot = await db.collection('agreements').get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (typeof data.parsedData.childSupport.amount === 'number') {
        await doc.ref.update({
          'parsedData.childSupport.amount':
            String(data.parsedData.childSupport.amount)
        });
      }
    }
  });
```

2. **Deploy Migration**:
```bash
firebase deploy --only functions:migrateAmountToString
```

3. **Run Migration**:
```bash
gcloud scheduler jobs run migrateAmountToString
```

4. **Verify Migration** (check all docs updated)

5. **Update Schemas** (Zod, Gemini, TypeScript)

6. **Deploy Updated Functions**

**Best Practice**: Avoid type changes. Add new fields instead:
- Old: `amount: number`
- New: `amountString: string`
- Deprecated: `amount` (keep for backward compatibility)

---

### When Removing a Field

**Example**: Remove `notes` from childSupportSchema

**⚠️ SOFT DELETE - Don't Actually Remove**

Instead of removing, mark as deprecated:

```typescript
// schemas/agreement.schema.ts
export const childSupportSchema = z.object({
  // ... existing fields

  // @deprecated - Use specialProvisions instead
  notes: z.string().nullable().optional(),
});
```

**Why?**
- Existing agreements in Firestore still have this field
- Old versions of the app might still use it
- Easier to recover if mistake

**Timeline for Removal**:
1. Mark deprecated (include removal date in comment)
2. Add replacement field
3. Migrate data
4. Remove from UI
5. Wait 6-12 months
6. Actually remove from schema

---

### Schema Validation Errors

**Common Error**: Zod validation fails

```typescript
Error: Invalid agreement data
  - childSupport.amount: Expected number, received string
  - holidays[0].assignedTo: Invalid enum value
```

**Debugging Steps**:

1. **Check Raw Response**:
```typescript
console.log('Raw Gemini response:', result.response.text());
```

2. **Try Parsing with .safeParse()**:
```typescript
const result = agreementDataSchema.safeParse(jsonData);
if (!result.success) {
  console.log('Validation errors:', result.error.format());
}
```

3. **Compare to Schema**:
- Is Gemini returning the wrong type?
- Is the schema too strict?
- Is there a mismatch between Gemini schema and Zod schema?

4. **Update Prompt** (if Gemini is confused):
```typescript
// agents/agreement-analyzer.ts
export const agreementAnalyzerSystemPrompt = `
  // ... existing prompt

  IMPORTANT:
  - amounts must be numbers, not strings
  - assignedTo must be exactly 'parent1', 'parent2', or 'alternating'
  - dates must be YYYY-MM-DD format
`;
```

---

## Schema Testing

### Unit Testing Schemas

```typescript
// schemas/__tests__/agreement.schema.test.ts
import { childSupportSchema } from '../agreement.schema';

describe('childSupportSchema', () => {
  it('should validate valid child support', () => {
    const valid = {
      amount: 1500,
      currency: 'ILS',
      frequency: 'monthly',
      isCPILinked: true,
      startDate: '2024-01-01',
      notes: null,
    };

    expect(() => childSupportSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid frequency', () => {
    const invalid = {
      amount: 1500,
      currency: 'ILS',
      frequency: 'yearly',  // Invalid enum value
      isCPILinked: true,
      startDate: null,
      notes: null,
    };

    expect(() => childSupportSchema.parse(invalid)).toThrow();
  });
});
```

### Integration Testing

```typescript
// Test agreement parsing end-to-end
import { analyzeAgreement } from '../functions/src/analyzeAgreement';

describe('analyzeAgreement', () => {
  it('should parse valid agreement PDF', async () => {
    const testPdfUrl = 'https://storage.googleapis.com/test.pdf';
    const result = await analyzeAgreement({
      fileUrl: testPdfUrl,
      userId: 'test-user'
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('childSupport');
    expect(result.data.extractionMetadata.confidenceScore).toBeGreaterThan(50);
  });
});
```

---

## Quick Reference

### Schema Files

| File | Purpose | Used By |
|------|---------|---------|
| `schemas/agreement.schema.ts` | Agreement structure (Zod) | Functions, frontend validation |
| `schemas/user.schema.ts` | User profiles (Zod) | Auth, user management |
| `schemas/financial.schema.ts` | Expenses, balances (Zod) | Wallet, expense tracking |
| `schemas/schedule.schema.ts` | Custody schedules (Zod) | Calendar, swaps |
| `schemas/misc.schema.ts` | Notifications, invites (Zod) | All features |
| `schemas/gemini-schema.ts` | AI response format | analyzeAgreement function |
| `types/agreement.types.ts` | TypeScript types | All application code |
| `types/user.types.ts` | TypeScript types | All application code |
| `types/financial.types.ts` | TypeScript types | All application code |

### Commands

```bash
# Rebuild functions after schema changes
cd functions && npm run build

# Deploy updated function
firebase deploy --only functions:analyzeAgreement

# Test schema locally
npm test schemas

# Validate Firestore data against schema
firebase emulators:start
```

---

**Last Updated**: December 2025
**Version**: 1.0
