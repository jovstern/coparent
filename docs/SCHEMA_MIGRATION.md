# Schema Migration Summary

## Overview
Migrated the project to use Zod schemas for runtime validation and centralized TypeScript type definitions.

## Structure

### `/schemas` (Root Level)
Zod schemas that define the shape and validation rules for all data types:
- `agreement.schema.ts` - Agreement extraction schemas (child support, custody, holidays, etc.)
- `user.schema.ts` - User, Parent, Child info schemas
- `financial.schema.ts` - Financial terms, expenses, transactions, balance schemas
- `schedule.schema.ts` - Custody schedule, day assignments, swap requests
- `misc.schema.ts` - Assets, notifications, invites, documents
- `gemini-schema.ts` - Gemini API schema format (converted from extractionSchema)
- `index.ts` - Re-exports all schemas

### `/types` (Root Level)
TypeScript types inferred from Zod schemas:
- `agreement.types.ts` - Types for agreement extraction
- `user.types.ts` - User and parent types
- `financial.types.ts` - Financial-related types
- `schedule.types.ts` - Schedule-related types
- `misc.types.ts` - Miscellaneous types
- `index.ts` - Re-exports all types

### `/src/types/index.ts`
Updated to re-export from the centralized `/types` folder for backward compatibility.

## Benefits

1. **Single Source of Truth**: All schemas in one place at the root level
2. **Runtime Validation**: Zod provides validation at runtime
3. **Type Safety**: TypeScript types are inferred from schemas, ensuring they match
4. **Maintainability**: Changes to schemas automatically update types
5. **Reusability**: Both frontend and functions can import the same schemas

## Usage

### Import Schemas
```typescript
import { agreementDataSchema, userSchema } from '../schemas';
```

### Import Types
```typescript
import { AgreementData, User } from '../types';
```

### Validate Data
```typescript
import { agreementDataSchema } from '../schemas';

const data = agreementDataSchema.parse(jsonData); // Throws if invalid
// or
const result = agreementDataSchema.safeParse(jsonData); // Returns { success, data, error }
```

## Migration Notes

- The `extractionSchema` from `functions/src/analyzeAgreement.ts` has been converted to:
  - Zod schema: `/schemas/agreement.schema.ts`
  - Gemini format: `/schemas/gemini-schema.ts`
- The function now validates responses with Zod before saving to Firestore
- All types in `/src/types/index.ts` now come from the centralized `/types` folder
